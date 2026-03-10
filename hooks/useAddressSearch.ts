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
  if (query.length < 2) {
   setSuggestions(prev => (prev.length > 0 ? [] : prev));
   return;
  }
  setIsLoading(true);
  try {
   const params = new URLSearchParams({ q: query, city: selectedCity });
   const res = await fetch(`/api/address/search?${params}`);
   const data: OSMSuggestion[] = await res.json();

   const uniqueSuggestions: OSMSuggestion[] = [];
   const seen = new Set<string>();

   for (const s of data) {
    const title = (s.address as any)?.title || s.display_name;
    const subtitle = (s.address as any)?.subtitle || selectedCity;
    const key = `${title}|${subtitle}`.toLowerCase().replace(/\s+/g, ' ').replace(/ё/g, 'е');

    if (!seen.has(key)) {
     seen.add(key);
     uniqueSuggestions.push(s);
    }
   }

   const final = uniqueSuggestions.slice(0, 8);
   setSuggestions(prev => {
    if (prev.length === 0 && final.length === 0) return prev;
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
     const { latitude, longitude } = pos.coords;
     const res = await fetch(`/api/address/reverse?lat=${latitude}&lon=${longitude}`);
     const data = await res.json();

     if (data.error) throw new Error(data.error);

     let matchedCity: CityKey | undefined;
     const geoCity = data.city || '';

     if (geoCity.includes('Москва')) matchedCity = 'Москва';
     else if (geoCity.includes('Санкт') || geoCity.includes('Петербург')) matchedCity = 'Санкт-Петербург';

     const addr = data.full || `${data.road}, ${data.house}`;
     onSuccess(addr, [latitude, longitude], matchedCity);
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
