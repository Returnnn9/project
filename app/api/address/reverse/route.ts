import { NextRequest, NextResponse } from 'next/server';

const DGIS_KEY = process.env.NEXT_PUBLIC_2GIS_API_KEY;

export async function GET(req: NextRequest) {
 const { searchParams } = new URL(req.url);
 const lat = searchParams.get('lat');
 const lon = searchParams.get('lon');

 if (!lat || !lon) {
  return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
 }

 try {
  // Use 3.0/items/geocode
  const params = new URLSearchParams({
   lon: lon,
   lat: lat,
   key: DGIS_KEY || '',
   fields: 'items.point,items.address',
   limit: '2'
  });

  const response = await fetch(`https://catalog.api.2gis.com/3.0/items/geocode?${params.toString()}`);
  const data = await response.json();

  if (!data?.result?.items || data.result.items.length === 0) {
   return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Find the first building item
  const item = data.result.items.find((i: any) => i.type === 'building') || data.result.items[0];
  const addressObj = item.address || {};
  const components = addressObj.components || [];

  let road = '';
  let houseNum = '';

  const streetComp = components.find((c: any) => c.street || c.type === 'street');
  const numberComp = components.find((c: any) => c.number || c.type === 'street_number');

  if (streetComp) {
   road = streetComp.street || streetComp.name || '';
  }
  if (numberComp) {
   houseNum = numberComp.number || '';
  }

  if (!road && item.address_name) {
   const parts = item.address_name.split(',');
   road = parts[0].trim();
   if (parts.length > 1 && !houseNum) {
    houseNum = parts[1].trim();
   }
  }

  // Clean and format road
  let cleanRoad = road.replace(/(^|\s)(ул|улица|пр|пр-т|проспект|пер|переулок|б-р|бульвар|ш|шоссе|наб|набережная|аллея|тракт)\.?\s+/gi, '').trim();
  if (cleanRoad.length > 0) {
   cleanRoad = cleanRoad.charAt(0).toUpperCase() + cleanRoad.slice(1);
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
