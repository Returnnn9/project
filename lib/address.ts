import type { AddressEntity, OSMSuggestion } from './types/address';

// ─── Normalization (shared by API routes and client) ──────────────────────────

export function normalizeText(s: string): string {
 return s.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
}

export function normalizeRoad(name: string): string {
 if (!name) return '';
 return name
  // Only expand abbreviations — require dot OR that the word is short (≤3 chars before space/end)
  // This prevents "улица" from being mangled into "улица ица"
  .replace(/^ул\.\s*/iu, 'улица ')
  .replace(/^пр-т\.?\s*/iu, 'проспект ')
  .replace(/^пр\.\s*/iu, 'проспект ')
  .replace(/^пер\.\s*/iu, 'переулок ')
  .replace(/^ш\.\s*/iu, 'шоссе ')
  .replace(/^б-р\.?\s*/iu, 'бульвар ')
  .replace(/^пл\.\s*/iu, 'площадь ')
  .replace(/^наб\.\s*/iu, 'набережная ')
  .replace(/^тупик\.\s*/iu, 'тупик ')
  .replace(/^проезд\.\s*/iu, 'проезд ')
  .replace(/\s{2,}/g, ' ')
  .trim();
}

// ─── Russian address tokenizer ─────────────────────────────────────────────────
// Handles formats: "ул. Ленина, д. 24, кв. 57", "Ленина 24 кв57", "Новослободская, д. 24, кв. 57"

export function parseRussianAddress(input: string): Partial<AddressEntity> {
  if (!input) return {};
  let s = input.trim();

  let apartment = '';
  let entrance = '';
  let floor = '';
  let corpus = '';
  let house = '';

  // Extract fields and consume any trailing spaces/commas right after the number
  s = s.replace(/(?:^|[\s,]+)(?:кв(?:артира)?\.?)\s*(\d+)[\s,]*/iu, (_, n) => { apartment = n; return ' '; });
  s = s.replace(/(?:^|[\s,]+)(?:под(?:ъезд)?\.?|п\.)\s*(\d+)[\s,]*/iu, (_, n) => { entrance = n; return ' '; });
  s = s.replace(/(?:^|[\s,]+)(?:эт(?:аж)?\.?)\s*(\d+)[\s,]*/iu, (_, n) => { floor = n; return ' '; });
  s = s.replace(/(?:^|[\s,]+)(?:корп(?:ус)?\.?|строение|стр\.?)\s*([а-яёa-z0-9]+)[\s,]*/iu, (_, n) => { corpus = n; return ' '; });
  
  // House number
  s = s.replace(/(?:^|[\s,]+)(?:дом|д\.?)\s*(\d+[а-яё]?)[\s,]*/iu, (_, n) => { house = n; return ' '; });
  
  // Cleanup
  s = s.replace(/\s+/gu, ' ').replace(/,+/gu, '').trim();

  if (!house) {
    s = s.replace(/(?:^|[\s,]+)(\d+[а-яё]?)\s*$/iu, (_, n) => { house = n; return ' '; }).trim();
  }

  const road = normalizeRoad(s.replace(/^[,\s]+|[,\s]+$/gu, '').trim());

  return { road, house, corpus, entrance, floor, apartment };
}

// ─── Formatting ────────────────────────────────────────────────────────────────

export function formatAddress(
 e: Partial<AddressEntity> & { road: string }
): string {
 const parts: string[] = [e.road];
 if (e.house) parts.push(`д. ${e.house}`);
 if (e.corpus) parts.push(`корп. ${e.corpus}`);
 if (e.entrance) parts.push(`под. ${e.entrance}`);
 if (e.floor) parts.push(`эт. ${e.floor}`);
 if (e.apartment) parts.push(`кв. ${e.apartment}`);
 return parts.join(', ');
}

// ─── Entity constructors ───────────────────────────────────────────────────────

export function entityFromApiResponse(data: {
 road: string;
 house: string;
 city: string;
 lat: number;
 lon: number;
}): AddressEntity {
 const road = data.road;
 const house = data.house;
 const displayLine = [road, house].filter(Boolean).join(', ');
 const full = formatAddress({ road, house, corpus: '', entrance: '', floor: '', apartment: '' });
 return {
  road, house, corpus: '', entrance: '', floor: '', apartment: '',
  city: data.city,
  coords: [data.lat, data.lon],
  displayLine,
  full,
 };
}

