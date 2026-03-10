"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { OSMSuggestion, CityKey } from '../lib/types/address';

export function useAddressSearch(selectedCity: CityKey) {
 const [suggestions, setSuggestions] = useState<OSMSuggestion[]>([]);
 const [isLoading, setIsLoading] = useState(false);
 const [isLocating, setIsLocating] = useState(false);
 const searchTimeout = useRef<NodeJS.Timeout | null>(null);
 const skipNextFetch = useRef<boolean>(false);

 const fetchSuggestions = useCallback(async (query: string) => {
  if (query.length < 3) {
   setSuggestions(prev => (prev.length > 0 ? [] : prev));
   return;
  }
  setIsLoading(true);
  try {
   const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    limit: '15',
    'accept-language': 'ru',
   });
   const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'Accept-Language': 'ru', 'User-Agent': 'smuslest-app/1.0' }
   });
   const data: OSMSuggestion[] = await res.json();

   const uniqueSuggestions: OSMSuggestion[] = [];
   const seen = new Set<string>();

   for (const s of data) {
    const road = (s.address?.road || s.address?.pedestrian || s.address?.suburb || s.display_name.split(',')[0] || "").trim();
    const houseNum = (s.address?.house_number || "").trim();
    const title = houseNum ? `${road}, ${houseNum}` : road;
    const city = (s.address?.city || s.address?.town || s.address?.village || selectedCity || "").trim();

    const key = `${title}|${city}`.toLowerCase().replace(/\s+/g, ' ').replace(/ё/g, 'е');

    if (!seen.has(key) && road) {
     seen.add(key);
     uniqueSuggestions.push(s);
    }
   }

   const final = uniqueSuggestions.slice(0, 6);
   setSuggestions(prev => {
    if (prev.length === 0 && final.length === 0) return prev;
    // Simple shallow check for demo, usually enough to break immediate loops
    return final;
   });
  } catch (err) {
   console.error('Search error:', err);
  } finally {
   setIsLoading(false);
  }
 }, [selectedCity]);

 const geolocate = useCallback(async (onSuccess: (address: string, coords: [number, number], city?: CityKey) => void) => {
  if (!navigator.geolocation) return;
  setIsLocating(true);
  navigator.geolocation.getCurrentPosition(
   async (pos) => {
    try {
     const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&accept-language=ru`,
      { headers: { 'Accept-Language': 'ru' } }
     );
     const data: OSMSuggestion = await res.json();
     const a = data.address || {};

     const geoCity = a.city || a.town || a.village || '';
     let matchedCity: CityKey | undefined;

     if (geoCity.includes('Москва')) matchedCity = 'Москва';
     else if (geoCity.includes('Санкт') || geoCity.includes('Петербург')) matchedCity = 'Санкт-Петербург';

     const parts: string[] = [];
     if (a.road) parts.push(a.road);
     if (a.house_number) parts.push(a.house_number);

     const addr = parts.length > 0 ? parts.join(', ') : data.display_name.split(',')[0];
     onSuccess(addr, [pos.coords.latitude, pos.coords.longitude], matchedCity);
    } catch (err) {
     console.error('Reverse geocode error:', err);
    } finally {
     setIsLocating(false);
    }
   },
   () => setIsLocating(false),
   { timeout: 8000 }
  );
 }, []);

 return {
  suggestions,
  setSuggestions,
  isLoading,
  isLocating,
  skipNextFetch,
  fetchSuggestions,
  geolocate,
  searchTimeout
 };
}
