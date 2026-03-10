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
  [key: string]: string | undefined;
 };
}

export interface AddressDetails {
 road: string;
 house: string;
 full: string;
}

export interface PickupPoint {
 city: "Москва" | "Санкт-Петербург";
 address: string;
 coords: [number, number];
}

export type CityKey = "Москва" | "Санкт-Петербург";
