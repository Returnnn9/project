export interface AddressDetails {
  street: string;
  house: string;
  corpus: string;
  entrance: string;
  floor: string;
  apartment: string;
}

export function extractFromQuery(query: string, houseNumFromApi: string = ''): Omit<AddressDetails, 'street'> {
  let tempStr = query.toLowerCase();
  
  let apartment = '';
  let entrance = '';
  let floor = '';
  let corpus = '';
  let house = houseNumFromApi || '';

  const kvMatch = tempStr.match(/(?:^|\s|,)(?:кв|квартира)\.?\s*(\d+)/);
  if (kvMatch) {
    apartment = kvMatch[1];
    tempStr = tempStr.replace(kvMatch[0], ' ');
  }

  const entMatch = tempStr.match(/(?:^|\s|,)(?:п|под|подъезд)\.?\s*(\d+)/);
  if (entMatch) {
    entrance = entMatch[1];
    tempStr = tempStr.replace(entMatch[0], ' ');
  }

  const flMatch = tempStr.match(/(?:^|\s|,)(?:эт|этаж)\.?\s*(\d+)/);
  if (flMatch) {
    floor = flMatch[1];
    tempStr = tempStr.replace(flMatch[0], ' ');
  }

  const corpMatch = tempStr.match(
    /(?:^|\s|,)(?:корпус|корп\.?|строение|стр\.?|к(?=[.\d])|с(?=[.\d]))\s*([a-zа-яё0-9]+)/
  );
  if (corpMatch) {
    corpus = corpMatch[1];
    tempStr = tempStr.replace(corpMatch[0], ' ');
  }

  if (house) {
    const pureHouseMatch = house.match(/^(\d+)[a-zа-яё]?$/); 
    if (!pureHouseMatch) {
      const hMatch = house.match(/^(\d+)[/\s-]*(?:к|корп|с|стр)[.\s]*([a-zа-яё0-9]+)$/);
      if (hMatch) {
        house = hMatch[1];
        if (!corpus) corpus = hMatch[2];
      }
    }
  }

  return { house, corpus, entrance, floor, apartment };
}

export function parseAddress(fullAddress: string): AddressDetails {
  const parts = fullAddress.split(',').map(p => p.trim());
  
  const details: AddressDetails = {
    street: '',
    house: '',
    corpus: '',
    entrance: '',
    floor: '',
    apartment: ''
  };

  if (parts.length > 0) {
    details.street = parts[0];
    
    parts.slice(1).forEach(part => {
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

export function formatAddress(details: Partial<AddressDetails> & { street: string }): string {
  const parts = [
    details.street,
    details.house && `д. ${details.house}`,
    details.corpus && `корп. ${details.corpus}`,
    details.entrance && `под. ${details.entrance}`,
    details.floor && `эт. ${details.floor}`,
    details.apartment && `кв. ${details.apartment}`
  ];
  
  return parts.filter(Boolean).join(', ');
}