export function entityFromSuggestion(item: OSMSuggestion): AddressEntity {
 const road = normalizeRoad(
  item.address?.road || item.address?.pedestrian || ''
 ) || item.address?.title?.split(',')[0] || '';
 const house = item.address?.house_number || '';
 const city =
  item.address?.city ||
  item.address?.town ||
  item.address?.village ||
  item.address?.subtitle ||
  '';
 const displayLine = [road, house].filter(Boolean).join(', ');
 const full = formatAddress({ road, house, corpus: '', entrance: '', floor: '', apartment: '' });
 const lat = parseFloat(item.lat);
 const lon = parseFloat(item.lon);
 const coords: [number, number] | null =
  !isNaN(lat) && !isNaN(lon) ? [lat, lon] : null;

 return {
  road, house, corpus: '', entrance: '', floor: '', apartment: '',
  city, coords, displayLine, full,
 };
}

export function migrateStringAddress(raw: string): AddressEntity {
 const parsed = parseRussianAddress(raw);
 const road = parsed.road || raw;
 const house = parsed.house || '';
 const corpus = parsed.corpus || '';
 const entrance = parsed.entrance || '';
 const floor = parsed.floor || '';
 const apartment = parsed.apartment || '';
 const displayLine = [road, house].filter(Boolean).join(', ');
 const full = formatAddress({ road, house, corpus, entrance, floor, apartment });
 return {
  road, house, corpus, entrance, floor, apartment,
  city: '', coords: null, displayLine, full,
 };
}

// ─── Legacy exports (still referenced by existing code) ───────────────────────

export interface AddressDetails {
 street: string;
 house: string;
 corpus: string;
 entrance: string;
 floor: string;
 apartment: string;
}

export function extractFromQuery(
 query: string,
 houseNumFromApi: string = ''
): Omit<AddressDetails, 'street'> {
 let tempStr = query.toLowerCase();

 let apartment = '';
 let entrance = '';
 let floor = '';
 let corpus = '';
 let house = houseNumFromApi || '';

 const kvMatch = tempStr.match(/(?:^|\s|,)(?:кв|квартира)\.?\s*(\d+)/);
 if (kvMatch) { apartment = kvMatch[1]; tempStr = tempStr.replace(kvMatch[0], ' '); }

 const entMatch = tempStr.match(/(?:^|\s|,)(?:п|под|подъезд)\.?\s*(\d+)/);
 if (entMatch) { entrance = entMatch[1]; tempStr = tempStr.replace(entMatch[0], ' '); }

 const flMatch = tempStr.match(/(?:^|\s|,)(?:эт|этаж)\.?\s*(\d+)/);
 if (flMatch) { floor = flMatch[1]; tempStr = tempStr.replace(flMatch[0], ' '); }

 const corpMatch = tempStr.match(
  /(?:^|\s|,)(?:корпус|корп\.?|строение|стр\.?|к(?=[.\d])|с(?=[.\d]))\s*([a-zа-яё0-9]+)/
 );
 if (corpMatch) { corpus = corpMatch[1]; tempStr = tempStr.replace(corpMatch[0], ' '); }

 if (house) {
  const pureHouseMatch = house.match(/^(\d+)[a-zа-яё]?$/);
  if (!pureHouseMatch) {
   const hMatch = house.match(/^(\d+)[/\s-]*(?:к|корп|с|стр)[.\s]*([a-zа-яё0-9]+)$/);
   if (hMatch) { house = hMatch[1]; if (!corpus) corpus = hMatch[2]; }
  }
 }

 return { house, corpus, entrance, floor, apartment };
}

export function parseAddress(fullAddress: string): AddressDetails {
 const parts = fullAddress.split(',').map((p) => p.trim());
 const details: AddressDetails = { street: '', house: '', corpus: '', entrance: '', floor: '', apartment: '' };

 if (parts.length > 0) {
  details.street = parts[0];
  parts.slice(1).forEach((part) => {
   const p = part.toLowerCase();
   if (p.startsWith('д.')) details.house = part.replace(/^д\.\s*/i, '').trim();
   else if (p.startsWith('корп.')) details.corpus = part.replace(/^корп\.\s*/i, '').trim();
   else if (p.startsWith('под.')) details.entrance = part.replace(/^под\.\s*/i, '').trim();
   else if (p.startsWith('эт.')) details.floor = part.replace(/^эт\.\s*/i, '').trim();
   else if (p.startsWith('кв.')) details.apartment = part.replace(/^кв\.\s*/i, '').trim();
  });
 }
 return details;
}
