"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { OSMSuggestion, CityKey } from '../lib/types/address';
import { normalizeText } from '../lib/address';

const DEBOUNCE_MS = 220;
const MIN_LEN = 2;
const CACHE_TTL = 5 * 60 * 1000;
const MAX_HISTORY = 5;

// Module-level cache shared across all hook instances
const queryCache = new Map<string, { results: OSMSuggestion[]; ts: number }>();

function scoreResult(item: OSMSuggestion, normalQ: string): number {
  const title = normalizeText(item.address?.title || item.display_name || '');
  let score = 0;
  if (title === normalQ) score += 200;
  else if (title.startsWith(normalQ)) score += 100;
  else if (title.includes(normalQ)) score += 60;
  const words = normalQ.split(/\s+/).filter((w) => w.length > 1);
  score += words.filter((w) => title.includes(w)).length * 20;
  if (item.address?.house_number) score += 8;
  return score;
}

export function getSearchHistory(city: string): OSMSuggestion[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(`addr-hist-${city}`) || '[]'); }
  catch { return []; }
}

export function saveSearchHistory(city: string, item: OSMSuggestion) {
  if (typeof window === 'undefined') return;
  try {
    const key = normalizeText(item.address?.title || item.display_name || '');
    const prev = getSearchHistory(city).filter(
      (h) => normalizeText(h.address?.title || h.display_name || '') !== key
    );
    localStorage.setItem(`addr-hist-${city}`, JSON.stringify([item, ...prev].slice(0, MAX_HISTORY)));
  } catch {}
}

export function clearSearchHistory(city: string) {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(`addr-hist-${city}`); } catch {}
}

export function useAddressSearch(selectedCity: CityKey) {
  const [suggestions, setSuggestions] = useState<OSMSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [history, setHistory] = useState<OSMSuggestion[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setHistory(getSearchHistory(selectedCity));
  }, [selectedCity]);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    const q = query.trim();
    if (q.length < MIN_LEN) { setSuggestions([]); setIsLoading(false); return; }

    const cacheKey = `${selectedCity}::${normalizeText(q)}`;
    const hit = queryCache.get(cacheKey);
    if (hit && Date.now() - hit.ts < CACHE_TTL) {
      setSuggestions(hit.results);
      setIsLoading(false);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch(
        `/api/address/search?${new URLSearchParams({ q, city: selectedCity })}`,
        { signal: abortRef.current.signal }
      );
      if (!res.ok) throw new Error('search failed');

      const raw: OSMSuggestion[] = await res.json();
      const normalQ = normalizeText(q);
      const seen = new Set<string>();

      const scored = (raw as Array<OSMSuggestion & { _score?: number }>)
        .filter((item) => {
          const k = normalizeText(item.address?.title || item.display_name || '');
          if (!k || seen.has(k)) return false;
          seen.add(k);
          return true;
        })
        .map((item) => ({ ...item, _score: scoreResult(item, normalQ) }))
        .sort((a, b) => (b._score ?? 0) - (a._score ?? 0))
        .slice(0, 6);

      queryCache.set(cacheKey, { results: scored, ts: Date.now() });
      setSuggestions(scored);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('[useAddressSearch]', err);
        setSuggestions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedCity]);

  const debouncedSearch = useCallback((query: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (query.trim().length < MIN_LEN) { setSuggestions([]); setIsLoading(false); return; }
    setIsLoading(true);
    timeoutRef.current = setTimeout(() => fetchSuggestions(query), DEBOUNCE_MS);
  }, [fetchSuggestions]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setIsLoading(false);
  }, []);

  const refreshHistory = useCallback(() => {
    setHistory(getSearchHistory(selectedCity));
  }, [selectedCity]);

  const onHistoryCleared = useCallback(() => {
    clearSearchHistory(selectedCity);
    setHistory([]);
  }, [selectedCity]);

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
          if (!res.ok) throw new Error('reverse failed');
          const data = await res.json();
          if (data.error) throw new Error(data.error);

          let matchedCity: CityKey | undefined;
          const gCity = (data.city || '').toLowerCase();
          if (gCity.includes('москва')) matchedCity = 'Москва';
          else if (gCity.includes('санкт') || gCity.includes('петербург')) matchedCity = 'Санкт-Петербург';

          const addr = data.title || data.full || [data.road, data.house].filter(Boolean).join(', ');
          onSuccess(addr, [latitude, longitude], matchedCity);
        } catch (err) {
          console.error('[geolocate]', err);
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
    history,
    refreshHistory,
    onHistoryCleared,
    debouncedSearch,
    geolocate,
  };
}
