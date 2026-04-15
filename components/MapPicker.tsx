"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Search, MapPin, Loader2, X, Plus, Minus, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Public API ──────────────────────────────────────────────────────────────

export interface AddressDetails {
  full: string;
  road?: string;
  house?: string;
  city?: string;
  apartment?: string;
  coords?: [number, number]; // [lat, lon]
}

interface MapPickerProps {
  initialAddress?: string;
  city?: string; // e.g. 'Москва' | 'Санкт-Петербург' — passed to address search API
  onAddressSelect: (address: string) => void;
  onAddressDetailsSelect?: (details: AddressDetails) => void;
  onError?: (error: string | null) => void;
  className?: string;
  hideSearch?: boolean;
  showGeolocate?: boolean;
  externalCoords?: [number, number] | null; // [lat, lon]
  interactive?: boolean;
}

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    house_number?: string;
    city?: string;
    title?: string;
    subtitle?: string;
  };
}

// ─── Minimal Leaflet typings (CDN, no npm install) ──────────────────────────

interface LeafletMap {
  setView(center: [number, number], zoom?: number): void;
  getCenter(): { lat: number; lng: number };
  setZoom(zoom: number): void;
  getZoom(): number;
  on(event: string, handler: () => void): void;
  remove(): void;
  invalidateSize(): void;
}

interface LeafletTileLayer {
  addTo(map: LeafletMap): void;
}

declare global {
  interface Window {
    L: {
      map(
        container: HTMLElement,
        options: {
          center: [number, number];
          zoom: number;
          zoomControl?: boolean;
          dragging?: boolean;
          scrollWheelZoom?: boolean;
          doubleClickZoom?: boolean;
          touchZoom?: boolean;
          keyboard?: boolean;
          attributionControl?: boolean;
        }
      ): LeafletMap;
      tileLayer(
        url: string,
        options?: { attribution?: string; maxZoom?: number; subdomains?: string }
      ): LeafletTileLayer;
    };
  }
}

// ─── Constants ───────────────────────────────────────────────────────────────

const LEAFLET_CSS_ID = "leaflet-css";
const LEAFLET_JS_ID = "leaflet-js";
const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

// CartoDB Voyager — clean, modern look, no API key required
const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const DEFAULT_CENTER: [number, number] = [55.7558, 37.6173]; // Москва

// ─── Component ───────────────────────────────────────────────────────────────

