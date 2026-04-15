import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const NOMINATIM_HEADERS = {
  'User-Agent': 'smuslest-delivery-app/1.0 (support@smuslest.ru)',
  'Accept-Language': 'ru',
};

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

  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      format: 'jsonv2',
      addressdetails: '1',
      zoom: '17', // street-level detail
      'accept-language': 'ru',
    });

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      {
        headers: NOMINATIM_HEADERS,
        cache: 'no-store',
        signal: AbortSignal.timeout(6_000),
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

    // Nominatim uses different keys for different road types
    const rawRoad = addr.road || addr.pedestrian || addr.path || addr.footway || addr.cycleway || '';

    // Normalize abbreviations
    const road = rawRoad
      .replace(/^ул\.\s*/i, 'улица ')
      .replace(/^пр-т\s*/i, 'проспект ')
      .replace(/^пр\.\s*/i, 'проспект ')
      .replace(/^пер\.\s*/i, 'переулок ')
      .replace(/^ш\.\s*/i, 'шоссе ')
      .replace(/^б-р\s*/i, 'бульвар ')
      .replace(/^пл\.\s*/i, 'площадь ')
      .replace(/^наб\.\s*/i, 'набережная ')
      .trim();

    const house = addr.house_number || '';
    const city = addr.city || addr.town || addr.village || '';
    const district = addr.suburb || addr.city_district || '';

    const title = house ? `${road}, ${house}` : road;
    const subtitle = district ? `${district}, ${city}` : city;

    // Compose a clean full address
    const parts = [road, house].filter(Boolean);
    const full = parts.length > 0 ? parts.join(', ') : data.display_name?.split(',')[0] || '';

    return NextResponse.json({
      full,
      road,
      house,
      city,
      title,
      subtitle,
      lat,
      lon,
    });
  } catch (err) {
    console.error('[Reverse] Error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
