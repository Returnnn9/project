import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DGIS_KEY = process.env.DGIS_API_KEY || process.env.NEXT_PUBLIC_2GIS_API_KEY;
const YANDEX_KEY = process.env.YANDEX_GEOCODER_KEY || process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

const CITY_CONFIG = {
 'Москва': {
  lat: 55.7558,
  lon: 37.6176,
  dgisPoint: '37.6176,55.7558',
  yandexLL: '37.6176,55.7558'
 },
 'Санкт-Петербург': {
  lat: 59.9343,
  lon: 30.3351,
  dgisPoint: '30.3351,59.9343',
  yandexLL: '30.3351,59.9343'
 },
} as const;

type CityKey = keyof typeof CITY_CONFIG;

function normalizeRoad(name: string): string {
 if (!name) return '';
 return name
  .replace(/^ул\.\s*/i, 'улица ')
  .replace(/^пр-т\s*/i, 'проспект ')
  .replace(/^пр\.\s*/i, 'проспект ')
  .replace(/^пер\.\s*/i, 'переулок ')
  .replace(/^ш\.\s*/i, 'шоссе ')
  .replace(/^б-р\s*/i, 'бульвар ')
  .replace(/^пл\.\s*/i, 'площадь ')
  .replace(/^наб\.\s*/i, 'набережная ')
  .replace(/^тупик\s*/i, 'тупик ')
  .replace(/^проезд\s*/i, 'проезд ')
  .trim();
}

function deduplicate<T extends { address?: { title?: string } }>(items: T[]): T[] {
 const seen = new Set<string>();
 return items.filter((item) => {
  const key = (item.address?.title || '')
   .toLowerCase()
   .replace(/ё/g, 'е')
   .replace(/\s+/g, ' ')
   .trim();
  if (!key || seen.has(key)) return false;
  seen.add(key);
  return true;
 });
}

// ─── 2GIS Unified Parser ───────────────────────────────────────────────────
function parse2GISItem(item: any, city: string) {
 try {
  const addrObj = item.address;
  const components = addrObj?.components || [];

  const streetComp = components.find((c: any) => c.type === 'street');
  const houseComp = components.find((c: any) => c.type === 'street_number' || c.type === 'house');

  let road = normalizeRoad(streetComp?.name || streetComp?.street || '');
  const houseNum = houseComp?.number || houseComp?.name || '';

  if (!road && item.address_name) {
   const parts = item.address_name.split(',').map((s: string) => s.trim());
   road = normalizeRoad(parts[0]);
  }

  if (!road) return null;

  const title = houseNum ? `${road}, ${houseNum}` : road;
  const subtitle = addrObj?.city || item.adm_div?.[0]?.name || city;

  return {
   display_name: item.full_name || item.address_name || title,
   lat: item.point?.lat?.toString() || '',
   lon: item.point?.lon?.toString() || '',
   id: item.id || Math.random().toString(),
   address: { road, house_number: houseNum, city: subtitle, title, subtitle },
   type: item.type || 'address',
  };
 } catch { return null; }
}

export async function GET(req: NextRequest) {
 const { searchParams } = new URL(req.url);
 const rawQ = (searchParams.get('q') || '').trim();
 const city = ((searchParams.get('city') || 'Москва').trim()) as CityKey;

 if (!rawQ || rawQ.length < 2) return NextResponse.json([]);

 const config = CITY_CONFIG[city] ?? CITY_CONFIG['Москва'];
 const reqOrigin = req.headers.get('origin') || req.headers.get('referer') || 'http://localhost:3000';

 const headers = {
  'Referer': reqOrigin,
  'Origin': reqOrigin,
  'User-Agent': 'smuslest-delivery-app/1.0',
 };

 let results: any[] = [];

 // ─── 1. Attempt 2GIS Suggest ─────────────────────────────────────────────
 if (DGIS_KEY) {
  try {
   const params = new URLSearchParams({
    q: rawQ,
    key: DGIS_KEY,
    location: config.dgisPoint,
    radius: '50000',
    fields: 'items.point,items.address,items.adm_div',
    limit: '15',
    lang: 'ru',
   });

   const res = await fetch(`https://catalog.api.2gis.com/3.0/suggests?${params}`, {
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
   });

   if (res.ok) {
    const data = await res.json();
    const items = data?.result?.items || [];
    results = items.map((i: any) => parse2GISItem(i, city)).filter(Boolean);
   }
  } catch (e) { console.warn('[Search] 2GIS failed, trying fallback...'); }
 }

 // ─── 2. Fallback to Yandex (if results < 5) ──────────────────────────────
 if (results.length < 5 && YANDEX_KEY) {
  try {
   const query = rawQ.toLowerCase().includes(city.toLowerCase()) ? rawQ : `${city}, ${rawQ}`;
   const params = new URLSearchParams({
    apikey: YANDEX_KEY,
    geocode: query,
    format: 'json',
    results: '15',
    ll: config.yandexLL,
    spn: '0.5,0.5',
    rspn: '1',
   });

   const res = await fetch(`https://geocode-maps.yandex.ru/1.x/?${params}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
   });

   if (res.ok) {
    const data = await res.json();
    const members = data?.response?.GeoObjectCollection?.featureMember || [];
    const yandexResults = members.map((m: any) => {
     const go = m.GeoObject;
     const pos = go.Point?.pos?.split(' ');
     const addr = go.metaDataProperty?.GeocoderMetaData?.Address;
     const comps = addr?.Components || [];

     const street = comps.find((c: any) => c.kind === 'street')?.name || '';
     const house = comps.find((c: any) => c.kind === 'house')?.name || '';

     if (!street) return null;

     const road = normalizeRoad(street);
     const title = house ? `${road}, ${house}` : road;

     return {
      display_name: addr?.formatted || title,
      lat: pos?.[1] || '',
      lon: pos?.[0] || '',
      id: go.id || Math.random().toString(),
      address: { road, house_number: house, city, title, subtitle: city },
      type: 'address',
     };
    }).filter(Boolean);

    results = [...results, ...yandexResults];
   }
  } catch (e) { console.warn('[Search] Yandex failed...'); }
 }

 // ─── 3. Final Fallback: Nominatim (if still empty) ───────────────────────
 if (results.length === 0) {
  try {
   const p = new URLSearchParams({
    q: `${city} ${rawQ}`,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '15',
    countrycodes: 'ru',
    'accept-language': 'ru',
   });
   const res = await fetch(`https://nominatim.openstreetmap.org/search?${p}`, {
    headers: { 'User-Agent': 'smuslest-delivery/1.0' },
    cache: 'no-store',
   });
   if (res.ok) {
    const data = await res.json();
    results = data.map((item: any) => {
     const addr = item.address || {};
     const rawRoad = addr.road || addr.pedestrian || '';
     const road = normalizeRoad(rawRoad);
     if (!road) return null;
     const house = addr.house_number || '';
     const title = house ? `${road}, ${house}` : road;
     return {
      display_name: item.display_name,
      lat: item.lat,
      lon: item.lon,
      id: item.place_id.toString(),
      address: { road, house_number: house, city, title, subtitle: city },
     };
    }).filter(Boolean);
   }
  } catch (e) { /* ignore */ }
 }

 const finalResults = deduplicate(results).slice(0, 15);
 return NextResponse.json(finalResults);
}
