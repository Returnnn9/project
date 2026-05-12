"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Search, MapPin, Loader2, X, Plus, Minus, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AddressDetails {
  full: string;
  road?: string;
  house?: string;
  city?: string;
  apartment?: string;
  coords?: [number, number];
}

interface MapPickerProps {
  initialAddress?: string;
  city?: string;
  onAddressSelect: (address: string) => void;
  onAddressDetailsSelect?: (details: AddressDetails) => void;
  onError?: (error: string | null) => void;
  className?: string;
  hideSearch?: boolean;
  showGeolocate?: boolean;
  externalCoords?: [number, number] | null;
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

// API key loaded securely from environment variables
const API_KEY = process.env.NEXT_PUBLIC_2GIS_API_KEY || "";
const MAPGL_SCRIPT_ID = "mapgl-script-tag";

export default function MapPicker({
  initialAddress,
  city = "Москва",
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

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const lastReportedCoords = useRef<[number, number] | null>(null);
  const isProgrammatic = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const onAddressSelectRef = useRef(onAddressSelect);
  const onAddressDetailsSelectRef = useRef(onAddressDetailsSelect);
  useEffect(() => {
    onAddressSelectRef.current = onAddressSelect;
    onAddressDetailsSelectRef.current = onAddressDetailsSelect;
  }, [onAddressSelect, onAddressDetailsSelect]);

  useEffect(() => { onError?.(error); }, [error, onError]);

  const handleAddressSelect = useCallback((details: AddressDetails) => {
    setSearchQuery(details.full);
    onAddressSelectRef.current(details.full);
    onAddressDetailsSelectRef.current?.(details);
  }, []);

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

  // Fallback if 2GIS can't load - default coords Moscow
  const DEFAULT_CENTER: [number, number] = [37.6173, 55.7558]; 

  useEffect(() => {
    let cancelled = false;
    let pollInterval: NodeJS.Timeout;

    const loadMapGL = () => {
      if (window.hasOwnProperty('mapgl')) {
        if (!cancelled) setIsLoaded(true);
        return;
      }

      if (!document.getElementById(MAPGL_SCRIPT_ID)) {
        const script = document.createElement("script");
        script.id = MAPGL_SCRIPT_ID;
        script.src = "https://mapgl.2gis.com/api/js/v1";
        script.async = true;
        script.onerror = () => {
          if (!cancelled) setError("Не удалось загрузить модуль карт");
        };
        document.head.appendChild(script);
      }

      pollInterval = setInterval(() => {
        // @ts-ignore
        if (window.mapgl) {
          clearInterval(pollInterval);
          if (!cancelled) setIsLoaded(true);
        }
      }, 200);
    };

    loadMapGL();

    return () => {
      cancelled = true;
      clearInterval(pollInterval);
    };
  }, []);

  useEffect(() => {
    // @ts-ignore
    if (!isLoaded || !mapContainerRef.current || mapInstance.current || !window.mapgl) return;

    try {
      const center = externalCoords ? [externalCoords[1], externalCoords[0]] : DEFAULT_CENTER; // 2GIS uses lng,lat

      // @ts-ignore
      const map = new window.mapgl.Map(mapContainerRef.current, {
        center,
        zoom: 16,
        key: API_KEY,
        zoomControl: false,
        lang: "ru",
      });

      map.on("movestart", () => setIsMoving(true));
      map.on("moveend", () => {
        setIsMoving(false);
        if (!isProgrammatic.current) {
          const c = map.getCenter();
          // 2GIS is [lng, lat], app needs [lat, lng]
          reverseGeocodeRef.current([c[1], c[0]]);
        }
      });

      mapInstance.current = map;

      if (initialAddress && !externalCoords) {
        // Simple reverse geocode mock for initial init
      }

      // Trigger resize to ensure rendering
      setTimeout(() => {
         window.dispatchEvent(new Event('resize'));
      }, 100);

    } catch (e) {
      console.error("[MapPicker] 2GIS init error:", e);
      setError("Ошибка инициализации карты");
    }

    return () => {
      if (mapInstance.current) {
        try {
          mapInstance.current.destroy();
        } catch(e) {}
        mapInstance.current = null;
      }
    };
  }, [isLoaded]);

  const handleZoomIn = () => {
    if (mapInstance.current) mapInstance.current.setZoom(mapInstance.current.getZoom() + 1);
  };
  const handleZoomOut = () => {
    if (mapInstance.current) mapInstance.current.setZoom(mapInstance.current.getZoom() - 1);
  };

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

  return (
    <div className={cn("relative w-full h-full flex flex-col min-h-[400px]", className)}>
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
              placeholder="Поиск адреса..."
              className="w-full bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl pl-12 pr-12 py-4 text-[15px] font-[500] text-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#CF8F73]/20 transition-all"
            />
          </div>
        </div>
      )}

      <div className="flex-1 w-full bg-[#f3f0ea] rounded-2xl overflow-hidden relative border border-gray-100 shadow-inner">
        <div ref={mapContainerRef} className="absolute inset-0 z-0" />

        {/* Zoom controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col items-center gap-3">
          {interactive && (
            <div className="flex flex-col items-center shadow-[0_4px_20px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm border border-black/5">
              <button onClick={handleZoomIn} className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 border-b border-black/5 text-[#3A332E]"><Plus className="w-5 h-5" /></button>
              <button onClick={handleZoomOut} className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 text-[#3A332E]"><Minus className="w-5 h-5" /></button>
            </div>
          )}
        </div>

        {/* Center pin */}
        {interactive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[500]">
            <div className={`relative flex flex-col items-center transition-transform duration-200 ${isMoving ? "-translate-y-4" : "-translate-y-2"}`}>
              <div className="w-9 h-9 bg-[#3A332E] rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.3)] flex items-center justify-center border-2 border-white z-10">
                <div className="w-2.5 h-2.5 bg-white rounded-full" />
              </div>
              <div className="w-1 h-3.5 bg-gradient-to-b from-[#3A332E] to-transparent -mt-0.5 z-0" />
            </div>
          </div>
        )}

        {!isLoaded && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#f3f0ea] z-[1001]">
            <Loader2 className="w-8 h-8 text-[#CF8F73] animate-spin" />
            <span className="text-sm font-medium text-gray-500">Загрузка карты...</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#f3f0ea] z-[1001] px-8 text-center">
            <MapPin className="w-10 h-10 text-[#CF8F73]/40" />
            <p className="text-sm font-medium text-gray-500">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
