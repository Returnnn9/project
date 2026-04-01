"use client";

export interface AddressDetails {
  street: string;
  house: string;
  corpus: string;
  entrance: string;
  floor: string;
  apartment: string;
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
      // Handle cases without the prefix if it's just a number and looks like it could be one of these
      // But for now, we rely on the specific prefixes we add in handleNextFromDelivery
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
