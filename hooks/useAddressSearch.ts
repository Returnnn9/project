"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { OSMSuggestion, CityKey } from '../lib/types/address';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LEN = 2;

export function useAddressSearch(selectedCity: CityKey) {
  const [suggestions, setSuggestions] = useState<OSMSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const skipNextFetch = useRef<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < MIN_QUERY_LEN) {
      setSuggestions(prev => (prev.length > 0 ? [] : prev));
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    try {
      const params = new URLSearchParams({ q: query.trim(), city: selectedCity });
      const res = await fetch(`/api/address/search?${params}`, {
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error('search failed');
      const raw = await res.json();

      const seen = new Set<string>();
      const unique: OSMSuggestion[] = [];

      for (const s of raw) {
        const addr = s.address;
        const title = addr?.title || s.display_name || '';
        const key = title.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ');
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(s);
        }
      }

      setSuggestions(unique.slice(0, 8));
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('[useAddressSearch] error:', err);
        setSuggestions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedCity]);

  const debouncedSearch = useCallback((query: string) => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchSuggestions(query), DEBOUNCE_MS);
  }, [fetchSuggestions]);

  const clearSuggestions = useCallback(() => setSuggestions([]), []);

  const geolocate = useCallback(async (
    onSuccess: (address: string, coords: [number, number], city?: CityKey) => void
  ) => {
    if (!navigator.geolocation) return;
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/address/reverse?lat=${latitude}&lon=${longitude}`);
          if (!res.ok) throw new Error('reverse geocode failed');
          const data = await res.json();

          if (data.error) throw new Error(data.error);

          let matchedCity: CityKey | undefined;
          const geoCity = (data.city || '').toLowerCase();
          if (geoCity.includes('москва')) matchedCity = 'Москва';
          else if (geoCity.includes('санкт') || geoCity.includes('петербург')) matchedCity = 'Санкт-Петербург';

          const addr = data.title || data.full || [data.road, data.house].filter(Boolean).join(', ');
          onSuccess(addr, [latitude, longitude], matchedCity);
        } catch (err) {
          console.error('[geolocate] reverse geocode error:', err);
        } finally {
          setIsLocating(false);
        }
      },
      () => setIsLocating(false),
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  return {
    suggestions,
    setSuggestions,
    clearSuggestions,
    isLoading,
    isLocating,
    skipNextFetch,
    fetchSuggestions,
    debouncedSearch,
    geolocate,
  };
}
