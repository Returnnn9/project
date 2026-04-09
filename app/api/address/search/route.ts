import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Prefer server-only key (not embedded in client bundle); fall back to public key for compatibility
const DGIS_KEY = process.env.DGIS_API_KEY || process.env.NEXT_PUBLIC_2GIS_API_KEY;

const CITY_CONFIG = {
  'Москва': {
    point: '37.6176,55.7558',
    regionId: '8', // Москва и МО region_id
  },
  'Санкт-Петербург': {
    point: '30.3351,59.9343',
    regionId: '152', // Санкт-Петербург и ЛО region_id
  }
} as const;

type CityKey = keyof typeof CITY_CONFIG;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawQ = searchParams.get('q') || '';
  const city = ((searchParams.get('city') || 'Москва').trim()) as CityKey;

  if (!rawQ || rawQ.length < 2) return NextResponse.json([]);

  const config = CITY_CONFIG[city] ?? CITY_CONFIG['Москва'];

  try {
    // 1. 2GIS Suggest API
    const suggestParams = new URLSearchParams({
      q: rawQ,
      key: DGIS_KEY || '',
      location: config.point,
      radius: '50000',
      fields: 'items.point,items.address,items.type',
      limit: '12',
    });

    const suggestUrl = `https://suggest-api.2gis.com/2.0/suggest?${suggestParams.toString()}`;
    const suggestRes = await fetch(suggestUrl, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
    });

    if (suggestRes.ok) {
      const suggestData = await suggestRes.json();
      const items = suggestData?.result?.items ?? [];

      if (items.length > 0) {
        const suggestions = parseSuggestItems(items, city);
        if (suggestions.length > 0) {
          return NextResponse.json(deduplicate(suggestions).slice(0, 10));
        }
      }
    }

    // 2. Fallback: 2GIS Catalog search API
    const catalogParams = new URLSearchParams({
      q: rawQ.toLowerCase().includes(city.toLowerCase()) ? rawQ : `${city}, ${rawQ}`,
      key: DGIS_KEY || '',
      location: config.point,
      radius: '50000',
      fields: 'items.point,items.address,items.type',
      limit: '15',
    });

    const catalogUrl = `https://catalog.api.2gis.com/3.0/items?${catalogParams.toString()}`;
    const catalogRes = await fetch(catalogUrl, { cache: 'no-store' });

    if (!catalogRes.ok) return NextResponse.json([]);

    const catalogData = await catalogRes.json();
    const catalogItems = catalogData?.result?.items ?? [];

    const suggestions = parseCatalogItems(catalogItems, city);
    return NextResponse.json(deduplicate(suggestions).slice(0, 8));

  } catch (err) {
    console.error('[Search API Error]:', err);
    return NextResponse.json([]);
  }
}

// ─── Suggest API parser ───────────────────────────────────────────────────────
function parseSuggestItems(items: any[], city: string) {
  return items
    .map((item: any) => {
      try {
        if (!item?.name) return null;

        // Skip if belongs to another major city
        const fullName = (item.full_name || '').toLowerCase();
        const otherCity = city === 'Москва' ? 'санкт-петербург' : 'москва';
        if (fullName.includes(otherCity)) return null;

        const addressParts = (item.address_name || item.full_name || '').split(',').map((p: string) => p.trim());

        // Extract street and house from suggest response
        let road = '';
        let houseNum = '';

        // item.name is usually the most specific part (e.g. "ул. Ленина, 5")
        const nameParts = item.name.split(',').map((p: string) => p.trim());
        road = normalizeRoad(nameParts[0] || '');
        houseNum = nameParts[1] || '';

        // If road is empty or just the city, try address_name
        if (!road || road.toLowerCase() === city.toLowerCase()) {
          const addrPart = addressParts[0] || '';
          if (addrPart && addrPart.toLowerCase() !== city.toLowerCase()) {
            road = normalizeRoad(addrPart);
          } else if (addressParts[1]) {
            road = normalizeRoad(addressParts[1]);
          }
        }

        if (!road || road.toLowerCase() === city.toLowerCase()) return null;

        const title = houseNum ? `${road}, ${houseNum}` : road;
        const subtitle = item.type?.includes('station') ? `Метро, ${city}` : city;

        return {
          display_name: item.full_name || item.address_name || '',
          lat: item.point?.lat?.toString(),
          lon: item.point?.lon?.toString(),
          id: item.id,
          address: {
            road,
            house_number: houseNum,
            city,
            title,
            subtitle,
          },
          type: item.type,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

// ─── Catalog API parser ───────────────────────────────────────────────────────
function parseCatalogItems(items: any[], city: string) {
  return items
    .map((item: any) => {
      try {
        if (!item) return null;

        const fullName = (item.full_name || item.address_name || '').toLowerCase();
        const otherCity = city === 'Москва' ? 'санкт-петербург' : 'москва';
        if (fullName.includes(otherCity) && !fullName.includes(city.toLowerCase())) return null;

        const components = item.address?.components || [];
        let road = '';
        let houseNum = '';

        const streetComp = components.find((c: any) => c.type === 'street');
        const houseComp = components.find((c: any) => c.type === 'street_number');

        if (streetComp) road = streetComp.street || streetComp.name || '';
        if (houseComp) houseNum = houseComp.number || '';

        // Fallback to address_name parsing
        if (!road) {
          const rawAddr = item.address_name || item.full_name || '';
          const parts = rawAddr.split(',').map((p: string) => p.trim());
          const cityLower = city.toLowerCase();
          const startIdx = parts[0]?.toLowerCase().includes(cityLower) ? 1 : 0;
          road = parts[startIdx] || '';
          if (!houseNum && parts[startIdx + 1]) houseNum = parts[startIdx + 1];
        }

        road = normalizeRoad(road);
        if (!road || road.toLowerCase() === city.toLowerCase()) return null;

        const title = houseNum ? `${road}, ${houseNum}` : road;
        const subtitle = item.type?.includes('station') ? `Метро, ${city}` : city;

        return {
          display_name: item.full_name || item.address_name || '',
          lat: item.point?.lat?.toString(),
          lon: item.point?.lon?.toString(),
          id: item.id,
          address: {
            road,
            house_number: houseNum,
            city,
            title,
            subtitle,
          },
          type: item.type,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

// ─── Normalize road name ──────────────────────────────────────────────────────
function normalizeRoad(raw: string): string {
  if (!raw) return '';
  let road = raw.trim();

  const typeKeywords = ['проспект', 'шоссе', 'бульвар', 'переулок', 'набережная', 'аллея', 'площадь', 'тупик', 'проезд', 'тракт', 'линия', 'кольцо', 'метро', 'станция', 'парк', 'сквер', 'км '];
  const hasType = typeKeywords.some(kw => road.toLowerCase().includes(kw));

  if (!hasType) {
    // Strip common abbreviated prefixes and re-add "улица"
    let clean = road
      .replace(/^(ул\.?\s+|улица\s+)/gi, '')
      .replace(/(\s+ул\.?|,?\s+улица)$/gi, '')
      .trim();
    if (clean.length > 0) {
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
      return `улица ${clean}`;
    }
  }

  return road.charAt(0).toUpperCase() + road.slice(1);
}

// ─── Deduplicate by title ─────────────────────────────────────────────────────
function deduplicate(suggestions: any[]) {
  const seen = new Set<string>();
  return suggestions.filter((s: any) => {
    const key = s.address.title.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
