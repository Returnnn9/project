import { NextRequest, NextResponse } from 'next/server';
import { normalizeRoad, parseRussianAddress } from '@/lib/address';

export const dynamic = 'force-dynamic';

const DGIS_KEY = process.env.DGIS_API_KEY || process.env.NEXT_PUBLIC_2GIS_API_KEY;

const NOMINATIM_HEADERS = {
 'User-Agent': 'smislest-delivery-app/1.0 (support@smislest.ru)',
 'Accept-Language': 'ru',
};

function extractFromItem(item: Record<string, unknown>): { road: string; house: string; city: string } | null {
 const addrObj = item.address as Record<string, unknown> | undefined;
 const components = (addrObj?.components as Array<Record<string, unknown>>) || [];

 const streetComp = components.find((c) => c.type === 'street');
 // 2GIS uses type='building' for house numbers in address components
 const houseComp = components.find(
  (c) => c.type === 'building' || c.type === 'street_number' || c.type === 'house'
 );

 const rawStreet = (streetComp?.name as string) || '';
 let road = normalizeRoad(rawStreet);
 let house = (houseComp?.name as string) || (houseComp?.number as string) || '';

 // Try to parse from full_name if components gave nothing
 if ((!road || !house) && item.full_name) {
  const parsed = parseRussianAddress(item.full_name as string);
  if (!road && parsed.road) road = parsed.road;
  if (!house && parsed.house) house = parsed.house;
 }

 // Fallback: building-type item's name IS the house number
 if (!house && item.type === 'building' && item.name) {
  house = item.name as string;
 }

 // Don't let house bleed into road
 if (road && normalizeRoad(house) === road) road = '';

 if (!road && !house) return null;

 const admDiv = item.adm_div as Array<Record<string, unknown>> | undefined;
 const cityFromAdm = admDiv?.find((d) => d.type === 'city')?.name as string || '';
 const city = (addrObj?.city as string) || cityFromAdm || '';

 return { road, house, city };
}

async function tryDGIS(opts: {
 lat: number; lon: number; key: string; radius: number; type?: string;
}): Promise<{ full: string; road: string; house: string; city: string } | null> {
 const params = new URLSearchParams({
  lat: opts.lat.toString(),
  lon: opts.lon.toString(),
  key: opts.key,
  radius: opts.radius.toString(),
  fields: 'items.address,items.name,items.full_name,items.adm_div,items.type',
  lang: 'ru',
  page_size: '5',
 });
 if (opts.type) params.set('type', opts.type);

 const res = await fetch(
  `https://catalog.api.2gis.com/3.0/items/geocode?${params}`,
  { cache: 'no-store', signal: AbortSignal.timeout(5000) }
 );
 if (!res.ok) return null;

 const data = await res.json() as { result?: { items?: Array<Record<string, unknown>> } };
 const items = data?.result?.items || [];

 let best: { road: string; house: string; city: string } | null = null;
 for (const item of items) {
  const extracted = extractFromItem(item);
  if (!extracted) continue;
  if (!best) best = extracted;
  // Stop as soon as we find an item with a house number
  if (extracted.house) { best = extracted; break; }
 }

 if (!best) return null;
 const { road, house, city } = best;
 const full = [road, house].filter(Boolean).join(', ');
 return { full, road, house, city };
}

export async function GET(req: NextRequest) {
 const { searchParams } = new URL(req.url);
 const latParam = searchParams.get('lat');
 const lonParam = searchParams.get('lon');

 if (!latParam || !lonParam) {
  return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
 }

 const lat = parseFloat(latParam);
 const lon = parseFloat(lonParam);

 if (isNaN(lat) || isNaN(lon)) {
  return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
 }

 // ─── 1. 2GIS reverse geocoding (primary) ─────────────────────────────────
 if (DGIS_KEY) {
  try {
   const buildingResult = await tryDGIS({ lat, lon, key: DGIS_KEY, type: 'building', radius: 30 });
   if (buildingResult) {
    return NextResponse.json({ ...buildingResult, lat, lon });
   }

   const anyResult = await tryDGIS({ lat, lon, key: DGIS_KEY, radius: 80 });
   if (anyResult) {
    return NextResponse.json({ ...anyResult, lat, lon });
   }
  } catch {
   console.warn('[Reverse] 2GIS failed, falling back to Nominatim');
  }
 }

 // ─── 2. Nominatim fallback ────────────────────────────────────────────────
 try {
  const params = new URLSearchParams({
   lat: lat.toString(),
   lon: lon.toString(),
   format: 'jsonv2',
   addressdetails: '1',
   // zoom=18 = house-level precision (17 was street-level)
   zoom: '18',
   'accept-language': 'ru',
  });

  const res = await fetch(
   `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
   {
    headers: NOMINATIM_HEADERS,
    cache: 'no-store',
    signal: AbortSignal.timeout(6000),
   }
  );

  if (!res.ok) {
   console.error('[Reverse] Nominatim error:', res.status);
   return NextResponse.json({ error: 'Geocoder error' }, { status: 502 });
  }

  const data = await res.json();
  if (data.error) {
   return NextResponse.json({ error: data.error }, { status: 404 });
  }

  const addr = data.address || {};
  const rawRoad =
   addr.road || addr.pedestrian || addr.path || addr.footway || addr.cycleway || '';
  const road = normalizeRoad(rawRoad);
  let house = addr.house_number || '';
  const city = addr.city || addr.town || addr.village || '';

  if (!house && data.display_name) {
   const parsed = parseRussianAddress(data.display_name);
   if (parsed.house) house = parsed.house;
  }

  const full = [road, house].filter(Boolean).join(', ') ||
   data.display_name?.split(',')[0] || '';

  return NextResponse.json({ full, road, house, city, lat, lon });
 } catch (err) {
  console.error('[Reverse] Error:', err);
  return NextResponse.json({ error: 'Failed' }, { status: 500 });
 }
}
