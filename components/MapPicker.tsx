"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Search, MapPin, Navigation, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AddressDetails {
 full: string;
 road?: string;
 house?: string;
 city?: string;
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
  pedestrian?: string;
  house_number?: string;
  city?: string;
  town?: string;
  suburb?: string;
  state?: string;
 };
}

declare global {
 interface Window {
  ymaps: any;
 }
}

export default function MapPicker({ initialAddress, onAddressSelect, onAddressDetailsSelect, onError, className, hideSearch, externalCoords }: MapPickerProps) {
 const API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || "";

 const [isLoaded, setIsLoaded] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [useYandex, setUseYandex] = useState(false);

 const mapRef = useRef<HTMLDivElement>(null);
 const mapInstance = useRef<any>(null);
 const markerInstance = useRef<any>(null);

 const [searchQuery, setSearchQuery] = useState(initialAddress || "");
 const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
 const [isLocating, setIsLocating] = useState(false);
 const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
 const [showSuggestions, setShowSuggestions] = useState(false);
 const inputRef = useRef<HTMLInputElement>(null);
 const suggestRef = useRef<HTMLDivElement>(null);
 const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

 // Sync error with parent
 useEffect(() => {
  if (onError) onError(error);
 }, [error, onError]);

 // Close suggestions on outside click
 useEffect(() => {
  const handleClick = (e: MouseEvent) => {
   if (
    suggestRef.current && !suggestRef.current.contains(e.target as Node) &&
    inputRef.current && !inputRef.current.contains(e.target as Node)
   ) {
    setShowSuggestions(false);
   }
  };
  document.addEventListener("mousedown", handleClick);
  return () => document.removeEventListener("mousedown", handleClick);
 }, []);

 // 1. Try to load Yandex Maps Script
 useEffect(() => {
  if (!API_KEY) {
   setError(null); // No error shown – we'll use Nominatim
   setIsLoaded(true);
   setUseYandex(false);
   return;
  }

  const scriptId = "yandex-maps-script";

  if (document.getElementById(scriptId)) {
   if (window.ymaps) {
    window.ymaps.ready(() => {
     setIsLoaded(true);
     setUseYandex(true);
    });
   }
   return;
  }

  const script = document.createElement("script");
  script.id = scriptId;
  script.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=${API_KEY}&load=package.full`;
  script.async = true;
  const timeout = setTimeout(() => {
   // If Yandex didn't load in 5s – fallback to Nominatim only
   if (!window.ymaps) {
    setIsLoaded(true);
    setUseYandex(false);
   }
  }, 5000);
  script.onload = () => {
   clearTimeout(timeout);
   if (window.ymaps) {
    window.ymaps.ready(() => {
     setIsLoaded(true);
     setUseYandex(true);
    });
   }
  };
  script.onerror = () => {
   clearTimeout(timeout);
   setIsLoaded(true);
   setUseYandex(false);
  };
  document.head.appendChild(script);
  return () => clearTimeout(timeout);
 }, [API_KEY]);

 // 2. Initialize Yandex Map (only if useYandex)
 useEffect(() => {
  if (!useYandex || !isLoaded || !mapRef.current || mapInstance.current || !window.ymaps) return;

  try {
   window.ymaps.ready(() => {
    const defaultCenter = [55.7558, 37.6173];

    const map = new window.ymaps.Map(mapRef.current, {
     center: defaultCenter,
     zoom: 13,
     controls: [],
    }, {
     suppressMapOpenBlock: true,
     yandexMapDisablePoiInteractivity: true // Disable POI to keep users in-app
    });

    const marker = new window.ymaps.Placemark(defaultCenter, {}, {
     preset: "islands#redDotIconWithCaption",
     draggable: true,
    });

    map.geoObjects.add(marker);

    marker.events.add("dragend", () => {
     const coords = marker.geometry.getCoordinates();
     reverseGeocodeYandex(coords);
    });

    map.events.add("click", (e: any) => {
     const coords = e.get("coords");
     marker.geometry.setCoordinates(coords);
     reverseGeocodeYandex(coords);
    });

    mapInstance.current = map;
    markerInstance.current = marker;

    if (!initialAddress) {
     autoLocate();
    } else {
     geocodeYandex(initialAddress);
    }
   });
  } catch (err) {
   console.error("Yandex Map init failed", err);
  }

  return () => {
   if (mapInstance.current) {
    mapInstance.current.destroy();
    mapInstance.current = null;
   }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [useYandex, isLoaded]);

 // Sync map when external coordinates change (e.g. address selected from suggestions)
 useEffect(() => {
  if (externalCoords && mapInstance.current && markerInstance.current) {
   updateMapLocation(externalCoords as unknown as number[], false);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [externalCoords]);

 const autoLocate = () => {
  setIsLocating(true);
  if (useYandex && window.ymaps) {
   window.ymaps.geolocation.get({ provider: "browser", mapStateAutoApply: true })
    .then((result: any) => {
     const coords = result.geoObjects.get(0).geometry.getCoordinates();
     updateMapLocation(coords);
     setIsLocating(false);
    })
    .catch(() => {
     setIsLocating(false);
     locateByBrowser();
    });
  } else {
   locateByBrowser();
  }
 };

 const locateByBrowser = () => {
  if (!navigator.geolocation) { setIsLocating(false); return; }
  navigator.geolocation.getCurrentPosition(
   async (pos) => {
    const coords = [pos.coords.latitude, pos.coords.longitude];
    if (useYandex) {
     updateMapLocation(coords);
    } else {
     // Reverse geocode via Nominatim
     try {
      const res = await fetch(
       `https://nominatim.openstreetmap.org/reverse?lat=${coords[0]}&lon=${coords[1]}&format=json&accept-language=ru`,
       { headers: { "Accept-Language": "ru" } }
      );
      const data = await res.json();
      if (data.display_name) {
       const addr = formatNominatimAddress(data);
       setSearchQuery(addr);
       onAddressSelect(addr);
       if (onAddressDetailsSelect) {
        onAddressDetailsSelect({
         full: addr,
         road: data.address?.road || data.address?.pedestrian || data.address?.suburb,
         house: data.address?.house_number,
         city: data.address?.city || data.address?.town || data.address?.village
        });
       }
      }
     } catch { /* ignore */ }
    }
    setIsLocating(false);
   },
   () => setIsLocating(false),
   { timeout: 8000 }
  );
 };

 const updateMapLocation = (coords: number[], doReverseGeocode = true) => {
  if (!mapInstance.current || !markerInstance.current) return;
  mapInstance.current.setCenter(coords, 16, { duration: 300 });
  markerInstance.current.geometry.setCoordinates(coords);
  if (doReverseGeocode) reverseGeocodeYandex(coords);
 };

 const geocodeYandex = async (addr: string) => {
  if (!window.ymaps?.geocode || !addr || !addr.trim()) return;
  try {
   const res = await window.ymaps.geocode(addr);
   const obj = res.geoObjects.get(0);
   if (obj) {
    const coords = obj.geometry.getCoordinates();
    if (mapInstance.current && markerInstance.current) {
     mapInstance.current.setCenter(coords, 16);
     markerInstance.current.geometry.setCoordinates(coords);
    }
   }
  } catch (e) {
   console.error("Geocode error", e);
  }
 };

 const reverseGeocodeYandex = async (coords: number[]) => {
  if (!window.ymaps?.geocode) return;
  try {
   const res = await window.ymaps.geocode(coords);
   const obj = res.geoObjects.get(0);
   if (obj) {
    const address = obj.getAddressLine();
    let road = obj.getThoroughfare();
    if (!road && obj.getPremise) road = obj.getPremise();
    const house = obj.getPremiseNumber();
    const cityList = obj.getLocalities ? obj.getLocalities() : [];
    const city = cityList && cityList.length > 0 ? cityList[0] : (obj.getAdministrativeAreas ? obj.getAdministrativeAreas()[0] : undefined);

    setSearchQuery(address);
    onAddressSelect(address);
    if (onAddressDetailsSelect) {
     onAddressDetailsSelect({ full: address, road, house, city });
    }
   }
  } catch (e) {
   console.error("Reverse geocode error", e);
  }
 };

 const formatNominatimAddress = (data: any): string => {
  const a = data.address || {};
  const parts: string[] = [];
  if (a.road) parts.push(a.road);
  if (a.house_number) parts.push(a.house_number);
  const city = a.city || a.town || a.village || a.suburb || "";
  if (city && city !== a.road) parts.push(city);
  return parts.length > 0 ? parts.join(", ") : data.display_name;
 };

 // 3. Nominatim fetch — Moscow only (bounded viewbox)
 const fetchNominatim = useCallback(async (query: string) => {
  try {
   // Moscow bounding box: lon 36.8–38.0, lat 55.4–56.0
   const params = new URLSearchParams({
    q: `${query}, Москва`,
    format: "json",
    addressdetails: "1",
    limit: "10",
    "accept-language": "ru",
    countrycodes: "ru",
    viewbox: "36.8,56.0,38.0,55.4",
    bounded: "1",
   });
   const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { headers: { "Accept-Language": "ru", "User-Agent": "smuslest-app/1.0" } }
   );
   const data: Suggestion[] = await res.json();

   const uniqueSuggestions: Suggestion[] = [];
   const seen = new Set<string>();

   for (const item of data) {
    const a = item.address || {};
    const road = (a.road || a.pedestrian || "").trim();
    const num = a.house_number ? `, д. ${a.house_number.trim()}` : "";
    const main = (road + num) || item.display_name.split(',')[0].trim();
    const sub = (a.suburb || a.city || "Москва").trim();

    // Normalize string for checking identical values
    const key = `${main}|${sub}`.toLowerCase().replace(/\s+/g, ' ').replace(/ё/g, 'е');

    if (!seen.has(key) && main) {
     seen.add(key);
     uniqueSuggestions.push(item);
    }
   }

   const finalSuggestions = uniqueSuggestions.slice(0, 6);
   setSuggestions(finalSuggestions);
   setShowSuggestions(finalSuggestions.length > 0);
  } catch (e) {
   console.error("Nominatim error", e);
   setSuggestions([]);
  }
 }, []);

 // 4. Suggestions always via Nominatim (ymaps.suggest needs paid API key)
 const fetchSuggestions = useCallback(async (query: string) => {
  if (query.length < 2) {
   setSuggestions([]);
   setShowSuggestions(false);
   return;
  }
  setIsLoadingSuggestions(true);
  await fetchNominatim(query);
  setIsLoadingSuggestions(false);
 }, [fetchNominatim]);

 // Debounce input
 const handleInputChange = (val: string) => {
  setSearchQuery(val);
  onAddressSelect(val);

  if (debounceRef.current) clearTimeout(debounceRef.current);
  if (val.length < 2) {
   setSuggestions([]);
   setShowSuggestions(false);
   return;
  }
  debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
 };

 const selectSuggestion = (item: Suggestion & { _ymapsItem?: any }) => {
  const address = formatNominatimAddress(item as any) || item.display_name;
  setSearchQuery(address);
  onAddressSelect(address);
  setSuggestions([]);
  setShowSuggestions(false);

  // Move map marker to selected address
  if (useYandex && window.ymaps) {
   geocodeYandex(address);
  } else if (item.lat && item.lon && mapInstance.current && markerInstance.current) {
   const coords = [parseFloat(item.lat), parseFloat(item.lon)];
   updateMapLocation(coords, false);
  }
 };

 const clearSearch = () => {
  setSearchQuery("");
  setSuggestions([]);
  setShowSuggestions(false);
  onAddressSelect("");
  inputRef.current?.focus();
 };

 const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {
   if (suggestions.length > 0) {
    selectSuggestion(suggestions[0] as any);
   } else if (useYandex) {
    geocodeYandex(searchQuery);
   }
   setSuggestions([]);
   setShowSuggestions(false);
  }
  if (e.key === "Escape") {
   setSuggestions([]);
   setShowSuggestions(false);
  }
 };

 const getDisplayName = (item: Suggestion): string => {
  const a = item.address || {};
  const road = (a.road || a.pedestrian || "").trim();
  const num = a.house_number ? `, д. ${a.house_number.trim()}` : "";
  return (road + num) || item.display_name.split(',')[0].trim();
 };

 const getSubtitle = (item: Suggestion): string => {
  const a = item.address || {};
  // Show district (suburb) as subtitle context
  return (a.suburb || a.city || "Москва").trim();
 };

 return (
  <div className={cn("flex flex-col gap-4 w-full h-full min-h-[400px] relative font-montserrat", className)}>
   {/* Search Bar */}
   {!hideSearch && (
    <div className="relative z-[1001]">
     <div className="relative flex items-center">
      <Search className="absolute left-4 w-5 h-5 text-smusl-gray/40 pointer-events-none" />
      <input
       ref={inputRef}
       type="text"
       value={searchQuery}
       onChange={(e) => handleInputChange(e.target.value)}
       onKeyDown={handleKeyDown}
       onFocus={() => {
        if (suggestions.length > 0) setShowSuggestions(true);
       }}
       placeholder="Введите адрес доставки..."
       autoComplete="off"
       className="w-full h-14 pl-12 pr-28 bg-smusl-beige rounded-2xl border-2 border-transparent focus:border-smusl-terracotta focus:bg-white transition-all text-sm font-bold outline-none placeholder:font-normal placeholder:text-smusl-gray/50"
      />
      <div className="absolute right-3 flex items-center gap-1">
       {isLoadingSuggestions && (
        <Loader2 className="w-4 h-4 animate-spin text-smusl-terracotta/50" />
       )}
       {searchQuery && (
        <button
         type="button"
         onClick={clearSearch}
         className="p-2 hover:bg-smusl-clay rounded-xl transition-colors"
        >
         <X className="w-4 h-4 text-smusl-gray/50" />
        </button>
       )}
       <button
        type="button"
        onClick={() => {
         if (useYandex) geocodeYandex(searchQuery);
         setSuggestions([]);
         setShowSuggestions(false);
        }}
        className="p-2 hover:bg-smusl-clay rounded-xl text-smusl-terracotta transition-colors"
        title="Найти"
       >
        <Search className="w-4 h-4" />
       </button>
       <button
        type="button"
        onClick={autoLocate}
        className="p-2 hover:bg-smusl-clay rounded-xl text-smusl-terracotta transition-colors"
        title="Моё местоположение"
       >
        {isLocating ? (
         <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
         <Navigation className="w-4 h-4" />
        )}
       </button>
      </div>
     </div>

     {/* Suggestions Dropdown */}
     {showSuggestions && suggestions.length > 0 && (
      <div
       ref={suggestRef}
       className="absolute top-full left-0 right-0 mt-2 z-[1002] overflow-hidden"
      >
       <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.13)] border border-smusl-light-gray/20 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2.5 bg-smusl-beige/60 border-b border-smusl-light-gray/20 flex items-center gap-2">
         <MapPin className="w-3.5 h-3.5 text-smusl-terracotta/70" />
         <span className="text-[11px] font-bold text-smusl-brown/50 uppercase tracking-widest">Москва</span>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 260 }}>
         {suggestions.map((item, i) => {
          const main = getDisplayName(item);
          const sub = getSubtitle(item);
          return (
           <button
            key={i}
            type="button"
            onMouseDown={(e) => {
             e.preventDefault();
             selectSuggestion(item as any);
            }}
            className="w-full px-4 py-3 text-left flex items-center gap-3 border-b border-smusl-light-gray/15 last:border-0 transition-all group hover:bg-gradient-to-r hover:from-smusl-beige hover:to-transparent"
           >
            <div className="w-9 h-9 rounded-[10px] bg-smusl-terracotta/8 flex items-center justify-center shrink-0 group-hover:bg-smusl-terracotta/15 transition-colors border border-smusl-terracotta/10">
             <MapPin className="w-4 h-4 text-smusl-terracotta" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
             <span className="text-[13px] font-[700] text-smusl-brown leading-tight truncate group-hover:text-smusl-terracotta transition-colors">
              {main}
             </span>
             {sub && (
              <span className="text-[11px] text-smusl-gray/60 leading-tight truncate mt-0.5 font-medium">
               {sub}
              </span>
             )}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
             <div className="w-6 h-6 rounded-lg bg-smusl-terracotta/10 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
               <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="#C17B5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
             </div>
            </div>
           </button>
          );
         })}
        </div>
       </div>
      </div>
     )}
    </div>
   )}

   {/* Map Canvas (only when Yandex available) */}
   {useYandex ? (
    <div className="relative flex-1 rounded-[2.5rem] overflow-hidden border-2 border-smusl-light-gray/30 bg-[#f8f6f2] z-0">
     {!isLoaded && (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-smusl-beige/80">
       <Loader2 className="w-10 h-10 text-smusl-terracotta animate-spin" />
       <span className="text-sm font-bold text-smusl-terracotta">Загрузка карты...</span>
      </div>
     )}
     <div ref={mapRef} className="w-full h-full" />
     {isLoaded && mapInstance.current && (
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
       <button
        onClick={() => mapInstance.current.setZoom(mapInstance.current.getZoom() + 1, { duration: 200 })}
        className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-lg font-black text-smusl-brown hover:bg-smusl-beige transition-all active:scale-90"
       >+</button>
       <button
        onClick={() => mapInstance.current.setZoom(mapInstance.current.getZoom() - 1, { duration: 200 })}
        className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-lg font-black text-smusl-brown hover:bg-smusl-beige transition-all active:scale-90"
       >-</button>
      </div>
     )}
    </div>
   ) : (
    /* No-map fallback: just a styled illustration */
    <div className="relative flex-1 rounded-[2.5rem] overflow-hidden border-2 border-smusl-light-gray/30 bg-smusl-beige/40 z-0 flex flex-col items-center justify-center gap-4 min-h-[200px]">
     <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
      <MapPin className="w-10 h-10 text-smusl-terracotta" strokeWidth={1.5} />
     </div>
     <p className="text-[14px] font-bold text-smusl-brown/70 text-center px-8 leading-relaxed">
      Введите адрес выше — мы предложим варианты
     </p>
     {searchQuery && (
      <div className="mt-2 px-6 py-3 bg-white rounded-2xl shadow border border-smusl-light-gray/30 max-w-[300px] text-center">
       <span className="text-[13px] font-bold text-smusl-brown">{searchQuery}</span>
      </div>
     )}
    </div>
   )}

   <p className="text-[11px] text-smusl-gray/50 italic px-2 text-center">
    {useYandex
     ? "* Кликните на карту или передвиньте метку для выбора адреса"
     : "* Начните вводить адрес и выберите вариант из списка"}
   </p>

   {/* CSS to hide Yandex branding/copyrights for a cleaner 2026-style UI */}
   <style jsx global>{`
    [class*="ymaps-2-1"][class*="-map-copyrights-promo"],
    [class*="ymaps-2-1"][class*="-copyright-promo-container"],
    [class*="ymaps-2-1"][class*="-copyright__wrap"],
    [class*="ymaps-2-1"][class*="-any-links-container"],
    [class*="ymaps-2-1"][class*="-zoom"],
    [class*="ymaps-2-1"][class*="-float-button"],
    [class*="ymaps-2-1"][class*="-gotomaps"],
    [class*="ymaps-2-1"][class*="-gototaxi"],
    [class*="ymaps-2-1"][class*="-gotoyandex"],
    [class*="ymaps-2-1"][class*="-balloon__close-button"],
    [class*="ymaps-2-1"][class*="-route-panel"] {
     display: none !important;
     visibility: hidden !important;
     pointer-events: none !important;
    }
   `}</style>
  </div>
 );
}
