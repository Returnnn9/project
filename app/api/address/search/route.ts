import { NextRequest, NextResponse } from 'next/server';

const DGIS_KEY = process.env.NEXT_PUBLIC_2GIS_API_KEY;

const CITY_COORDS = {
 'Москва': '37.6176,55.7558',
 'Санкт-Петербург': '30.3351,59.9343'
};

export async function GET(req: NextRequest) {
 const { searchParams } = new URL(req.url);
 const rawQ = searchParams.get('q') || '';
 const city = (searchParams.get('city') || 'Москва').trim();

 if (!rawQ || rawQ.length < 1) return NextResponse.json([]);

 try {
  const coords = CITY_COORDS[city as keyof typeof CITY_COORDS] || CITY_COORDS['Москва'];
  const params = new URLSearchParams({
   q: `${city}, ${rawQ}`,
   key: DGIS_KEY || '',
   location: coords,
   sort_point: coords,
   fields: 'items.point,items.address',
   limit: '20'
  });

  const url = `https://catalog.api.2gis.com/3.0/items?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
   return NextResponse.json([]);
  }

  const data = await response.json();

  if (!data?.result?.items) return NextResponse.json([]);

  const suggestions = data.result.items
   .map((item: any) => {
    try {
     if (!item) return null;

     const addressObj = item.address || {};
     const components = addressObj.components || [];

     let road = '';
     let houseNum = '';

     const streetComp = components.find((c: any) => c.street || c.type === 'street');
     const numberComp = components.find((c: any) => c.number || c.type === 'street_number');

     if (streetComp) road = streetComp.street || streetComp.name || '';
     if (numberComp) houseNum = numberComp.number || '';

     if (!road) {
      const rawName = item.address_name || item.full_name || '';
      if (rawName) {
       const parts = rawName.split(',').map((p: string) => p.trim());
       const cityLower = city.toLowerCase();
       // Skip city if it's the first part
       const startIndex = (parts[0] && parts[0].toLowerCase().includes(cityLower)) ? 1 : 0;
       road = parts[startIndex] || '';
       if (parts[startIndex + 1] && !houseNum) houseNum = parts[startIndex + 1];
      }
     }

     // If we still have no road, skip this item
     if (!road) return null;

     // Normalize road name
     let cleanRoad = road.replace(/(^|\s)(ул|улица|пр|пр-т|проспект|пер|переулок|б-р|бульвар|ш|шоссе|наб|набережная|аллея|тракт)\.?\s+/gi, ' ').trim();
     cleanRoad = cleanRoad.replace(/\s+(ул|улица|пр|пр-т|проспект|пер|переулок|б-р|бульвар|ш|шоссе|наб|набережная|аллея|тракт)\.?$/gi, '').trim();

     if (cleanRoad.length > 0) {
      cleanRoad = cleanRoad.charAt(0).toUpperCase() + cleanRoad.slice(1);
     }

     // Filter: Road after cleanup shouldn't be just the city name
     if (cleanRoad.toLowerCase() === city.toLowerCase() || cleanRoad.toLowerCase() === 'москва' || cleanRoad.toLowerCase() === 'санкт-петербург') {
      return null;
     }

     // Refined road normalization: prevent double "улица" and ensure proper prefix
     let displayRoad = cleanRoad;
     if (displayRoad) {
      // Remove common redundant prefixes if they exist at the start to ensure we don't double them
      displayRoad = displayRoad.replace(/^(ул\.|улица|пр-т|проспект|аллея|бульвар|наб\.|набережная)\s+/i, '');
      // Always prefix with "улица " for consistency, UNLESS it's clearly a different type (though 2GIS usually provides the base name)
      const lowerRoad = displayRoad.toLowerCase();
      const hasType = ['проспект', 'шоссе', 'бульвар', 'переулок', 'набережная', 'аллея', 'площадь', 'тупик', 'проезд'].some(kw => lowerRoad.includes(kw));
      if (!hasType && !lowerRoad.includes('улица')) {
       displayRoad = `улица ${displayRoad}`;
      }
     }

     // Final Filter: Result must be relevant to the city
     const full = (item.full_name || '').toLowerCase();
     const cName = city.toLowerCase();
     const isRelevant = full.includes(cName) || (cName.includes('санкт') && full.includes('петербург'));
     if (!isRelevant) return null;

     const title = houseNum ? `${displayRoad}, ${houseNum}` : displayRoad;

     return {
      display_name: item.full_name || item.address_name || '',
      lat: item.point?.lat?.toString(),
      lon: item.point?.lon?.toString(),
      id: item.id,
      address: {
       road: displayRoad,
       house_number: houseNum,
       city: city,
       title: title,
       subtitle: city
      },
      type: item.type
     };
    } catch (e) {
     return null;
    }
   })
   .filter(Boolean);

  const seen = new Set();
  const final = (suggestions as any[]).filter((s: any) => {
   const key = `${s.address.road}|${s.address.house_number}`.toLowerCase();
   if (seen.has(key)) return false;
   seen.add(key);
   return true;
  }).slice(0, 10);

  return NextResponse.json(final);

 } catch (error: any) {
  return NextResponse.json([]);
 }
}