export default function MapPicker({
  initialAddress,
  city = 'Москва',
  onAddressSelect,
  onAddressDetailsSelect,
  onError,
  className,
  hideSearch,
  showGeolocate = false,
  externalCoords,
  interactive = true,
}: MapPickerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialAddress || "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const lastReportedCoords = useRef<[number, number] | null>(null);
  const isProgrammatic = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup debounce on unmount
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  // Stable callback refs so map handlers don't cause re-initialization
  const onAddressSelectRef = useRef(onAddressSelect);
  const onAddressDetailsSelectRef = useRef(onAddressDetailsSelect);
  useEffect(() => {
    onAddressSelectRef.current = onAddressSelect;
    onAddressDetailsSelectRef.current = onAddressDetailsSelect;
  }, [onAddressSelect, onAddressDetailsSelect]);

  // Propagate error to parent
  useEffect(() => { onError?.(error); }, [error, onError]);

  const handleAddressSelect = useCallback((details: AddressDetails) => {
    setSearchQuery(details.full);
    onAddressSelectRef.current(details.full);
    onAddressDetailsSelectRef.current?.(details);
  }, []);

  // Reverse geocode (lat, lon) → address text via our /api/address/reverse proxy
  const reverseGeocodeRef = useRef(async (coords: [number, number]) => {
    try {
      const [lat, lon] = coords;
      const res = await fetch(`/api/address/reverse?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (data && !data.error) {
        lastReportedCoords.current = coords;
        handleAddressSelect({
          full: data.full || [data.road, data.house].filter(Boolean).join(", "),
          road: data.road || "",
          house: data.house || "",
          city: data.city || "",
          coords,
        });
      }
    } catch (e) {
      console.error("[MapPicker] reverse geocode error:", e);
    }
  });

  // Move map to coords; optionally trigger reverse geocode
  const updateMapLocationRef = useRef((coords: [number, number], doReverse = true) => {
    if (!mapInstance.current) return;
    if (!doReverse) isProgrammatic.current = true;
    mapInstance.current.setView(coords); // Leaflet uses [lat, lng] — matches our coords
    if (doReverse) reverseGeocodeRef.current(coords);
    if (!doReverse) setTimeout(() => { isProgrammatic.current = false; }, 500);
  });

  // Geocode an address string → move map
  const geocodeAddressRef = useRef(async (address: string) => {
    if (!address.trim()) return;
    try {
      const res = await fetch(`/api/address/search?q=${encodeURIComponent(address)}`);
      const data: Suggestion[] = await res.json();
      if (data?.length > 0 && data[0].lat && data[0].lon) {
        updateMapLocationRef.current([parseFloat(data[0].lat), parseFloat(data[0].lon)], false);
      }
    } catch (e) {
      console.error("[MapPicker] geocode error:", e);
    }
  });

  // ── Load Leaflet CSS + JS from CDN ──────────────────────────────────────────
  useEffect(() => {
    // CSS (non-blocking)
    if (!document.getElementById(LEAFLET_CSS_ID)) {
      const link = document.createElement("link");
      link.id = LEAFLET_CSS_ID;
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS_URL;
      document.head.appendChild(link);
    }
    // JS
    if (document.getElementById(LEAFLET_JS_ID)) {
      if (window.L) setIsLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = LEAFLET_JS_ID;
    script.src = LEAFLET_JS_URL;
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError("Не удалось загрузить карту");
    document.head.appendChild(script);
  }, []);

  // ── Initialize map once Leaflet is ready ────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstance.current || !window.L) return;
    const container = mapRef.current;

    try {
      const center = externalCoords ?? DEFAULT_CENTER;

      const map = window.L.map(container, {
        center,
        zoom: 16,
        zoomControl: false,        // custom controls below
        dragging: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        touchZoom: interactive,
        keyboard: false,
        attributionControl: false,
      });

      window.L.tileLayer(TILE_URL, {
        attribution: '',
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      map.on("movestart", () => setIsMoving(true));
      map.on("moveend", () => {
        setIsMoving(false);
        if (!isProgrammatic.current) {
          const c = map.getCenter();
          reverseGeocodeRef.current([c.lat, c.lng]);
        }
      });

      mapInstance.current = map;

      // Allow DOM to settle before geocoding initial address
      if (initialAddress && !externalCoords) {
        setTimeout(() => geocodeAddressRef.current(initialAddress!), 200);
      }

      // Fix layout in cases where container size wasn't known at init time
      setTimeout(() => map.invalidateSize(), 100);
    } catch (e) {
      console.error("[MapPicker] init error:", e);
      setError("Не удалось инициализировать карту");
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
    // isLoaded is the only stable trigger; other deps are via refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  // ── Sync external coords ────────────────────────────────────────────────────
  useEffect(() => {
    if (!externalCoords || !mapInstance.current) return;
    if (
      lastReportedCoords.current &&
      Math.abs(lastReportedCoords.current[0] - externalCoords[0]) < 0.00001 &&
      Math.abs(lastReportedCoords.current[1] - externalCoords[1]) < 0.00001
    ) return;
    const c = mapInstance.current.getCenter();
    if (Math.abs(c.lat - externalCoords[0]) > 0.0001 || Math.abs(c.lng - externalCoords[1]) > 0.0001) {
      isProgrammatic.current = true;
      mapInstance.current.setView(externalCoords);
      setTimeout(() => { isProgrammatic.current = false; }, 500);
    }
  }, [externalCoords]);

  // ── Zoom controls ───────────────────────────────────────────────────────────
  const handleZoomIn = () => {
    if (mapInstance.current) mapInstance.current.setZoom(mapInstance.current.getZoom() + 1);
  };
  const handleZoomOut = () => {
    if (mapInstance.current) mapInstance.current.setZoom(mapInstance.current.getZoom() - 1);
  };

  // ── Address search / suggestions ────────────────────────────────────────────
  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) { setSuggestions([]); return; }
    try {
      const params = new URLSearchParams({ q: query, city });
      const res = await fetch(`/api/address/search?${params.toString()}`);
      setSuggestions(await res.json());
    } catch (e) {
      console.error("[MapPicker] suggestions error:", e);
    }
  };

  const handleInputChange = (val: string) => {
    setSearchQuery(val);
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  // ── Geolocation ─────────────────────────────────────────────────────────────
  const geolocate = useCallback(() => {
    if (!navigator.geolocation) { setError("Геолокация не поддерживается вашим браузером"); return; }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateMapLocationRef.current([pos.coords.latitude, pos.coords.longitude], true);
        setIsLocating(false);
      },
      (err) => {
        console.error("[MapPicker] geolocation error:", err);
        setError("Не удалось определить местоположение. Проверьте разрешения в браузере.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className={cn("relative w-full h-full flex flex-col min-h-[400px]", className)}>

      {/* ── Search Bar ── */}
      {!hideSearch && (
        <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col gap-2">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#CF8F73] transition-colors" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  geocodeAddressRef.current(searchQuery);
                  setShowSuggestions(false);
                }
              }}
              placeholder="Поиск адреса..."
              className="w-full bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl pl-12 pr-12 py-4 text-[15px] font-[500] text-gray-900 placeholder:text-gray-400 shadow-[0_8px_30px_rgb(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#CF8F73]/20 focus:border-[#CF8F73] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setSuggestions([]); }}
                className="absolute inset-y-0 right-4 flex items-center"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
              {/* --- Results Header --- */}
              <div className="px-4 py-2.5 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50/50 to-white">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Результаты поиска</span>
                <span className="px-2 py-0.5 bg-[#CF8F73]/10 text-[#CF8F73] rounded-full text-[10px] font-bold border border-[#CF8F73]/20">
                  {suggestions.length}
                </span>
              </div>

              <div className="max-h-[320px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                {suggestions.map((s) => (
                  <button
                    key={`${s.lat}-${s.lon}-${s.display_name}-${Math.random()}`}
                    onClick={() => {
                      handleAddressSelect({
                        full: s.display_name,
                        road: s.address?.road || "",
                        house: s.address?.house_number || "",
                        city: s.address?.city || "",
                      });
                      setShowSuggestions(false);
                      if (s.lat && s.lon) {
                        updateMapLocationRef.current([parseFloat(s.lat), parseFloat(s.lon)], false);
                      }
                    }}
                    className="w-full flex items-start gap-4 px-4 py-4 hover:bg-[#CF8F73]/5 text-left border-b last:border-0 border-gray-50 transition-all duration-200 group active:scale-[0.99]"
                  >
                    <div className="mt-1 p-2 bg-gray-50 rounded-xl group-hover:bg-[#CF8F73]/10 transition-colors">
                      <MapPin className="w-4 h-4 text-gray-400 group-hover:text-[#CF8F73] transition-colors" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[15px] font-[600] text-gray-900 leading-tight group-hover:text-[#CF8F73] transition-colors">
                        {s.address?.title || s.display_name.split(",")[0]}
                      </span>
                      <span className="text-[12px] font-[400] text-gray-500 line-clamp-1">
                        {s.address?.subtitle || s.display_name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Map Container ── */}
      <div className="flex-1 w-full bg-[#f3f0ea] rounded-2xl overflow-hidden relative border border-gray-100 shadow-inner">

        {/* Leaflet mounts here */}
        <div ref={mapRef} className="absolute inset-0 z-0" />

        {/* Custom Zoom + Geolocate Controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col items-center gap-3">
          {interactive && (
            <div className="flex flex-col items-center shadow-[0_4px_20px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm border border-black/5">
              <button
                onClick={handleZoomIn}
                className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors border-b border-black/5 text-[#3A332E]"
                title="Приблизить"
              >
                <Plus className="w-5 h-5 stroke-[3px]" />
              </button>
              <button
                onClick={handleZoomOut}
                className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors text-[#3A332E]"
                title="Отдалить"
              >
                <Minus className="w-5 h-5 stroke-[3px]" />
              </button>
            </div>
          )}

          {showGeolocate && (
            <button
              onClick={geolocate}
              disabled={isLocating}
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-black/5 hover:bg-gray-50 active:scale-95 transition-all text-[#3A332E] disabled:opacity-50"
              title="Где я"
            >
              {isLocating
                ? <Loader2 className="w-6 h-6 animate-spin" />
                : <Navigation className="w-6 h-6 fill-current" />}
            </button>
          )}
        </div>

        {/* Static center-pin overlay (no Leaflet marker needed) */}
        {interactive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[500]">
            <div
              className={`relative flex flex-col items-center transition-transform duration-200 ${
                isMoving ? "-translate-y-4" : "-translate-y-2"
              }`}
            >
              <div className="w-9 h-9 bg-[#3A332E] rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.3)] flex items-center justify-center border-2 border-white z-10">
                <div className="w-2.5 h-2.5 bg-white rounded-full" />
              </div>
              <div className="w-1 h-3.5 bg-gradient-to-b from-[#3A332E] to-transparent -mt-0.5 z-0" />
              <div
                className={`w-4 h-1.5 bg-black/20 rounded-[50%] blur-[2px] transition-all duration-200 ${
                  isMoving ? "scale-75 opacity-50 mt-4" : "scale-100 opacity-100 mt-1"
                }`}
              />
            </div>
          </div>
        )}

        {/* Loading state */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f3f0ea] z-[1001]">
            <Loader2 className="w-8 h-8 text-[#CF8F73] animate-spin" />
            <span className="ml-3 text-sm font-medium text-gray-500">Загрузка карты...</span>
          </div>
        )}
      </div>

      {/* Error toast */}
      {error && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
}
