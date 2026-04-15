import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DGIS_KEY = process.env.DGIS_API_KEY || process.env.NEXT_PUBLIC_2GIS_API_KEY;
const YANDEX_KEY = process.env.YANDEX_GEOCODER_KEY || process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

const CITY_CONFIG = {
  'Москва': {
    lat: 55.7558,
    lon: 37.6176,
    dgisPoint: '37.6176,55.7558',
    yandexLL: '37.6176,55.7558',
  },
  'Санкт-Петербург': {
    lat: 59.9343,
    lon: 30.3351,
    dgisPoint: '30.3351,59.9343',
    yandexLL: '30.3351,59.9343',
  },
} as const;

type CityKey = keyof typeof CITY_CONFIG;

interface ParsedResult {
  display_name: string;
  lat: string;
  lon: string;
  id: string;
  address: {
    road: string;
    house_number: string;
    city: string;
    title: string;
    subtitle: string;
  };
  type: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeText(s: string): string {
  return s.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
}

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

/**
 * Relevance gate: at least one meaningful word (>2 chars) from the query
 * must appear in the result title. This prevents unrelated POI address streets
 * (e.g. "Измайловское шоссе") from appearing when searching for "кремль".
 */
function isRelevant(title: string, query: string): boolean {
  const normalQ = normalizeText(query);
  const normalT = normalizeText(title);
  const words = normalQ.split(/\s+/).filter((w) => w.length > 2);
  if (words.length === 0) return true;
  return words.some((word) => normalT.includes(word));
}

function deduplicate(items: ParsedResult[]): ParsedResult[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalizeText(item.address?.title || '');
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── 2GIS Item Parser ─────────────────────────────────────────────────────────
function parse2GISItem(
  item: Record<string, unknown>,
  city: string
): ParsedResult | null {
  try {
    const addrObj = item.address as Record<string, unknown> | undefined;
    const components =
      (addrObj?.components as Array<Record<string, unknown>>) || [];

    const streetComp = components.find((c) => c.type === 'street');
    const houseComp = components.find(
      (c) => c.type === 'street_number' || c.type === 'house'
    );

    // Primary: real street component name.
    // Do NOT fall back to address_name — that grabs streets from unrelated POI addresses.
    const rawStreet =
      (streetComp?.name as string) || (streetComp?.street as string) || '';
    const road = normalizeRoad(rawStreet);
    const houseNum =
      (houseComp?.number as string) || (houseComp?.name as string) || '';

    // Secondary: for named places without a street component (площадь, кремль…),
    // use the item's own name field.
    const itemName = (item.name as string) || '';
    const effectiveRoad = road || normalizeRoad(itemName);

    if (!effectiveRoad) return null;

    const title = houseNum ? `${effectiveRoad}, ${houseNum}` : effectiveRoad;
    const subtitle =
      (addrObj?.city as string) ||
      (
        (item.adm_div as Array<Record<string, unknown>>)?.[0]?.name as string
      ) ||
      city;

    const point = item.point as Record<string, unknown> | undefined;

    return {
      display_name: (item.full_name as string) || title,
      lat: (point?.lat ?? '').toString(),
      lon: (point?.lon ?? '').toString(),
      id: (item.id as string) || Math.random().toString(),
      address: {
        road: effectiveRoad,
        house_number: houseNum,
        city: subtitle,
        title,
        subtitle,
      },
      type: (item.type as string) || 'address',
    };
  } catch {
    return null;
  }
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawQ = (searchParams.get('q') || '').trim();
  const city = ((searchParams.get('city') || 'Москва').trim()) as CityKey;

  if (!rawQ || rawQ.length < 2) return NextResponse.json([]);

  const config = CITY_CONFIG[city] ?? CITY_CONFIG['Москва'];
  const reqOrigin =
    req.headers.get('origin') ||
    req.headers.get('referer') ||
    'http://localhost:3000';

  const fetchHeaders = {
    Referer: reqOrigin,
    Origin: reqOrigin,
    'User-Agent': 'smuslest-delivery-app/1.0',
  };

  let results: ParsedResult[] = [];

  // ─── 1. 2GIS Suggest ───────────────────────────────────────────────────────
  if (DGIS_KEY) {
    try {
      const params = new URLSearchParams({
        q: rawQ,
        key: DGIS_KEY,
        location: config.dgisPoint,
        radius: '30000',
        // Restrict to address types only — prevents random POIs from polluting results
        type: 'street,building,adm_div.city,adm_div.district_area',
        fields: 'items.point,items.address,items.adm_div,items.name,items.full_name',
        limit: '15',
        lang: 'ru',
      });

      const res = await fetch(
        `https://catalog.api.2gis.com/3.0/suggests?${params}`,
        { headers: fetchHeaders, cache: 'no-store', signal: AbortSignal.timeout(5000) }
      );

      if (res.ok) {
        const data = (await res.json()) as {
          result?: { items?: Record<string, unknown>[] };
        };
        const items = data?.result?.items || [];
        results = items
          .map((i) => parse2GISItem(i, city))
          .filter((r): r is ParsedResult => r !== null)
          // Relevance gate — must mention the query
          .filter((r) => isRelevant(r.address.title, rawQ));
      }
    } catch {
      console.warn('[Search] 2GIS failed, trying fallback...');
    }
  }

  // ─── 2. Yandex Geocoder fallback ───────────────────────────────────────────
  if (results.length < 4 && YANDEX_KEY) {
    try {
      const query = rawQ.toLowerCase().includes(city.toLowerCase())
        ? rawQ
        : `${city}, ${rawQ}`;
      const params = new URLSearchParams({
        apikey: YANDEX_KEY,
        geocode: query,
        format: 'json',
        results: '15',
        ll: config.yandexLL,
        spn: '0.5,0.5',
        rspn: '1',
      });

      const res = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?${params}`,
        { cache: 'no-store', signal: AbortSignal.timeout(5000) }
      );

      if (res.ok) {
        const data = (await res.json()) as {
          response?: {
            GeoObjectCollection?: { featureMember?: unknown[] };
          };
        };
        const members =
          data?.response?.GeoObjectCollection?.featureMember || [];

        const yandexResults = (members as Array<Record<string, unknown>>)
          .map((m) => {
            const go = m.GeoObject as Record<string, unknown>;
            const pos = (
              (go.Point as Record<string, unknown>)?.pos as string
            )?.split(' ');
            const metaAddr = (
              go.metaDataProperty as Record<string, unknown>
            )?.GeocoderMetaData as Record<string, unknown>;
            const addrData = metaAddr?.Address as Record<string, unknown>;
            const comps =
              (addrData?.Components as Array<Record<string, unknown>>) || [];

            const street =
              (comps.find((c) => c.kind === 'street')?.name as string) || '';
            const house =
              (comps.find((c) => c.kind === 'house')?.name as string) || '';
            // Accept named places (locality, area) when no street found
            const locality =
              (comps.find(
                (c) => c.kind === 'locality' || c.kind === 'district'
              )?.name as string) || '';

            const rawName = street || locality;
            if (!rawName) return null;

            const road = normalizeRoad(rawName);
            const title = house ? `${road}, ${house}` : road;

            if (!isRelevant(title, rawQ)) return null;

            return {
              display_name: (addrData?.formatted as string) || title,
              lat: pos?.[1] || '',
              lon: pos?.[0] || '',
              id: (go.id as string) || Math.random().toString(),
              address: { road, house_number: house, city, title, subtitle: city },
              type: 'address',
            } as ParsedResult;
          })
          .filter((r): r is ParsedResult => r !== null);

        results = [...results, ...yandexResults];
      }
    } catch {
      console.warn('[Search] Yandex failed...');
    }
  }

  // ─── 3. Nominatim last-resort fallback ────────────────────────────────────
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
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${p}`,
        {
          headers: { 'User-Agent': 'smuslest-delivery/1.0' },
          cache: 'no-store',
        }
      );
      if (res.ok) {
        const data = (await res.json()) as Array<Record<string, unknown>>;
        results = data
          .map((item) => {
            const addr = (item.address as Record<string, string>) || {};
            const rawRoad =
              addr.road || addr.pedestrian || addr.path || addr.leisure || '';
            const road = normalizeRoad(rawRoad);
            if (!road) return null;
            const house = addr.house_number || '';
            const title = house ? `${road}, ${house}` : road;
            if (!isRelevant(title, rawQ)) return null;
            return {
              display_name: item.display_name as string,
              lat: item.lat as string,
              lon: item.lon as string,
              id: String(item.place_id),
              address: { road, house_number: house, city, title, subtitle: city },
              type: 'address',
            } as ParsedResult;
          })
          .filter((r): r is ParsedResult => r !== null);
      }
    } catch {
      /* ignore */
    }
  }

  const finalResults = deduplicate(results).slice(0, 8);
  return NextResponse.json(finalResults);
}
