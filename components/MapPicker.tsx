"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Loader2, Plus, Minus, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { CityKey, OSMSuggestion, AddressEntity } from "@/lib/types/address";
import { useAddressSearch, saveSearchHistory } from "@/hooks/useAddressSearch";
import { entityFromApiResponse, entityFromSuggestion } from "@/lib/address";
import AddressSearchBox from "./AddressSearchBox";

interface MapPickerProps {
  initialAddress?: string;
  city?: string;
  onAddressSelect: (address: string) => void;
  onAddressDetailsSelect?: (details: AddressEntity) => void;
  onError?: (error: string | null) => void;
  className?: string;
  hideSearch?: boolean;
  showGeolocate?: boolean;
  externalCoords?: [number, number] | null;
  interactive?: boolean;
}

const MAP_SCRIPT_ID = "2gis-mapgl-script";
const MAPS_KEY = process.env.NEXT_PUBLIC_2GIS_API_KEY_MAPS;

// [lon, lat] — 2GIS coordinate order (Moscow default)
const DEFAULT_CENTER: [number, number] = [37.6173, 55.7558];

function toLngLat(latLon: [number, number]): [number, number] {
  return [latLon[1], latLon[0]];
}

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
  const [searchQuery, setSearchQuery] = useState(initialAddress || "");
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const lastReportedCoords = useRef<[number, number] | null>(null);
  // Tracks the [lon, lat] we programmatically set via setCenter.
  // moveend checks this to skip reverse geocoding for programmatic moves.
  const lastProgrammaticCenter = useRef<[number, number] | null>(null);
  const initialCenter = useRef<[number, number]>(
    externalCoords ? toLngLat(externalCoords) : DEFAULT_CENTER
  );

  const onAddressSelectRef = useRef(onAddressSelect);
  const onAddressDetailsSelectRef = useRef(onAddressDetailsSelect);
  useEffect(() => {
    onAddressSelectRef.current = onAddressSelect;
    onAddressDetailsSelectRef.current = onAddressDetailsSelect;
  }, [onAddressSelect, onAddressDetailsSelect]);

  useEffect(() => { onError?.(error); }, [error, onError]);

  // ─── Address search hook ───────────────────────────────────────────────────
  const cityKey: CityKey = city === "Санкт-Петербург" ? "Санкт-Петербург" : "Москва";
  const {
    suggestions,
    clearSuggestions,
    isLoading,
    isLocating,
    history,
    onHistoryCleared,
    debouncedSearch,
  } = useAddressSearch(cityKey);

  // ─── Address selection (from search or reverse geocode) ───────────────────
  const handleAddressSelect = useCallback((entity: AddressEntity) => {
    setSearchQuery(entity.displayLine);
    onAddressSelectRef.current(entity.full);
    onAddressDetailsSelectRef.current?.(entity);
  }, []);

  // ─── Reverse geocode when map pans ────────────────────────────────────────
  const reverseGeocodeRef = useRef(async (coords: [number, number]) => {
    try {
      const [lat, lon] = coords;
      const res = await fetch(`/api/address/reverse?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (data && !data.error) {
        lastReportedCoords.current = coords;
        const entity = entityFromApiResponse({
          road: data.road || '',
          house: data.house || '',
          city: data.city || '',
          lat,
          lon,
        });
        handleAddressSelect(entity);
      }
    } catch (e) {
      console.error("[MapPicker] reverse geocode error:", e);
    }
  });

  // ─── Load 2GIS MapGL script ────────────────────────────────────────────────
  useEffect(() => {
    // @ts-ignore
    if (window.mapgl) { setIsLoaded(true); return; }

    let script = document.getElementById(MAP_SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = MAP_SCRIPT_ID;
      script.src = "https://mapgl.2gis.com/api/js";
      script.async = true;
      document.head.appendChild(script);
    }

    const onLoad = () => {
      // @ts-ignore
      if (window.mapgl) setIsLoaded(true);
    };
    const onErr = () => setError("Не удалось загрузить карту");

    script.addEventListener("load", onLoad);
    script.addEventListener("error", onErr);
    // @ts-ignore
    if (window.mapgl) setIsLoaded(true);

    return () => {
      script?.removeEventListener("load", onLoad);
      script?.removeEventListener("error", onErr);
    };
  }, []);

  // ─── Initialise map (once, when script is ready) ──────────────────────────
  useEffect(() => {
    // @ts-ignore
    if (!isLoaded || !mapContainerRef.current || mapInstance.current || !window.mapgl) return;

    const container = mapContainerRef.current;

    const initMap = (): boolean => {
      if (mapInstance.current) return true;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;

      try {
        // @ts-ignore
        const map = new window.mapgl.Map(container, {
          center: initialCenter.current,
          zoom: 16,
          key: MAPS_KEY,
          zoomControl: false,
        });

        // Hide built-in MapGL controls — we render our own
        try {
          const s = document.createElement("style");
          s.textContent =
            '[class*="mapgl__ctrl"],[class*="mapgl-ctrl"],[class*="_ctrl_"],[class*="control_"]{display:none!important}';
          container.appendChild(s);
        } catch {}

        map.on("movestart", () => setIsMoving(true));
        map.on("moveend", () => {
          setIsMoving(false);
          const [lon, lat] = map.getCenter(); // 2GIS: [lon, lat]
          const lpc = lastProgrammaticCenter.current;
          if (lpc && Math.abs(lpc[0] - lon) < 0.00001 && Math.abs(lpc[1] - lat) < 0.00001) {
            // This moveend was triggered by our own setCenter call — skip reverse geocode
            lastProgrammaticCenter.current = null;
            return;
          }
          lastProgrammaticCenter.current = null;
          reverseGeocodeRef.current([lat, lon]);
        });

        mapInstance.current = map;
        return true;
      } catch (e) {
        console.error("[MapPicker] init error:", e);
        setError("Ошибка инициализации карты");
        return true;
      }
    };

    const ok = initMap();

    let ro: ResizeObserver | null = null;
    if (!ok && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        if (initMap() && ro) ro.disconnect();
      });
      ro.observe(container);
    }

    return () => {
      if (ro) ro.disconnect();
      if (mapInstance.current) {
        try { mapInstance.current.destroy(); } catch {}
        mapInstance.current = null;
      }
    };
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Auto-geolocate on first load ─────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || externalCoords) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords([latitude, longitude]);
        if (mapInstance.current) {
          lastProgrammaticCenter.current = [longitude, latitude];
          mapInstance.current.setCenter([longitude, latitude]);
          reverseGeocodeRef.current([latitude, longitude]);
        }
      },
      undefined,
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  }, [isLoaded, externalCoords]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Sync external coords ─────────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstance.current || !externalCoords) return;
    const [lat, lon] = externalCoords;
    const last = lastReportedCoords.current;
    if (last && Math.abs(last[0] - lat) < 0.0001 && Math.abs(last[1] - lon) < 0.0001) return;
    lastProgrammaticCenter.current = [lon, lat];
    mapInstance.current.setCenter([lon, lat]);
    lastReportedCoords.current = [lat, lon];
  }, [externalCoords]);

  // ─── Zoom buttons ─────────────────────────────────────────────────────────
  const handleZoomIn = () => {
    if (mapInstance.current) mapInstance.current.setZoom(mapInstance.current.getZoom() + 1);
  };
  const handleZoomOut = () => {
    if (mapInstance.current) mapInstance.current.setZoom(mapInstance.current.getZoom() - 1);
  };

  // ─── Geolocation button ───────────────────────────────────────────────────
  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Геолокация не поддерживается");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords([latitude, longitude]);
        if (mapInstance.current) {
          lastProgrammaticCenter.current = [longitude, latitude];
          mapInstance.current.setCenter([longitude, latitude]);
          reverseGeocodeRef.current([latitude, longitude]);
        }
      },
      (err) => {
        if (err.code === 1) {
          setError("Доступ к геопозиции запрещён");
          setTimeout(() => setError(null), 3000);
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Suggestion selected ──────────────────────────────────────────────────
  const handleSuggestionSelect = useCallback(
    (item: OSMSuggestion) => {
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);

      if (!isNaN(lat) && !isNaN(lon) && mapInstance.current) {
        lastProgrammaticCenter.current = [lon, lat];
        mapInstance.current.setCenter([lon, lat]);
        lastReportedCoords.current = [lat, lon];
      }

      saveSearchHistory(cityKey, item);

      const entity = entityFromSuggestion(item);
      handleAddressSelect(entity);
    },
    [handleAddressSelect, cityKey]
  );

  // ─── Search query change ──────────────────────────────────────────────────
  const handleQueryChange = useCallback(
    (q: string) => {
      setSearchQuery(q);
      if (q.trim().length < 2) clearSuggestions();
      else debouncedSearch(q);
    },
    [debouncedSearch, clearSuggestions]
  );

  const handleClear = useCallback(() => {
    setSearchQuery("");
    clearSuggestions();
  }, [clearSuggestions]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={cn("relative w-full h-full flex flex-col min-h-[400px]", className)}>
      {/* Search box */}
      {!hideSearch && (
        <div className="absolute top-4 left-4 right-4 z-[1000]">
          <AddressSearchBox
            query={searchQuery}
            onQueryChange={handleQueryChange}
            onSelect={handleSuggestionSelect}
            onClear={handleClear}
            onGeolocate={showGeolocate ? handleLocateUser : undefined}
            suggestions={suggestions}
            history={history}
            onClearHistory={onHistoryCleared}
            isLoading={isLoading}
            isLocating={isLocating}
            userCoords={userCoords}
          />
        </div>
      )}

      {/* Map area */}
      <div className="flex-1 w-full bg-[#f3f0ea] rounded-2xl overflow-hidden relative border border-gray-100 shadow-inner">
        <div ref={mapContainerRef} className="absolute inset-0 z-0" />

        {/* Map controls — right center */}
        {interactive && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-[1000]">
            <div className="flex flex-col items-center shadow-[0_4px_20px_rgba(0,0,0,0.12)] rounded-[1.2rem] overflow-hidden bg-white/95 backdrop-blur-sm border border-black/5">
              <button
                onClick={handleZoomIn}
                className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 border-b border-black/5 text-[#3A332E] transition-colors active:bg-gray-100"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 text-[#3A332E] transition-colors active:bg-gray-100"
              >
                <Minus className="w-5 h-5" />
              </button>
            </div>

            {showGeolocate && (
              <button
                onClick={handleLocateUser}
                className="w-11 h-11 flex items-center justify-center bg-white/95 backdrop-blur-sm border border-black/5 shadow-[0_4px_20px_rgba(0,0,0,0.12)] rounded-[1.2rem] hover:bg-gray-50 text-[#3A332E] transition-all active:scale-95"
              >
                <Navigation className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Center crosshair pin */}
        {interactive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[500]">
            <div
              className={cn(
                "relative flex flex-col items-center transition-transform duration-200 ease-out",
                isMoving ? "-translate-y-5" : "-translate-y-2"
              )}
            >
              <div className="w-9 h-9 bg-[#3A332E] rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.3)] flex items-center justify-center border-2 border-white z-10">
                <div className="w-2.5 h-2.5 bg-white rounded-full" />
              </div>
              <div className="w-1 h-3.5 bg-gradient-to-b from-[#3A332E] to-transparent -mt-0.5 z-0" />
              {isMoving && (
                <div className="absolute top-full mt-1 w-4 h-1.5 bg-black/10 rounded-full blur-[2px]" />
              )}
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {!isLoaded && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#f3f0ea] z-[1001]">
            <Loader2 className="w-8 h-8 text-[#CF8F73] animate-spin" />
            <span className="text-sm font-medium text-gray-500">Загрузка карты...</span>
          </div>
        )}

        {/* Error overlay */}
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
