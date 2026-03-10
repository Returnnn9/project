import { PickupPoint, CityKey } from "../types/address";

export const PICKUP_POINTS: PickupPoint[] = [
 { city: "Москва", address: "Ижорская 3", coords: [55.882, 37.514] },
 { city: "Москва", address: "Арбат 5", coords: [55.752, 37.598] },
 { city: "Москва", address: "Ленинская 2", coords: [55.748, 37.618] },
 { city: "Москва", address: "Пушкина 12", coords: [55.755, 37.617] },
 { city: "Москва", address: "Садовая 8", coords: [55.759, 37.60] },
 { city: "Санкт-Петербург", address: "Невский проспект, 28", coords: [59.935, 30.325] },
 { city: "Санкт-Петербург", address: "Лиговский пр., 10", coords: [59.930, 30.362] },
 { city: "Санкт-Петербург", address: "Садовая ул., 10", coords: [59.932, 30.339] },
];

export const CITY_CONFIG: Record<CityKey, { viewbox: string; short: string }> = {
 'Москва': { viewbox: '36.8,56.0,38.0,55.4', short: 'мск' },
 'Санкт-Петербург': { viewbox: '29.5,60.2,30.8,59.7', short: 'спб' },
};
