export interface AddressEntity {
  road: string;
  house: string;
  corpus: string;
  entrance: string;
  floor: string;
  apartment: string;
  city: string;
  coords: [number, number] | null;
  displayLine: string;
  full: string;
}

export function emptyAddress(): AddressEntity {
  return {
    road: '', house: '', corpus: '', entrance: '', floor: '', apartment: '',
    city: '', coords: null, displayLine: '', full: '',
  };
}

export interface OSMSuggestion {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    pedestrian?: string;
    suburb?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    title?: string;
    subtitle?: string;
    [key: string]: string | undefined;
  };
}

export interface PickupPoint {
  city: 'Москва' | 'Санкт-Петербург';
  address: string;
  coords: [number, number];
}

export type CityKey = 'Москва' | 'Санкт-Петербург';
