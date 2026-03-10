"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useUIStore, useUserStore, useStoreData } from "@/store/hooks"
import { X, ChevronDown, MapPin, ArrowLeft, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import MapPicker from "./MapPicker"
import { cn } from "@/lib/utils"
import { useAddressSearch } from "@/hooks/useAddressSearch"

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
 const uiStore = useUIStore()
 const userStore = useUserStore()

 const isAddressModalOpen = useStoreData(uiStore, s => s.getIsAddressModalOpen())
 const address = useStoreData(userStore, s => s.getAddress())

 const setAddressModalOpen = (o: boolean) => uiStore.setAddressModalOpen(o)
 const updateAddress = (a: string, t: "delivery" | "pickup") => userStore.updateAddress(a, t)

 const [step, setStep] = useState<1 | 2>(1)
 const [deliveryType, setDeliveryType] = useState<DeliveryType>(null)
 const [tempAddress, setTempAddress] = useState(address)
 const [selectedPickup, setSelectedPickup] = useState<PickupPoint | null>(null)
 const [mapError, setMapError] = useState<string | null>(null)
 const [selectedCity, setSelectedCity] = useState<'Москва' | 'Санкт-Петербург'>('Москва')
 const [showCityDropdown, setShowCityDropdown] = useState(false)
 const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null)

 // Expanded address fields
 const [house, setHouse] = useState('')
 const [entrance, setEntrance] = useState('')
 const [floor, setFloor] = useState('')
 const [apartment, setApartment] = useState('')

 // Address search hook
 const {
  suggestions,
  setSuggestions,
  isLoading: isLoadingSuggestions,
  isLocating,
  skipNextFetch,
  fetchSuggestions,
  geolocate,
  searchTimeout
 } = useAddressSearch(selectedCity);

 useEffect(() => {
  if (skipNextFetch.current) {
   skipNextFetch.current = false
   return
  }

  if (step === 2 && deliveryType === "delivery" && tempAddress.length >= 2) {
   if (searchTimeout.current) clearTimeout(searchTimeout.current)
   searchTimeout.current = setTimeout(() => {
    fetchSuggestions(tempAddress)
   }, 400)
  } else {
   setSuggestions([])
  }
  return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current) }

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
  geolocate((addr, coords, matchedCity) => {
   if (matchedCity) setSelectedCity(matchedCity);
   setTempAddress(addr);
   setSelectedCoords(coords);
  });
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

   updateAddress(fullAddress, "delivery")
   handleClose()
  }
 }

 const handleSavePickup = () => {
  if (selectedPickup) {
   updateAddress(`${selectedPickup.city}, ${selectedPickup.address}`, "pickup")
   handleClose()
  }
 }

 // Stabilized callbacks for MapPicker
 const onAddressSelect = useCallback((val: string) => {
  skipNextFetch.current = true;
  setTempAddress(val);
 }, [skipNextFetch]);

 const onAddressDetailsSelect = useCallback((details: any) => {
  skipNextFetch.current = true;
  const road = details.road || details.full.split(',')[0];
  const house = details.house || '';
  const displayAddr = house ? `${road}, ${house}` : road;
  setTempAddress(displayAddr.replace(`${selectedCity}, `, '').replace('Москва, ', '').replace('Санкт-Петербург, ', ''));
  setHouse(house);
  if (details.coords) {
   setSelectedCoords(details.coords);
  }
 }, [selectedCity, skipNextFetch]);

 if (!isAddressModalOpen) return null

 return (
  <AnimatePresence>
   <div className="fixed inset-0 z-[100] flex items-stretch justify-end p-4 sm:p-6 overflow-hidden">
    <motion.div
     key="backdrop"
     initial={{ opacity: 0 }}
     animate={{ opacity: 1 }}
     exit={{ opacity: 0 }}
     className="absolute inset-0 bg-[#3A332E]/60"
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
        <div className="w-full h-[280px] sm:h-full sm:w-[55%] p-4 pb-0 sm:p-6 sm:pb-6 shrink-0 sm:shrink">
         <div className="w-full h-full rounded-[2rem] sm:rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm relative">
          <MapPicker
           hideSearch={true}
           initialAddress={selectedCity}
           onAddressSelect={() => { }}
           onError={setMapError}
          />
         </div>
        </div>

        <div className="flex-1 p-5 sm:p-10 flex flex-col justify-center overflow-y-auto">
         <div className="flex items-center justify-between mb-8">
          <h2 className="text-[22px] sm:text-[26px] font-extrabold text-smusl-brown tracking-tight">
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
          <button
           onClick={() => { setDeliveryType("delivery"); setStep(2) }}
           className="w-full h-[72px] px-6 rounded-[1.2rem] border border-gray-200 hover:border-smusl-terracotta bg-white transition-all flex items-center justify-between group"
          >
           <span className="text-[17px] font-extrabold text-smusl-brown">Доставка на дом</span>
           <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center group-hover:border-smusl-terracotta transition-colors">
            <div className="w-3 h-3 rounded-full bg-smusl-terracotta/0 group-hover:bg-smusl-terracotta scale-0 group-hover:scale-100 transition-all duration-300" />
           </div>
          </button>

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
        <div className="w-full h-[280px] sm:h-full sm:w-[55%] p-4 pb-0 sm:p-6 sm:pb-6 shrink-0 sm:shrink">
         <div className="w-full h-full rounded-[2rem] sm:rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm relative">
          <MapPicker
           hideSearch={true}
           initialAddress={tempAddress}
           onAddressSelect={onAddressSelect}
           onAddressDetailsSelect={onAddressDetailsSelect}
           onError={setMapError}
           externalCoords={selectedCoords}
          />
         </div>
        </div>

        <div className="flex-1 p-6 sm:p-10 flex flex-col overflow-y-auto no-scrollbar min-h-0 bg-white sm:bg-transparent">
         <div className="flex items-center justify-between mb-5 sm:mb-8">
          <div className="flex items-center gap-4">
           <button
            onClick={() => setStep(1)}
            className="p-1 text-[#3A332E] hover:text-smusl-terracotta transition-colors"
           >
            <ArrowLeft className="w-6 h-6" />
           </button>
           <h2 className="text-[22px] sm:text-[24px] font-[800] text-[#3A332E] tracking-tight">
            Введите адрес
           </h2>
          </div>
          <button onClick={handleClose} className="p-1 text-gray-300 hover:text-[#3A332E] transition-colors">
           <X className="w-6 h-6" />
          </button>
         </div>

         <div className="space-y-3 flex-1">
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
             className="mt-2 bg-white rounded-[1.2rem] shadow-[0_16px_48px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden max-h-[340px] overflow-y-auto no-scrollbar absolute w-full left-0 py-1.5 z-50"
            >
             {suggestions.map((s, idx) => {
              const title = (s.address as any)?.title || s.display_name;
              const subtitle = (s.address as any)?.subtitle || selectedCity;
              const road = (s.address as any)?.road || title;
              const houseNum = (s.address as any)?.house_number || "";

              return (
               <button
                key={idx}
                onClick={() => {
                 skipNextFetch.current = true;
                 const displayAddr = houseNum ? `${road}, ${houseNum}` : road;
                 setTempAddress(displayAddr);
                 setHouse(houseNum);
                 if (s.lat && s.lon) {
                  setSelectedCoords([parseFloat(s.lat), parseFloat(s.lon)]);
                 }
                 setSuggestions([]);
                }}
                className="w-full text-left px-5 py-3.5 flex flex-col group hover:bg-[#F8F9FA] transition-colors"
               >
                <span className="text-[15px] font-[800] text-[#333333] leading-tight group-hover:text-smusl-terracotta transition-colors">{title}</span>
                <span className="text-[12px] font-[600] text-[#999999] mt-1 uppercase tracking-wider">{subtitle}</span>
               </button>
              );
             })}
            </motion.div>
           )}
          </div>

          <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
           <div className="bg-[#F2F2F2] rounded-[1rem] px-2 sm:px-5 py-2.5 sm:py-3 flex flex-col justify-center overflow-hidden">
            <span className="block text-[7px] min-[375px]:text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-normal sm:tracking-[0.1em] mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Дом</span>
            <input
             type="text"
             value={house}
             onChange={(e) => setHouse(e.target.value)}
             placeholder="1"
             className="bg-transparent border-none outline-none text-[13px] sm:text-[15px] font-extrabold text-smusl-brown placeholder:text-[#BDBDBD] placeholder:font-normal w-full min-w-0"
            />
           </div>
           <div className="bg-[#F2F2F2] rounded-[1rem] px-2 sm:px-5 py-2.5 sm:py-3 flex flex-col justify-center overflow-hidden">
            <span className="block text-[7px] min-[375px]:text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-normal sm:tracking-[0.1em] mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Подъезд</span>
            <input
             type="text"
             value={entrance}
             onChange={(e) => setEntrance(e.target.value)}
             placeholder="1"
             className="bg-transparent border-none outline-none text-[13px] sm:text-[15px] font-extrabold text-smusl-brown placeholder:text-[#BDBDBD] placeholder:font-normal w-full min-w-0"
            />
           </div>
           <div className="bg-[#F2F2F2] rounded-[1rem] px-2 sm:px-5 py-2.5 sm:py-3 flex flex-col justify-center overflow-hidden">
            <span className="block text-[7px] min-[375px]:text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-normal sm:tracking-[0.1em] mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Этаж</span>
            <input
             type="text"
             value={floor}
             onChange={(e) => setFloor(e.target.value)}
             placeholder="1"
             className="bg-transparent border-none outline-none text-[13px] sm:text-[15px] font-extrabold text-smusl-brown placeholder:text-[#BDBDBD] placeholder:font-normal w-full min-w-0"
            />
           </div>
           <div className="bg-[#F2F2F2] rounded-[1rem] px-2 sm:px-5 py-2.5 sm:py-3 flex flex-col justify-center overflow-hidden">
            <span className="block text-[7px] min-[375px]:text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-normal sm:tracking-[0.1em] mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Кв. / Офис</span>
            <input
             type="text"
             value={apartment}
             onChange={(e) => setApartment(e.target.value)}
             placeholder="1"
             className="bg-transparent border-none outline-none text-[13px] sm:text-[15px] font-extrabold text-smusl-brown placeholder:text-[#BDBDBD] placeholder:font-normal w-full min-w-0"
            />
           </div>
          </div>

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
          className="mt-2 sm:mt-6 w-full h-[64px] sm:h-[72px] bg-smusl-terracotta disabled:bg-smusl-terracotta/50 text-white rounded-full font-[800] text-[18px] sm:text-[20px] hover:bg-[#b87a60] transition-all active:scale-95 shadow-lg shadow-smusl-terracotta/20 z-10 shrink-0 mb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:mb-0"
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
        <div className="w-full h-[260px] sm:h-full sm:w-[55%] p-4 pb-0 sm:p-6 sm:pb-6 shrink-0 sm:shrink">
         <div className="w-full h-full rounded-[2rem] sm:rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm relative">
          <MapPicker
           hideSearch={true}
           initialAddress={selectedPickup ? `${selectedPickup.city}, ${selectedPickup.address}` : ""}
           onAddressSelect={() => { }}
           onError={setMapError}
           externalCoords={selectedPickup ? (selectedPickup.coords as [number, number]) : null}
          />
         </div>
        </div>

        <div className="flex-1 p-6 sm:p-10 flex flex-col min-h-0 bg-white sm:bg-transparent">
         <div className="flex items-center justify-between mb-5 sm:mb-8">
          <div className="flex items-center gap-4">
           <button
            onClick={() => setStep(1)}
            className="p-1 text-[#3A332E] hover:text-smusl-terracotta transition-colors"
           >
            <ArrowLeft className="w-6 h-6" />
           </button>
           <h2 className="text-[22px] sm:text-[24px] font-[800] text-[#3A332E] leading-tight max-w-[200px] sm:max-w-none">
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

         <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1 no-scrollbar z-40 pb-4">
          {PICKUP_POINTS.filter(p => p.city === selectedCity).map((p) => (
           <button
            key={p.address}
            onClick={() => setSelectedPickup(p)}
            className={cn(
             "w-full h-[72px] px-6 rounded-[1.5rem] border transition-all flex items-center justify-between group",
             selectedPickup?.address === p.address
              ? "border-[#E8DFD8] bg-white shadow-sm"
              : "border-gray-100 bg-white hover:border-smusl-terracotta/20"
            )}
           >
            <span className={cn(
             "text-[18px] font-[800] transition-colors",
             selectedPickup?.address === p.address ? "text-[#3A332E]" : "text-[#3A332E]/60"
            )}>
             {p.address}
            </span>
            <div className={cn(
             "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
             selectedPickup?.address === p.address ? "border-smusl-terracotta" : "border-gray-200"
            )}>
             <div className={cn(
              "w-3 h-3 rounded-full bg-smusl-terracotta transition-all duration-300",
              selectedPickup?.address === p.address ? "scale-100 opacity-100" : "scale-0 opacity-0"
             )} />
            </div>
           </button>
          ))}
         </div>

         <button
          onClick={handleSavePickup}
          disabled={!selectedPickup}
          className="mt-2 sm:mt-6 w-full h-[64px] sm:h-[72px] bg-smusl-terracotta disabled:bg-smusl-terracotta/50 text-white rounded-full font-[800] text-[18px] sm:text-[20px] hover:bg-[#b87a60] transition-all active:scale-95 shadow-lg shadow-smusl-terracotta/20 z-10 shrink-0 mb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:mb-0"
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
