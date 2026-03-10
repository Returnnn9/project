"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Search, MapPin, Loader2, X, Plus, Minus } from "lucide-react";
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
 onAddressSelect: (address: string) => void;
 onAddressDetailsSelect?: (details: AddressDetails) => void;
 onError?: (error: string | null) => void;
 className?: string;
 hideSearch?: boolean;
 externalCoords?: [number, number] | null;
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

declare global {
 interface Window {
  mapgl: any;
 }
}

export default function MapPicker({
 initialAddress,
 onAddressSelect,
 onAddressDetailsSelect,
 onError,
 className,
 hideSearch,
 externalCoords,
}: MapPickerProps) {
 const API_KEY = process.env.NEXT_PUBLIC_2GIS_API_KEY || "";

 const [isLoaded, setIsLoaded] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const mapRef = useRef<HTMLDivElement>(null);
 const mapInstance = useRef<any>(null);
 const lastReportedCoords = useRef<[number, number] | null>(null);

 const [searchQuery, setSearchQuery] = useState(initialAddress || "");
 const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
 const [isLocating, setIsLocating] = useState(false);
 const [isMoving, setIsMoving] = useState(false);
 const [showSuggestions, setShowSuggestions] = useState(false);

 const isProgrammatic = useRef(false);
 const inputRef = useRef<HTMLInputElement>(null);
 const suggestRef = useRef<HTMLDivElement>(null);
 const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

 // Sync callbacks to refs to prevent map re-initialization on parent render
 const onAddressSelectRef = useRef(onAddressSelect);
 const onAddressDetailsSelectRef = useRef(onAddressDetailsSelect);

 useEffect(() => {
  onAddressSelectRef.current = onAddressSelect;
  onAddressDetailsSelectRef.current = onAddressDetailsSelect;
 }, [onAddressSelect, onAddressDetailsSelect]);

 // Sync error with parent
 useEffect(() => {
  if (onError) onError(error);
 }, [error, onError]);

 // Handle address selections using refs
 const handleAddressSelect = useCallback((details: AddressDetails) => {
  const fullAddr = details.full;
  setSearchQuery(fullAddr);
  if (onAddressSelectRef.current) onAddressSelectRef.current(fullAddr);
  if (onAddressDetailsSelectRef.current) onAddressDetailsSelectRef.current(details);
 }, []);

 // Reverse geocoding via 2GIS backend
 const reverseGeocodeRef = useRef(async (coords: [number, number]) => {
  try {
   const [lat, lon] = coords;
   const res = await fetch(`/api/address/reverse?lat=${lat}&lon=${lon}`);
   const data = await res.json();

   if (data && !data.error) {
    lastReportedCoords.current = coords;
    handleAddressSelect({
     full: data.full || `${data.road}, ${data.house}`,
     road: data.road || "",
     house: data.house || "",
     city: data.city || "",
     coords: coords,
    });
   }
  } catch (e) {
   console.error("2GIS Reverse Geocode error:", e);
  }
 });

 const updateMapLocationRef = useRef((coords: [number, number], doReverse = true) => {
  if (!mapInstance.current) return;

  const center = [coords[1], coords[0]];

  if (!doReverse) {
   isProgrammatic.current = true;
  }

  mapInstance.current.setCenter(center);

  if (doReverse) {
   reverseGeocodeRef.current(coords);
  }

  if (!doReverse) {
   setTimeout(() => { isProgrammatic.current = false }, 500);
  }
 });

 const geocodeAddressRef = useRef(async (address: string) => {
  if (!address?.trim()) return;
  try {
   const params = new URLSearchParams({ q: address });
   const res = await fetch(`/api/address/search?${params}`);
   const data = await res.json();
   if (data && data.length > 0 && data[0].lat && data[0].lon) {
    updateMapLocationRef.current([parseFloat(data[0].lat), parseFloat(data[0].lon)], false);
   }
  } catch (e) {
   console.error("2GIS Geocode error:", e);
  }
 });

 // --- Map Initialization logic ---
 useEffect(() => {
  if (document.getElementById("2gis-maps-script")) {
   if (window.mapgl) setIsLoaded(true);
   return;
  }
  const script = document.createElement("script");
  script.id = "2gis-maps-script";
  script.src = "https://mapgl.2gis.com/api/js/v1";
  script.async = true;
  script.onload = () => setIsLoaded(true);
  script.onerror = () => setError("Failed to load 2GIS Maps");
  document.head.appendChild(script);
 }, []);

 useEffect(() => {
  if (!isLoaded || !mapRef.current || mapInstance.current || !window.mapgl) return;

  try {
   const initialCoords: [number, number] = externalCoords || [55.7558, 37.6173];
   const center = [initialCoords[1], initialCoords[0]]; // Lon, Lat

   const map = new window.mapgl.Map(mapRef.current, {
    center: center,
    zoom: 16,
    key: API_KEY,
    zoomControl: false, // Disabling native zoom controls as per request
   });

   mapInstance.current = map;

   map.on('move', () => {
    setIsMoving(true);
   });

   map.on('moveend', () => {
    setIsMoving(false);
    if (!isProgrammatic.current) {
     const newCenter = map.getCenter();
     reverseGeocodeRef.current([newCenter[1], newCenter[0]]);
    }
   });

   if (initialAddress && !externalCoords) {
    geocodeAddressRef.current(initialAddress);
   }

  } catch (e) {
   console.error("2GIS Map Init Error:", e);
   setError("Failed to initialize map");
  }

  // Cleanup should ONLY run on unmount, not on every prop change!
  return () => {
   if (mapInstance.current) {
    mapInstance.current.destroy();
    mapInstance.current = null;
   }
  };
  // Empty dependency array ensures this effect runs exactly once when loaded
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [isLoaded, API_KEY]);
 // Removed other dependencies to fix map refreshing entirely.

 // Sync with externalCoords - strictly controlled
 useEffect(() => {
  if (externalCoords && mapInstance.current) {
   // 1. Precise check: if same as last dragged center, do nothing.
   if (lastReportedCoords.current &&
    Math.abs(lastReportedCoords.current[0] - externalCoords[0]) < 0.00001 &&
    Math.abs(lastReportedCoords.current[1] - externalCoords[1]) < 0.00001) {
    return;
   }

   const currentCenter = mapInstance.current.getCenter(); // [lon, lat]
   const deltaLat = Math.abs(currentCenter[1] - externalCoords[0]);
   const deltaLon = Math.abs(currentCenter[0] - externalCoords[1]);

   // 2. Threshold check (~10 meters now for extra safety)
   if (deltaLat > 0.0001 || deltaLon > 0.0001) {
    isProgrammatic.current = true;
    const center = [externalCoords[1], externalCoords[0]];
    mapInstance.current.setCenter(center);
    setTimeout(() => { isProgrammatic.current = false }, 500);
   }
  }
 }, [externalCoords]);

 // Custom Zoom Controls
 const handleZoomIn = () => {
  if (mapInstance.current) {
   mapInstance.current.setZoom(mapInstance.current.getZoom() + 1);
  }
 };

 const handleZoomOut = () => {
  if (mapInstance.current) {
   mapInstance.current.setZoom(mapInstance.current.getZoom() - 1);
  }
 };

 // Search Suggestions fetch
 const fetchSuggestions = async (query: string) => {
  if (query.length < 2) {
   setSuggestions([]);
   return;
  }
  try {
   const params = new URLSearchParams({ q: query });
   const res = await fetch(`/api/address/search?${params}`);
   const data = await res.json();
   setSuggestions(data);
  } catch (e) {
   console.error("Fetch suggestions error:", e);
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
       <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#9146ff] transition-colors" />
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
       className="w-full bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl pl-12 pr-12 py-4 text-[15px] font-[500] text-gray-900 placeholder:text-gray-400 shadow-[0_8px_30px_rgb(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#9146ff]/20 focus:border-[#9146ff] transition-all"
      />
      {searchQuery && (
       <button
        onClick={() => {
         setSearchQuery("");
         setSuggestions([]);
        }}
        className="absolute inset-y-0 right-4 flex items-center"
       >
        <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
       </button>
      )}
     </div>

     {showSuggestions && suggestions.length > 0 && (
      <div
       ref={suggestRef}
       className="bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
      >
       {suggestions.map((s, idx) => (
        <button
         key={idx}
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
         className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 text-left border-b last:border-0 border-gray-100 transition-colors"
        >
         <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
         <div className="flex flex-col">
          <span className="text-[14px] font-[600] text-gray-900 leading-tight">
           {s.address?.title || s.display_name.split(',')[0]}
          </span>
          <span className="text-[12px] font-[400] text-gray-500 mt-0.5">
           {s.address?.subtitle || s.display_name}
          </span>
         </div>
        </button>
       ))}
      </div>
     )}
    </div>
   )}

   <div className="flex-1 w-full bg-[#f3f0ea] rounded-2xl overflow-hidden relative border border-gray-100 shadow-inner">
    {/* Map Mount Point */}
    <div ref={mapRef} className="absolute inset-0 z-0" />

    {/* Custom Map Controls */}
    <div className="absolute right-4 top-4 z-[500] flex flex-col items-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] rounded-xl overflow-hidden bg-white/95 backdrop-blur-sm border border-black/5">
     <button
      onClick={handleZoomIn}
      className="w-10 h-10 flex items-center justify-center bg-transparent hover:bg-gray-50 transition-colors border-b border-black/5 text-[#333]"
      title="Приблизить"
     >
      <Plus className="w-5 h-5 stroke-[2.5px]" />
     </button>
     <button
      onClick={handleZoomOut}
      className="w-10 h-10 flex items-center justify-center bg-transparent hover:bg-gray-50 transition-colors text-[#333]"
      title="Отдалить"
     >
      <Minus className="w-5 h-5 stroke-[2.5px]" />
     </button>
    </div>

    {/* Static Center Pin Overlay */}
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[500]">
     <div className={`relative flex flex-col items-center transition-transform duration-200 ${isMoving ? '-translate-y-4' : '-translate-y-2'}`}>
      <div className="w-9 h-9 bg-[#FF3366] rounded-full shadow-[0_4px_16px_rgba(255,51,102,0.4)] flex items-center justify-center border-[3px] border-white z-10">
       <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
      </div>
      <div className="w-1 h-3.5 bg-gradient-to-b from-[#FF3366] to-transparent -mt-0.5 z-0"></div>
      <div className={`w-4 h-1.5 bg-black/20 rounded-[50%] blur-[2px] transition-all duration-200 ${isMoving ? 'scale-75 opacity-50 mt-4' : 'scale-100 opacity-100 mt-1'}`}></div>
     </div>
    </div>
    {!isLoaded && (
     <div className="absolute inset-0 flex items-center justify-center bg-[#f3f0ea] z-[1001]">
      <Loader2 className="w-8 h-8 text-smusl-terracotta animate-spin" />
      <span className="ml-3 text-sm font-medium text-gray-600">Загрузка карты 2GIS...</span>
     </div>
    )}

   </div>

   {error && (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2">
     {error}
    </div>
   )}
  </div>
 );
}
