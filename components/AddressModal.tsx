"use client"

import React, { useState, useEffect, useRef } from "react"
import { useApp } from "@/store/AppContext"
import { X, ChevronDown, MapPin, ArrowLeft, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import MapPicker from "./MapPicker"
import { cn } from "@/lib/utils"

type DeliveryType = "delivery" | "pickup" | null

const PICKUP_POINTS = [
 { city: "Москва", address: "Ижорская 3", coords: [55.882, 37.514] },
 { city: "Москва", address: "Арбат 5", coords: [55.752, 37.598] },
 { city: "Москва", address: "Ленинская 2", coords: [55.748, 37.618] },
 { city: "Москва", address: "Пушкина 12", coords: [55.755, 37.617] },
 { city: "Москва", address: "Садовая 8", coords: [55.759, 37.60] },
 { city: "Санкт-Петербург", address: "Невский проспект, 28", coords: [59.935, 30.325] },
 { city: "Санкт-Петербург", address: "Лиговский пр., 10", coords: [59.930, 30.362] },
 { city: "Санкт-Петербург", address: "Садовая ул., 10", coords: [59.932, 30.339] },
] as const;

type PickupPoint = typeof PICKUP_POINTS[number];

export default function AddressModal() {
 const {
  isAddressModalOpen,
  setAddressModalOpen,
  updateAddress,
  address,
 } = useApp()

 const [step, setStep] = useState<1 | 2>(1)
 const [deliveryType, setDeliveryType] = useState<DeliveryType>(null)
 const [tempAddress, setTempAddress] = useState(address)
 const [selectedPickup, setSelectedPickup] = useState<PickupPoint | null>(null)
 const [mapError, setMapError] = useState<string | null>(null)
 const [isLocating, setIsLocating] = useState(false)
 const [selectedCity, setSelectedCity] = useState<'Москва' | 'Санкт-Петербург'>('Москва')
 const [showCityDropdown, setShowCityDropdown] = useState(false)
 const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null)

 // Expanded address fields
 const [house, setHouse] = useState('')
 const [entrance, setEntrance] = useState('')
 const [floor, setFloor] = useState('')
 const [apartment, setApartment] = useState('')

 // Address search states
 const [suggestions, setSuggestions] = useState<any[]>([])
 const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
 const searchTimeout = useRef<NodeJS.Timeout | null>(null)
 const skipNextFetch = useRef<boolean>(false)

 const CITY_CONFIG = {
  'Москва': { viewbox: '36.8,56.0,38.0,55.4', short: 'мск' },
  'Санкт-Петербург': { viewbox: '29.5,60.2,30.8,59.7', short: 'спб' },
 } as const

 const fetchAddressSuggestions = async (query: string) => {
  if (query.length < 3) { setSuggestions([]); return }
  setIsLoadingSuggestions(true)
  try {
   const cfg = CITY_CONFIG[selectedCity]
   const params = new URLSearchParams({
    q: `${query}, ${selectedCity}`,
    format: 'json',
    addressdetails: '1',
    limit: '15',
    'accept-language': 'ru',
    countrycodes: 'ru',
    viewbox: cfg.viewbox,
    bounded: '1',
   })
   const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'Accept-Language': 'ru', 'User-Agent': 'smuslest-app/1.0' }
   })
   const data = await res.json()

   // Strict client-side filtering by city
   const filtered = data.filter((item: any) => {
    const addr = item.address || {}
    const city = addr.city || addr.town || addr.village || ""
    const displayName = item.display_name || ""

    if (selectedCity === "Москва") {
     return city.includes("Москва") || displayName.includes("Москва")
    } else if (selectedCity === "Санкт-Петербург") {
     return (
      city.includes("Санкт-Петербург") ||
      city.includes("Петербург") ||
      displayName.includes("Санкт-Петербург") ||
      displayName.includes("Петербург")
     )
    }
    return true
   })

   const uniqueSuggestions = []
   const seen = new Set<string>()

   for (const s of filtered) {
    const road = (s.address?.road || s.address?.pedestrian || s.address?.suburb || s.display_name.split(',')[0] || "").trim()
    const houseNum = (s.address?.house_number || "").trim()
    const title = houseNum ? `${road}, ${houseNum}` : road
    const city = (s.address?.city || s.address?.town || s.address?.village || selectedCity || "").trim()

    // Normalize key to effectively catch duplicates (e.g. Усачёва vs Усачева, whitespace diffs)
    const key = `${title}|${city}`.toLowerCase().replace(/\s+/g, ' ').replace(/ё/g, 'е')

    if (!seen.has(key) && road) {
     seen.add(key)
     uniqueSuggestions.push(s)
    }
   }

   setSuggestions(uniqueSuggestions.slice(0, 6))
  } catch (err) {
   console.error('Search error:', err)
  } finally {
   setIsLoadingSuggestions(false)
  }
 }

 useEffect(() => {
  if (skipNextFetch.current) {
   skipNextFetch.current = false
   return
  }

  if (step === 2 && deliveryType === "delivery" && tempAddress.length >= 3) {
   if (searchTimeout.current) clearTimeout(searchTimeout.current)
   searchTimeout.current = setTimeout(() => {
    fetchAddressSuggestions(tempAddress)
   }, 400)
  } else {
   setSuggestions([])
  }
  return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [tempAddress, step, deliveryType, selectedCity])

 const reset = () => {
  setStep(1)
  setDeliveryType(null)
  setTempAddress(address)
  setSelectedPickup(null)
  setMapError(null)
  setSelectedCity('Москва')
  setShowCityDropdown(false)
  setSelectedCoords(null)
  setHouse('')
  setEntrance('')
  setFloor('')
  setApartment('')
 }

 // Reset modal to Step 1 when it opens
 useEffect(() => {
  if (isAddressModalOpen) {
   reset() // Start at Step 1 (Способ получения)
  }
 }, [isAddressModalOpen])

 const handleGeolocate = () => {
  if (!navigator.geolocation) return
  setIsLocating(true)
  navigator.geolocation.getCurrentPosition(
   async (pos) => {
    try {
     const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&accept-language=ru`,
      { headers: { 'Accept-Language': 'ru' } }
     )
     const data = await res.json()
     const a = data.address || {}
     // Only accept if city matches selected
     const geoCity = a.city || a.town || a.village || ''
     const cityMatch = selectedCity === 'Москва'
      ? geoCity.includes('Москва')
      : geoCity.includes('Санкт') || geoCity.includes('Петербург') || geoCity.includes('Ленинград')
     if (!cityMatch) {
      // Auto-switch city or ignore
      if (geoCity.includes('Санкт') || geoCity.includes('Петербург')) setSelectedCity('Санкт-Петербург')
      else if (geoCity.includes('Москва')) setSelectedCity('Москва')
     }
     const parts: string[] = []
     if (a.road) parts.push(a.road)
     if (a.house_number) parts.push(a.house_number)
     const addr = parts.length > 0 ? parts.join(', ') : data.display_name.split(',')[0]
     setTempAddress(addr)
    } catch { /* ignore */ }
    setIsLocating(false)
   },
   () => setIsLocating(false),
   { timeout: 8000 }
  )
 }

 const handleClose = () => {
  setAddressModalOpen(false)
  setTimeout(reset, 400)
 }

 const handleSaveDelivery = () => {
  if (tempAddress) {
   const fullAddress = [
    tempAddress,
    house && `д. ${house}`,
    entrance && `под. ${entrance}`,
    floor && `эт. ${floor}`,
    apartment && `кв. ${apartment}`
   ].filter(Boolean).join(', ')

   updateAddress(fullAddress)
   handleClose()
  }
 }

 const handleSavePickup = () => {
  if (selectedPickup) {
   updateAddress(`${selectedPickup.city}, ${selectedPickup.address}`)
   handleClose()
  }
 }

 if (!isAddressModalOpen) return null

 return (
  <AnimatePresence>
   <div className="fixed inset-0 z-[100] flex items-stretch justify-end p-4 sm:p-6 overflow-hidden">
    <motion.div
     key="backdrop"
     initial={{ opacity: 0 }}
     animate={{ opacity: 1 }}
     exit={{ opacity: 0 }}
     className="absolute inset-0 bg-[#3A332E]/35 backdrop-blur-[5px]"
     onClick={handleClose}
    />

    <motion.div
     key="modal"
     initial={{ opacity: 0, x: "100%" }}
     animate={{ opacity: 1, x: 0 }}
     exit={{ opacity: 0, x: "100%" }}
     transition={{ type: "spring", damping: 32, stiffness: 280 }}
     className="relative z-10 bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex
            w-full max-w-[900px] h-full font-manrope"
    >
     <AnimatePresence mode="wait">

      {/* ───── STEP 1: Способ получения ───── */}
      {step === 1 && (
       <motion.div
        key="step1"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="flex flex-col sm:flex-row h-full w-full"
       >
        {/* Left Panel - Visual Placeholder */}
        <div className="w-full h-[220px] shrink-0 sm:h-full sm:w-[45%] p-4 pb-0 sm:p-6 sm:pb-6">
         <div className="w-full h-full bg-[#D9D9D9] rounded-[1.5rem] flex items-center justify-center overflow-hidden relative">
          {/* Visual Map Background for Step 1 */}
          <div className="absolute inset-0 opacity-40 mix-blend-multiply bg-[url('/photo/map-bg.png')] bg-cover bg-center grayscale" />
          <div className="relative z-10 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
           <MapPin className="w-8 h-8 text-smusl-terracotta" />
          </div>
         </div>
        </div>

        <div className="flex-1 p-5 sm:p-10 flex flex-col justify-center overflow-y-auto">
         <div className="flex items-center justify-between mb-8">
          <h2 className="text-[26px] font-extrabold text-smusl-brown tracking-tight">
           Способ получения
          </h2>
          <button
           onClick={handleClose}
           className="p-2 text-smusl-gray hover:text-smusl-brown transition-colors"
          >
           <X className="w-6 h-6" />
          </button>
         </div>

         <div className="space-y-4">
          {/* Delivery Option */}
          <button
           onClick={() => { setDeliveryType("delivery"); setStep(2) }}
           className="w-full h-[72px] px-6 rounded-[1.2rem] border border-gray-200 hover:border-smusl-terracotta bg-white transition-all flex items-center justify-between group"
          >
           <span className="text-[17px] font-extrabold text-smusl-brown">Доставка на дом</span>
           <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center group-hover:border-smusl-terracotta transition-colors">
            <div className="w-3 h-3 rounded-full bg-smusl-terracotta/0 group-hover:bg-smusl-terracotta scale-0 group-hover:scale-100 transition-all duration-300" />
           </div>
          </button>

          {/* Pickup Option */}
          <button
           onClick={() => { setDeliveryType("pickup"); setStep(2) }}
           className="w-full h-[72px] px-6 rounded-[1.2rem] border border-gray-200 hover:border-smusl-terracotta bg-white transition-all flex items-center justify-between group"
          >
           <span className="text-[17px] font-extrabold text-smusl-brown">Самовывоз</span>
           <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center group-hover:border-smusl-terracotta transition-colors">
            <div className="w-3 h-3 rounded-full bg-smusl-terracotta/0 group-hover:bg-smusl-terracotta scale-0 group-hover:scale-100 transition-all duration-300" />
           </div>
          </button>
         </div>
        </div>
       </motion.div>
      )}

      {/* ───── STEP 2: Delivery ───── */}
      {step === 2 && deliveryType === "delivery" && (
       <motion.div
        key="step2-delivery"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex flex-col sm:flex-row h-full w-full"
       >
        {/* Left Panel - MAP */}
        <div className="w-full h-[260px] shrink-0 sm:h-full sm:w-[55%] p-4 pb-0 sm:p-6 sm:pb-6">
         <div className="w-full h-full rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-inner">
          <MapPicker
           hideSearch={true}
           initialAddress={tempAddress}
           onAddressSelect={setTempAddress}
           onAddressDetailsSelect={(details) => {
            const road = details.road || details.full.split(',')[0];
            setTempAddress(road.replace(`${selectedCity}, `, '').replace('Москва, ', '').replace('Санкт-Петербург, ', ''));
            if (details.house) {
             setHouse(details.house.replace(/\D/g, ''));
            } else {
             setHouse('');
            }
           }}
           onError={setMapError}
           externalCoords={selectedCoords}
          />
         </div>
        </div>

        {/* Right Panel - Inputs */}
        <div className="flex-1 p-5 sm:p-10 flex flex-col overflow-y-auto no-scrollbar min-h-0">
         <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
           <button
            onClick={() => setStep(1)}
            className="p-1 text-[#3A332E] hover:text-smusl-terracotta transition-colors"
           >
            <ArrowLeft className="w-6 h-6" />
           </button>
           <h2 className="text-[20px] sm:text-[24px] font-[800] text-[#3A332E] tracking-tight">
            Введите адрес
           </h2>
          </div>
          <button onClick={handleClose} className="p-1 text-gray-300 hover:text-[#3A332E] transition-colors">
           <X className="w-6 h-6" />
          </button>
         </div>

         <div className="space-y-3 flex-1">

          {/* City field */}
          <div className="relative z-50">
           <div
            className="bg-[#F8F8F8] rounded-[1.2rem] px-5 py-3.5 sm:py-4 cursor-pointer select-none"
            onClick={() => setShowCityDropdown(v => !v)}
           >
            <span className="block text-[9px] font-[700] text-[#B5B5B5] uppercase tracking-[0.1em] mb-0.5">ГОРОД</span>
            <div className="flex items-center justify-between">
             <span className="text-[15px] sm:text-[16px] font-[800] text-[#3A332E]">{selectedCity}</span>
             <ChevronDown className={cn('w-4 h-4 text-gray-300 transition-transform duration-200', showCityDropdown && 'rotate-180')} />
            </div>
           </div>
           {showCityDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-[1.2rem] shadow-[0_12px_30px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
             {(['Москва', 'Санкт-Петербург'] as const).map(c => (
              <button
               key={c}
               onClick={() => { setSelectedCity(c); setTempAddress(''); setSuggestions([]); setSelectedCoords(null); setShowCityDropdown(false) }}
               className={cn(
                'w-full text-left px-5 py-3.5 text-[15px] font-bold transition-colors border-b last:border-0 border-gray-50',
                selectedCity === c ? 'text-smusl-terracotta bg-smusl-terracotta/5' : 'text-[#3A332E] hover:bg-gray-50'
               )}
              >
               {c}
              </button>
             ))}
            </div>
           )}
          </div>

          {/* Address input */}
          <div className="relative z-40">
           <div className="bg-[#F8F8F8] rounded-[1.2rem] px-5 py-3.5">
            <div className="flex justify-between items-center mb-0.5">
             <span className="block text-[9px] font-[700] text-[#B5B5B5] tracking-wide uppercase">
              Улица и дом
             </span>
            </div>
            <div className="flex items-center gap-2">
             <input
              type="text"
              value={tempAddress}
              onChange={(e) => setTempAddress(e.target.value)}
              placeholder="Введите адрес"
              className="bg-transparent border-none outline-none text-[15px] font-[800] text-[#3A332E] placeholder:text-[#BDBDBD] placeholder:font-normal w-full"
             />
             {isLoadingSuggestions && <Loader2 className="w-4 h-4 animate-spin text-smusl-terracotta flex-shrink-0" />}
             {tempAddress && !isLoadingSuggestions && (
              <button
               onClick={() => { setTempAddress(''); setSuggestions([]); setHouse(''); }}
               className="p-1 hover:bg-black/5 rounded-full transition-colors flex-shrink-0 -mr-1"
              >
               <X className="w-4 h-4 text-[#4A3F39]" />
              </button>
             )}
            </div>
           </div>
           {suggestions.length > 0 && (
            <motion.div
             initial={{ opacity: 0, y: 4 }}
             animate={{ opacity: 1, y: 0 }}
             className="mt-2 bg-white rounded-[1.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden max-h-[300px] overflow-y-auto no-scrollbar absolute w-full left-0 py-1 z-50"
            >
             {suggestions.map((s, idx) => {
              const road = (s.address?.road || s.address?.pedestrian || s.address?.suburb || s.display_name.split(',')[0] || "").trim();
              const houseNum = (s.address?.house_number || "").trim();
              const title = houseNum ? `${road}, ${houseNum}` : road;
              const city = (s.address?.city || s.address?.town || s.address?.village || s.address?.state || selectedCity || "").trim();

              return (
               <button
                key={idx}
                onClick={() => {
                 skipNextFetch.current = true;
                 setTempAddress(title);
                 setHouse('');

                 // Store coords to sync map
                 if (s.lat && s.lon) {
                  setSelectedCoords([parseFloat(s.lat), parseFloat(s.lon)]);
                 }
                 setSuggestions([]);
                }}
                className="w-full text-left px-5 py-3.5 flex flex-col group hover:bg-[#F9F9F9] transition-colors border-b last:border-0 border-gray-50"
               >
                <span className="text-[15px] font-[700] text-[#333333] leading-snug">{title}</span>
                <span className="text-[13px] font-[500] text-[#999999] mt-0.5">{city}</span>
               </button>
              );
             })}
            </motion.div>
           )}
          </div>

          {/* Additional details: House, Entrance, Floor, Apt */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
           <div className="bg-[#F2F2F2] rounded-[1rem] px-2 sm:px-5 py-2.5 sm:py-3 flex flex-col justify-center overflow-hidden">
            <span className="block text-[7px] min-[375px]:text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-normal sm:tracking-[0.1em] mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Дом</span>
            <input
             type="text"
             inputMode="numeric"
             pattern="[0-9]*"
             value={house}
             onChange={(e) => setHouse(e.target.value.replace(/\D/g, ''))}
             placeholder="1"
             className="bg-transparent border-none outline-none text-[13px] sm:text-[15px] font-extrabold text-smusl-brown placeholder:text-[#BDBDBD] placeholder:font-normal w-full min-w-0"
            />
           </div>
           <div className="bg-[#F2F2F2] rounded-[1rem] px-2 sm:px-5 py-2.5 sm:py-3 flex flex-col justify-center overflow-hidden">
            <span className="block text-[7px] min-[375px]:text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-normal sm:tracking-[0.1em] mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Подъезд</span>
            <input
             type="text"
             inputMode="numeric"
             pattern="[0-9]*"
             value={entrance}
             onChange={(e) => setEntrance(e.target.value.replace(/\D/g, ''))}
             placeholder="1"
             className="bg-transparent border-none outline-none text-[13px] sm:text-[15px] font-extrabold text-smusl-brown placeholder:text-[#BDBDBD] placeholder:font-normal w-full min-w-0"
            />
           </div>
           <div className="bg-[#F2F2F2] rounded-[1rem] px-2 sm:px-5 py-2.5 sm:py-3 flex flex-col justify-center overflow-hidden">
            <span className="block text-[7px] min-[375px]:text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-normal sm:tracking-[0.1em] mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Этаж</span>
            <input
             type="text"
             inputMode="numeric"
             pattern="[0-9]*"
             value={floor}
             onChange={(e) => setFloor(e.target.value.replace(/\D/g, ''))}
             placeholder="1"
             className="bg-transparent border-none outline-none text-[13px] sm:text-[15px] font-extrabold text-smusl-brown placeholder:text-[#BDBDBD] placeholder:font-normal w-full min-w-0"
            />
           </div>
           <div className="bg-[#F2F2F2] rounded-[1rem] px-2 sm:px-5 py-2.5 sm:py-3 flex flex-col justify-center overflow-hidden">
            <span className="block text-[7px] min-[375px]:text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-normal sm:tracking-[0.1em] mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis" title="Кв. / Офис">Кв. / Офис</span>
            <input
             type="text"
             inputMode="numeric"
             pattern="[0-9]*"
             value={apartment}
             onChange={(e) => setApartment(e.target.value.replace(/\D/g, ''))}
             placeholder="1"
             className="bg-transparent border-none outline-none text-[13px] sm:text-[15px] font-extrabold text-smusl-brown placeholder:text-[#BDBDBD] placeholder:font-normal w-full min-w-0"
            />
           </div>
          </div>

          {/* Где я — geolocation button */}
          <button
           onClick={handleGeolocate}
           disabled={isLocating}
           className="flex items-center gap-2.5 w-full px-5 py-3.5 rounded-[1.2rem] bg-[#F8F8F8] text-[#3A332E] text-[14px] font-[700] hover:bg-gray-100 transition-all active:scale-[0.98] disabled:opacity-50"
          >
           {isLocating
            ? <Loader2 className="w-4 h-4 animate-spin text-smusl-terracotta flex-shrink-0" />
            : <MapPin className="w-4 h-4 text-smusl-terracotta flex-shrink-0" />
           }
           {isLocating ? 'Определяем...' : 'Где я'}
          </button>

         </div>

         <button
          onClick={handleSaveDelivery}
          disabled={!tempAddress}
          className="mt-4 sm:mt-auto w-full h-[64px] sm:h-[72px] bg-smusl-terracotta z-10 disabled:bg-smusl-terracotta/50 text-white rounded-full font-[800] text-[18px] sm:text-[20px] hover:bg-[#b87a60] transition-all shadow-lg shadow-smusl-terracotta/20 active:scale-95 mb-6 sm:mb-0 shrink-0"
         >
          Всё верно
         </button>
        </div>
       </motion.div>
      )}

      {/* ───── STEP 2: Pickup ───── */}
      {step === 2 && deliveryType === "pickup" && (
       <motion.div
        key="step2-pickup"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex flex-col sm:flex-row h-full w-full"
       >
        {/* Left Panel - Map (At top on mobile) */}
        <div className="w-full h-[240px] sm:h-full sm:w-[55%] p-0 sm:p-6 sm:pb-6 shrink-0 sm:shrink">
         <div className="w-full h-full rounded-b-[2.5rem] sm:rounded-[2rem] overflow-hidden border-b border-gray-100 shadow-sm relative">
          <MapPicker
           hideSearch={true}
           initialAddress={selectedPickup ? `${selectedPickup.city}, ${selectedPickup.address}` : ""}
           onAddressSelect={() => { }} // Read-only for pickup
           onError={setMapError}
           externalCoords={selectedPickup ? (selectedPickup.coords as [number, number]) : null}
          />
          {/* Center pin overlay for visual cue on mobile if needed */}
         </div>
        </div>

        <div className="flex-1 p-5 sm:p-10 flex flex-col min-h-0 bg-white sm:bg-transparent">
         {/* Header below map on mobile */}
         <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
           <button
            onClick={() => setStep(1)}
            className="p-1 text-[#3A332E] hover:text-smusl-terracotta transition-colors"
           >
            <ArrowLeft className="w-6 h-6" />
           </button>
           <h2 className="text-[20px] sm:text-[24px] font-[800] text-[#3A332E] leading-tight max-w-[200px] sm:max-w-none">
            Выберите адрес самовывоза
           </h2>
          </div>
          <button
           onClick={handleClose}
           className="p-1 text-gray-300 hover:text-[#3A332E] transition-colors"
          >
           <X className="w-6 h-6" />
          </button>
         </div>

         {/* City field - matching mockup styling */}
         <div className="relative mb-5 sm:mb-6 z-50">
          <div
           className="bg-[#F8F8F8] rounded-[1.2rem] px-5 py-3.5 sm:py-4 cursor-pointer select-none"
           onClick={() => setShowCityDropdown(v => !v)}
          >
           <span className="block text-[9px] font-[700] text-[#B5B5B5] uppercase tracking-[0.1em] mb-0.5">ГОРОД</span>
           <div className="flex items-center justify-between">
            <span className="text-[15px] sm:text-[16px] font-[800] text-[#3A332E]">{selectedCity}</span>
            <ChevronDown className={cn('w-4 h-4 text-gray-300 transition-transform duration-200', showCityDropdown && 'rotate-180')} />
           </div>
          </div>
          {showCityDropdown && (
           <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-[1.2rem] shadow-[0_12px_30px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
            {(['Москва', 'Санкт-Петербург'] as const).map(c => (
             <button
              key={c}
              onClick={() => { setSelectedCity(c); setSelectedPickup(null); setShowCityDropdown(false) }}
              className={cn(
               'w-full text-left px-5 py-3.5 text-[15px] font-bold transition-colors border-b last:border-0 border-gray-50',
               selectedCity === c ? 'text-smusl-terracotta bg-smusl-terracotta/5' : 'text-[#3A332E] hover:bg-gray-50'
              )}
             >
              {c}
             </button>
            ))}
           </div>
          )}
         </div>

         {/* Address selection list */}
         <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto pr-1 no-scrollbar z-40 pb-4">
          {PICKUP_POINTS.filter(p => p.city === selectedCity).map((p) => (
           <button
            key={p.address}
            onClick={() => setSelectedPickup(p)}
            className={cn(
             "w-full h-[64px] px-6 rounded-[1.2rem] border transition-all flex items-center justify-between group",
             selectedPickup?.address === p.address
              ? "border-smusl-terracotta bg-white shadow-sm"
              : "border-[#F0F0F0] bg-white hover:border-smusl-terracotta/30"
            )}
           >
            <span className={cn(
             "text-[15px] sm:text-[16px] font-[700] transition-colors",
             selectedPickup?.address === p.address ? "text-[#3A332E]" : "text-[#3A332E]/70"
            )}>
             {p.address}
            </span>
            <div className={cn(
             "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
             selectedPickup?.address === p.address ? "border-smusl-terracotta" : "border-[#E0E0E0] group-hover:border-smusl-terracotta/40"
            )}>
             <div className={cn(
              "w-2.5 h-2.5 rounded-full bg-smusl-terracotta transition-all duration-300",
              selectedPickup?.address === p.address ? "scale-100 opacity-100" : "scale-0 opacity-0"
             )} />
            </div>
           </button>
          ))}
         </div>

         {/* Wide "Всё верно" button */}
         <button
          onClick={handleSavePickup}
          disabled={!selectedPickup}
          className="mt-2 sm:mt-6 w-full h-[64px] sm:h-[72px] bg-smusl-terracotta disabled:bg-smusl-terracotta/50 text-white rounded-full font-[800] text-[18px] sm:text-[20px] hover:bg-[#b87a60] transition-all active:scale-95 shadow-lg shadow-smusl-terracotta/20 z-10 shrink-0 mb-6 sm:mb-0"
         >
          Всё верно
         </button>
        </div>
       </motion.div>
      )}

     </AnimatePresence>
    </motion.div>
   </div>
  </AnimatePresence>
 )
}
