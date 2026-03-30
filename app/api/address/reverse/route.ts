import { NextRequest, NextResponse } from 'next/server';

const DGIS_KEY = process.env.DGIS_API_KEY_SERVER || process.env.NEXT_PUBLIC_2GIS_API_KEY;

interface DGISAddressComponent {
  street?: string;
  name?: string;
  number?: string;
  type: string;
}

interface DGISItem {
  type: string;
  name?: string;
  address_name?: string;
  full_name?: string;
  address?: {
    components?: DGISAddressComponent[];
    city?: string;
  };
  point: {
    lat: number;
    lon: number;
  };
}

interface DGISResponse {
  result: {
    items: DGISItem[];
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latParam = searchParams.get('lat');
  const lonParam = searchParams.get('lon');

  if (!latParam || !lonParam) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({
      lon: lonParam,
      lat: latParam,
      key: DGIS_KEY || '',
      fields: 'items.point,items.address',
      limit: '2'
    });

    const response = await fetch(`https://catalog.api.2gis.com/3.0/items/geocode?${params.toString()}`);
    const data: DGISResponse = await response.json();

    if (!data?.result?.items || data.result.items.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Find the best item: building first, then street, then first available
    const item: DGISItem = data.result.items.find((i: DGISItem) => i.type === 'building') || 
                           data.result.items.find((i: DGISItem) => i.type === 'street') ||
                           data.result.items[0];

    const addressObj = item.address || {};
    const components: DGISAddressComponent[] = addressObj.components || [];

    let road = '';
    let houseNum = '';

    // Find component by type directly
    const streetComp = components.find((c: DGISAddressComponent) => c.type === 'street');
    const numberComp = components.find((c: DGISAddressComponent) => c.type === 'street_number');

    if (streetComp) {
      road = streetComp.street || streetComp.name || '';
    }
    if (numberComp) {
      houseNum = numberComp.number || '';
    }

    // SMART GUESSING: If no road/street from components, use item details
    if (!road) {
      if (item.type === 'street') {
        road = item.name || item.address_name || '';
      } else {
        const isPlace = ['station', 'attraction', 'place', 'sights', 'park'].some(t => item.type?.includes(t));
        if (isPlace) {
          road = item.name || item.address_name || item.full_name || '';
        } else if (item.address_name) {
          const parts = item.address_name.split(',');
          road = parts[0].trim();
          if (parts.length > 1 && !houseNum) {
            houseNum = parts[1].trim();
          }
        }
      }
    }

    // Normalize road name: Only add "улица" if it's explicitly a street and lacks a type keyword
    let displayRoad = road;
    if (displayRoad) {
      const lowerRoad = road.toLowerCase();
      const typeKeywords = ['проспект', 'шоссе', 'бульвар', 'переулок', 'набережная', 'аллея', 'площадь', 'тупик', 'проезд', 'тракт', 'линия', 'кольцо', 'метро', 'станция', 'парк', 'сквер'];
      const hasType = typeKeywords.some(kw => lowerRoad.includes(kw));

      if (!hasType && item.type === 'street') {
        let cleanRoad = road.replace(/(^|\s)(ул|улица|пр|пр-т|проспект|пер|переулок|б-р|бульвар|ш|шоссе|наб|набережная|аллея|тракт)\.?\s+/gi, ' ').trim();
        cleanRoad = cleanRoad.replace(/\s+(ул|улица|пр|пр-т|проспект|пер|переулок|б-р|бульвар|ш|шоссе|наб|набережная|аллея|тракт)\.?$/gi, '').trim();

        if (cleanRoad.length > 0) {
          cleanRoad = cleanRoad.charAt(0).toUpperCase() + cleanRoad.slice(1);
          displayRoad = `улица ${cleanRoad}`;
        }
      } else {
        displayRoad = displayRoad.charAt(0).toUpperCase() + displayRoad.slice(1);
      }
    }

    const title = houseNum ? `${displayRoad}, ${houseNum}` : displayRoad;
    const city = addressObj.city || '';

    return NextResponse.json({
      full: item.full_name || item.address_name || '',
      road: displayRoad, // Consistent with search
      house: houseNum,
      city: city,
      title: title,
      subtitle: city,
      lat: item.point?.lat,
      lon: item.point?.lon
    });
  } catch (error) {
    console.error('2GIS API V3 Reverse Geocode Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
