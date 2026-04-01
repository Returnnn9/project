"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { useUIStore, useUserStore, useStoreData } from "@/store/hooks"
import { X, ChevronDown, MapPin, ArrowLeft, Loader2, Edit3, CheckCircle2, Navigation, Phone, User as UserIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import MapPicker from "./MapPicker"
import { cn } from "@/lib/utils"
import { useAddressSearch } from "@/hooks/useAddressSearch"
import { PickupPoint, CityKey } from "@/lib/types/address"
import { PICKUP_POINTS, CITY_COORDS } from "@/lib/constants/delivery"
import DeliveryTypeSelector from "./DeliveryTypeSelector"
import { parseAddress, formatAddress } from "@/lib/address"
import { containerVariants, itemVariants, stepVariants } from "@/lib/motion-variants"

export default function AddressModal() {
 const uiStore = useUIStore()
 const userStore = useUserStore()

 const isAddressModalOpen = useStoreData(uiStore, s => s.getIsAddressModalOpen())
 const address = useStoreData(userStore, s => s.getAddress())

 const setAddressModalOpen = (o: boolean) => uiStore.setAddressModalOpen(o)
 const updateAddress = (a: string, t: "delivery" | "pickup") => userStore.updateAddress(a, t)

 const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
 const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup" | null>(null)
 const userName = useStoreData(userStore, s => s.getUserName())
 const userPhone = useStoreData(userStore, s => s.getUserPhone())
 const setUserName = (n: string) => userStore.setUserName(n)
 const setUserPhone = (p: string) => userStore.setUserPhone(p)

 const [tempAddress, setTempAddress] = useState(address)
 const [selectedPickup, setSelectedPickup] = useState<PickupPoint | null>(null)
 const [mapError, setMapError] = useState<string | null>(null)
 const [selectedCity, setSelectedCity] = useState<CityKey>('Москва')
 const [showCityDropdown, setShowCityDropdown] = useState(false)
 const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null)

 // Mobile WOW adaptive states
 const [isEditingAddress, setIsEditingAddress] = useState(false)

 // Expanded address fields
 const [house, setHouse] = useState('')
 const [corpus, setCorpus] = useState('')
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

   if (step === 4 && deliveryType === "delivery" && tempAddress.length >= 2) {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
     fetchSuggestions(tempAddress)
    }, 400)
   } else {
    setSuggestions([])
   }
   return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current) }
  }, [tempAddress, step, deliveryType, selectedCity, fetchSuggestions])

 const reset = useCallback(() => {
  setStep(1)
  setDeliveryType(null)
  if (address) {
   const d = parseAddress(address)
   setTempAddress(d.street || address)
   setHouse(d.house || '')
   setCorpus(d.corpus || '')
   setEntrance(d.entrance || '')
   setFloor(d.floor || '')
   setApartment(d.apartment || '')
  } else {
   setTempAddress('')
   setHouse('')
   setCorpus('')
   setEntrance('')
   setFloor('')
   setApartment('')
  }
  setSelectedPickup(null)
  setMapError(null)
  setSelectedCity('Москва')
  setShowCityDropdown(false)
  setSelectedCoords(null)
  setIsEditingAddress(false)
 }, [address])

  // Auto-focus for Phone field
  const phoneInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
   if (isAddressModalOpen && step === 1) {
    const timer = setTimeout(() => {
     phoneInputRef.current?.focus()
    }, 400) // Account for modal animation
    return () => clearTimeout(timer)
   }
  }, [isAddressModalOpen, step])

 // Reset modal to Step 1 when it opens
 useEffect(() => {
  if (isAddressModalOpen) {
   reset()
  }
 }, [isAddressModalOpen, reset])

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
   const fullAddress = formatAddress({
    street: tempAddress,
    house,
    corpus,
    entrance,
    floor,
    apartment
   })

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

  if (details.city) {
   const matchedCity = details.city.includes('Санкт-Петербург') ? 'Санкт-Петербург' :
    details.city.includes('Москва') ? 'Москва' : null;
   if (matchedCity) setSelectedCity(matchedCity);
  }

  let road = details.road || details.full.split(',')[0];
  const house = details.house || '';

  // If the road extracted is just the city name, try to get a more specific name
  if (road === selectedCity || road === 'Москва' || road === 'Санкт-Петербург') {
   const parts = details.full.split(',').map((p: string) => p.trim());
   const streetPart = parts.find((p: string) => p !== selectedCity && p !== 'Москва' && p !== 'Санкт-Петербург');
   if (streetPart) road = streetPart;
  }

  const displayAddr = house ? `${road}, ${house}` : road;
  // Aggressively strip city name from the start
  const cleanAddr = displayAddr
   .replace(new RegExp(`^${selectedCity},?\\s*`, 'i'), '')
   .replace(/^Москва,?\\s*/i, '')
   .replace(/^Санкт-Петербург,?\\s*/i, '')
   .trim();

  setTempAddress(cleanAddr);
  setHouse(house);
  setCorpus('');
  if (details.coords) {
   setSelectedCoords(details.coords);
  }
 }, [selectedCity, skipNextFetch]);

 if (!isAddressModalOpen) return null

 return (
  <AnimatePresence>
   <div className="fixed inset-0 z-[100] flex items-stretch justify-end p-0 sm:p-6 overflow-hidden bg-black/50 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none">
    <motion.div
     key="backdrop"
     initial={{ opacity: 0 }}
     animate={{ opacity: 1 }}
     exit={{ opacity: 0 }}
     className="absolute inset-0 bg-transparent sm:bg-[#3A332E]/40 sm:backdrop-blur-[8px]"
     onClick={handleClose}
    />

    <motion.div
     key="modal"
     initial={{ opacity: 0, y: "100%" }}
     animate={{ opacity: 1, y: 0 }}
     exit={{ opacity: 0, y: "100%" }}
     transition={{ type: "spring" as const, damping: 32, stiffness: 280 }}
     className="relative z-10 bg-white sm:bg-white/95 sm:backdrop-blur-[20px] rounded-t-[2rem] sm:rounded-[3rem] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] sm:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden flex w-full max-w-[1240px] h-[95vh] sm:h-full font-manrope sm:border-l sm:border-white/20 mt-auto sm:mt-0"
    >
     <button onClick={handleClose} className="absolute top-6 right-6 z-50 p-2.5 bg-gray-50/80 backdrop-blur-md rounded-full text-[#3A332E] hover:bg-gray-100 transition-all sm:hidden shadow-sm">
      <X className="w-5 h-5" />
     </button>

      {step > 1 && (
       <button
        onClick={() => {
         if (isEditingAddress) {
          setIsEditingAddress(false);
          return;
         }
         if (step === 4 && userStore.getSavedAddresses().length > 0) {
          setStep(3);
         } else {
          setStep(step - 1 as any);
         }
        }}
        className="absolute top-6 left-6 z-50 p-2.5 bg-gray-50/80 backdrop-blur-md rounded-full text-[#3A332E] hover:bg-gray-100 transition-all sm:hidden shadow-sm"
       >
        <ArrowLeft className="w-5 h-5" />
       </button>
      )}

     <AnimatePresence mode="wait">

      {/* ───── STEP 1: User Info ───── */}
      {step === 1 && (
       <motion.div
        key="step1-user-info"
        variants={stepVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col sm:flex-row h-full w-full flex-1"
       >
        <div className="flex-1 p-5 sm:p-10 flex flex-col justify-center overflow-y-auto w-full">
         <div className="flex items-center justify-between mb-8">
          <h2 className="text-[22px] sm:text-[26px] font-extrabold text-[#3A332E] tracking-tight">
           Как к вам обращаться?
          </h2>
          <button
           onClick={handleClose}
           className="hidden sm:block p-2 text-gray-400 hover:text-[#3A332E] transition-colors"
          >
           <X className="w-6 h-6" />
          </button>
         </div>

         <div className="space-y-4">
          <div className="bg-[#F8F8F8] rounded-[1.2rem] px-5 py-4 focus-within:border-gray-300 border border-transparent">
           <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ваше имя</span>
           <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-gray-400" />
            <input
             type="text"
             value={userName}
             onChange={(e) => setUserName(e.target.value)}
             placeholder="Например, Иван"
             className="w-full bg-transparent border-none outline-none text-[17px] font-extrabold text-[#3A332E] placeholder:text-gray-300"
            />
           </div>
          </div>

          <div className="bg-[#F8F8F8] rounded-[1.2rem] px-5 py-4 focus-within:border-gray-300 border border-transparent">
           <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Телефон</span>
           <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-gray-400" />
            <input
             ref={phoneInputRef}
             type="tel"
             value={userPhone}
             onChange={(e) => setUserPhone(e.target.value)}
             placeholder="+7 (XXX) XXX-XX-XX"
             className="w-full bg-transparent border-none outline-none text-[17px] font-extrabold text-[#3A332E] placeholder:text-gray-300"
            />
           </div>
          </div>

          <button
           onClick={() => setStep(2)}
           disabled={!userName || !userPhone}
           className="w-full h-[64px] bg-[#CF8F73] disabled:bg-[#CF8F73]/40 text-white rounded-[1.2rem] font-[800] text-[18px] hover:bg-[#b87a60] transition-all active:scale-95 shadow-xl shadow-[#CF8F73]/20 mt-6"
          >
           Далее
          </button>

          <p className="mt-6 text-[12px] font-medium text-[#3A332E]/30 leading-relaxed text-center px-4">
           Нажимая «Далее», принимаю{" "}
           <a href="/offer" className="text-[#CF8F73] underline underline-offset-2 hover:text-[#b87a60] transition-colors">оферту</a>
           {" "}и{" "}
           <a href="/terms" className="text-[#CF8F73] underline underline-offset-2 hover:text-[#b87a60] transition-colors">пользовательское соглашение</a>
           , соглашаюсь на обработку персональных данных на условиях{" "}
           <a href="/privacy" className="text-[#CF8F73] underline underline-offset-2 hover:text-[#b87a60] transition-colors">политики конфиденциальности</a>
          </p>
         </div>
        </div>
       </motion.div>
      )}

      {/* ───── STEP 2: Способ получения ───── */}
      {step === 2 && (
       <motion.div
        key="step2-delivery-type"
        variants={stepVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col sm:flex-row h-full w-full flex-1"
       >
        <div className="flex-1 p-5 sm:p-10 flex flex-col justify-center overflow-y-auto w-full">
         <div className="flex items-center justify-between mb-8">
          <h2 className="text-[22px] sm:text-[26px] font-extrabold text-[#3A332E] tracking-tight">
           Способ получения
          </h2>
          <button
           onClick={handleClose}
           className="hidden sm:block p-2 text-gray-400 hover:text-[#3A332E] transition-colors"
          >
           <X className="w-6 h-6" />
          </button>
         </div>

         <div className="space-y-4">
          <DeliveryTypeSelector 
            selectedType={deliveryType}
            onSelect={(type) => {
           setDeliveryType(type);
           if (type === "delivery" && userStore.getSavedAddresses().length > 0) {
            setStep(3);
           } else {
            setStep(type === "delivery" ? 4 : 3);
           }
          }} />
         </div>
        </div>
       </motion.div>
      )}

       {/* ───── STEP 3: Saved Addresses (Delivery) or Pickup Selection ───── */}
       {step === 3 && deliveryType === "delivery" && (
        <motion.div
         key="step3-saved"
         variants={stepVariants}
         initial="initial"
         animate="animate"
         exit="exit"
         className="flex flex-col h-full w-full p-6 sm:p-12"
        >
         <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
           <button onClick={() => setStep(2)} className="p-1 text-[#3A332E]">
            <ArrowLeft className="w-6 h-6" />
           </button>
           <h2 className="text-[24px] sm:text-[28px] font-extrabold text-[#3A332E] tracking-tight">Выбрать адрес</h2>
          </div>
          <button onClick={handleClose} className="p-1 text-gray-300 hover:text-[#3A332E] transition-colors hidden sm:block">
           <X className="w-6 h-6" />
          </button>
         </div>

         <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 overflow-y-auto px-1 no-scrollbar space-y-3"
         >
          <AnimatePresence mode="popLayout">
           {userStore.getSavedAddresses().map((addr, idx) => (
            <motion.button
             key={addr}
             variants={itemVariants}
             whileHover={{ scale: 1.01 }}
             whileTap={{ scale: 0.99 }}
             onClick={() => {
              const details = parseAddress(addr);
              setTempAddress(details.street);
              setHouse(details.house);
              setCorpus(details.corpus || '');
              setEntrance(details.entrance);
              setFloor(details.floor);
              setApartment(details.apartment);
              updateAddress(addr, "delivery");
              handleClose();
             }}
             className={cn(
              "w-full px-6 py-5 rounded-[1.5rem] border transition-all flex items-center justify-between group",
              address === addr ? "border-[#CF8F73] bg-[#CF8F73]/5 shadow-sm" : "border-gray-100 bg-white hover:border-gray-200"
             )}
            >
             <div className="flex flex-col items-start gap-1 flex-1 min-w-0 mr-4">
              <span className={cn(
               "text-[16px] font-[800] transition-colors text-left truncate w-full",
               address === addr ? "text-[#CF8F73]" : "text-[#3A332E]"
              )}>{addr}</span>
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">{selectedCity}</span>
             </div>
             <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
              address === addr ? "border-[#CF8F73] bg-[#CF8F73]" : "border-gray-200"
             )}>
              {address === addr && <div className="w-2 h-2 rounded-full bg-white" />}
             </div>
            </motion.button>
           ))}
          </AnimatePresence>
         </motion.div>

         <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
           setTempAddress('');
           setHouse('');
           setCorpus('');
           setEntrance('');
           setFloor('');
           setApartment('');
           setStep(4);
          }}
          className="mt-6 w-full h-[64px] bg-[#CF8F73] text-white rounded-[1.2rem] font-[800] text-[18px] hover:bg-[#b87a60] transition-all active:scale-95 shadow-xl shadow-[#CF8F73]/20 shrink-0"
         >
          Новый адрес
         </motion.button>
        </motion.div>
       )}


       {step === 3 && deliveryType === "pickup" && (
        <motion.div
         key="step3-pickup"
        variants={stepVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col sm:flex-row h-full w-full relative flex-1"
       >
        <div className="absolute inset-0 sm:relative sm:inset-auto sm:w-[50%] sm:h-full p-0 sm:p-6 sm:pb-6 z-0">
         <div className="w-full h-full sm:rounded-[2rem] overflow-hidden sm:border border-gray-100 relative">
          <MapPicker
           hideSearch={true}
           showGeolocate={true}
           interactive={true}
           initialAddress={selectedPickup ? `${selectedPickup.city}, ${selectedPickup.address}` : ""}
           onAddressSelect={() => { }}
           onError={setMapError}
           externalCoords={selectedPickup ? (selectedPickup.coords as [number, number]) : CITY_COORDS[selectedCity]}
          />
         </div>
        </div>

        <motion.div
         drag="y"
         dragConstraints={{ top: 0, bottom: 0 }}
         dragElastic={0.06}
         onDragEnd={(e, { offset, velocity }) => {
          if (offset.y > 100 || velocity.y > 400) {
           if (isEditingAddress) {
            setIsEditingAddress(false);
           }
          } else if (offset.y < -100 || velocity.y < -400) {
           setIsEditingAddress(true);
          }
         }}
         initial={{ y: "100%" }}
         animate={{ y: 0 }}
         className={cn(
          "absolute bottom-0 left-0 right-0 sm:relative sm:bottom-auto bg-white sm:bg-transparent z-10 flex flex-col rounded-t-[2.5rem] sm:rounded-none shadow-[0_-12px_40px_rgba(0,0,0,0.12)] sm:shadow-none overflow-hidden sm:overflow-y-auto no-scrollbar touch-pan-y",
          isEditingAddress ? "h-[85vh] sm:h-full p-6 sm:p-10" : "p-6 pb-[calc(20px+env(safe-area-inset-bottom))] sm:h-full sm:p-10"
         )}
         transition={{ type: "spring" as const, damping: 28, stiffness: 220 }}
        >
         <div className="w-12 h-1.5 bg-gray-200/50 rounded-full mx-auto mb-4 sm:hidden shrink-0" />

         <div className={cn("sm:hidden flex flex-col gap-4", isEditingAddress ? "hidden" : "flex")}>
          <motion.div
           whileHover={{ scale: 1.02 }}
           whileTap={{ scale: 0.98 }}
           onClick={() => setIsEditingAddress(true)}
           onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsEditingAddress(true); }}
           role="button"
           tabIndex={0}
           className="w-full p-5 bg-[#F8F8F8] rounded-[1.5rem] border border-gray-100 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#3A332E]/20"
          >
           <div className="flex flex-col gap-1 overflow-hidden pr-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Пункт выдачи</span>
            <span className="text-[16px] font-extrabold text-[#CF8F73] truncate">
             {selectedPickup ? selectedPickup.address : "Выберите на карте"}
            </span>
           </div>
           <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 text-[#3A332E]">
            <Edit3 className="w-4 h-4" />
           </div>
          </motion.div>
          <button
           onClick={handleSavePickup}
           disabled={!selectedPickup}
           className="w-full h-[68px] bg-[#CF8F73] disabled:bg-[#CF8F73]/40 text-white rounded-[1.5rem] font-[900] text-[19px] hover:bg-[#b87a60] transition-all active:scale-95 shadow-xl shadow-[#CF8F73]/20 mt-1"
          >
           Да, всё верно
          </button>
         </div>

         <div className={cn("flex-col h-full", isEditingAddress ? "flex" : "hidden sm:flex")}>
          <div className="flex items-center justify-between mb-5 sm:mb-8 shrink-0">
           <div className="flex items-center gap-4">
            <button onClick={() => { if (isEditingAddress && window.innerWidth < 640) { setIsEditingAddress(false) } else { setStep(2) } }} className="p-1 text-[#3A332E]">
             <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-[22px] sm:text-[24px] font-bold text-[#3A332E] tracking-tight">Точка самовывоза</h2>
           </div>
          </div>

          <div className="relative mb-6 z-50">
           <div className="bg-[#F8F8F8] rounded-[1.2rem] px-5 py-4 cursor-pointer border border-transparent hover:border-gray-200 transition-colors" onClick={() => setShowCityDropdown(!showCityDropdown)}>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">ГОРОД</span>
            <div className="flex items-center justify-between">
             <span className="text-[15px] font-extrabold text-[#3A332E]">{selectedCity}</span>
             <ChevronDown className={cn('w-4 h-4 text-gray-300 transition-transform duration-200', showCityDropdown && 'rotate-180')} />
            </div>
           </div>
           {showCityDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-[1.2rem] shadow-[0_12px_30px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
             {(['Москва', 'Санкт-Петербург'] as const).map(c => (
              <button key={c} onClick={() => { setSelectedCity(c); setSelectedPickup(null); setShowCityDropdown(false) }} className={cn('w-full text-left px-5 py-3.5 text-[15px] font-bold transition-colors border-b last:border-0 border-gray-50', selectedCity === c ? 'bg-gray-50' : 'hover:bg-gray-50')}>{c}</button>
             ))}
            </div>
           )}
          </div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1 no-scrollbar pb-4">
           <AnimatePresence mode="popLayout">
            {PICKUP_POINTS.filter(p => p.city === selectedCity).map((p) => (
             <motion.button key={p.address} variants={itemVariants} onClick={() => setSelectedPickup(p)} className={cn("w-full px-6 py-4 rounded-[1.8rem] border transition-all flex items-center justify-between group", selectedPickup?.address === p.address ? "border-[#CF8F73] bg-[#CF8F73] shadow-sm text-white" : "border-gray-100 bg-white hover:border-gray-300")}>
              <span className="text-[18px] font-extrabold tracking-tight">{p.address}</span>
              <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors", selectedPickup?.address === p.address ? "border-white" : "border-gray-200")}>
               {selectedPickup?.address === p.address && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
              </div>
             </motion.button>
            ))}
           </AnimatePresence>
          </motion.div>
          <button onClick={handleSavePickup} disabled={!selectedPickup} className="mt-6 w-full h-[64px] sm:h-[72px] bg-[#CF8F73] disabled:bg-[#CF8F73]/40 text-white rounded-[1.5rem] font-black text-[18px] sm:text-[20px] transition-all active:scale-95 shadow-xl shadow-[#CF8F73]/20 mb-[calc(1rem+env(safe-area-inset-bottom))] sm:mb-0">
           {isEditingAddress && window.innerWidth < 640 ? 'Готово' : 'Всё верно'}
          </button>
         </div>
        </motion.div>
       </motion.div>
      )}


       {/* ───── STEP 4: Delivery Details ───── */}
       {step === 4 && deliveryType === "delivery" && (
        <motion.div
         key="step4-delivery"
        variants={stepVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col sm:flex-row h-full w-full relative flex-1"
       >
        <div className="absolute inset-0 sm:relative sm:inset-auto sm:w-[50%] sm:h-full p-0 sm:p-6 sm:pb-6 z-0">
         <div className="w-full h-full sm:rounded-[2rem] overflow-hidden sm:border border-gray-100 relative">
          <MapPicker
           hideSearch={true}
           showGeolocate={true}
           initialAddress={tempAddress}
           onAddressSelect={onAddressSelect}
           onAddressDetailsSelect={onAddressDetailsSelect}
           onError={setMapError}
           externalCoords={selectedCoords}
          />
         </div>
        </div>

        <motion.div
         drag="y"
         dragConstraints={{ top: 0, bottom: 0 }}
         dragElastic={0.06}
         onDragEnd={(e, { offset, velocity }) => {
          if (offset.y > 100 || velocity.y > 400) {
           if (isEditingAddress) {
            setIsEditingAddress(false);
           }
          } else if (offset.y < -100 || velocity.y < -400) {
           setIsEditingAddress(true);
          }
         }}
         initial={{ y: "100%" }}
         animate={{ y: 0 }}
         className={cn(
          "absolute bottom-0 left-0 right-0 sm:relative sm:bottom-auto bg-white sm:bg-transparent z-10 flex flex-col rounded-t-[2.5rem] sm:rounded-none shadow-[0_-12px_40px_rgba(0,0,0,0.12)] sm:shadow-none overflow-hidden sm:overflow-y-auto no-scrollbar touch-pan-y",
          isEditingAddress ? "h-[85vh] sm:h-full p-6 sm:p-10" : "p-6 pb-[calc(20px+env(safe-area-inset-bottom))] sm:h-full sm:p-10"
         )}
         transition={{ type: "spring" as const, damping: 28, stiffness: 220 }}
        >
         <div className="w-12 h-1.5 bg-gray-200/50 rounded-full mx-auto mb-4 sm:hidden shrink-0" />

         <div className={cn("sm:hidden flex flex-col gap-4", isEditingAddress ? "hidden" : "flex")}>
          <motion.div
           whileHover={{ scale: 1.01 }}
           whileTap={{ scale: 0.98 }}
           onClick={() => setIsEditingAddress(true)}
           onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsEditingAddress(true); }}
           role="button"
           tabIndex={0}
           className="w-full p-5 bg-[#F8F8F8] rounded-[1.5rem] border border-gray-100 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all cursor-text outline-none focus-visible:ring-2 focus-visible:ring-[#3A332E]/20"
          >
           <div className="flex flex-col gap-1 overflow-hidden pr-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Куда везем?</span>
            <span className="text-[16px] font-extrabold text-[#3A332E] truncate">
             {tempAddress || "Укажите на карте..."} {house ? `, д. ${house}` : ''}
            </span>
           </div>
           <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 text-[#3A332E]">
            <Edit3 className="w-4 h-4" />
           </div>
          </motion.div>
          <button
           onClick={handleSaveDelivery}
           disabled={!tempAddress || !house || !entrance || !apartment}
           className="w-full h-[68px] bg-[#CF8F73] disabled:bg-[#CF8F73]/40 text-white rounded-[1.5rem] font-[900] text-[19px] hover:bg-[#b87a60] transition-all active:scale-95 shadow-xl shadow-[#CF8F73]/20 mt-1"
          >
           Всё верно
          </button>
         </div>

         <div className={cn("flex-col h-full", isEditingAddress ? "flex" : "hidden sm:flex")}>
          <div className="flex items-center justify-between mb-6 sm:mb-8 shrink-0">
           <div className="flex items-center gap-4">
             <button onClick={() => { if (isEditingAddress && window.innerWidth < 640) { setIsEditingAddress(false) } else { setStep(2) } }} className="p-1 text-[#3A332E]">
             <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-[20px] sm:text-[24px] font-extrabold text-[#3A332E] tracking-tight">Введите адрес</h2>
           </div>
          </div>

          <div className="space-y-4 flex-1 w-full overflow-y-auto no-scrollbar pb-6">
           {/* City Selector */}
           <div className="relative z-50">
            <div className="bg-[#F8F8F8] rounded-[1.2rem] px-5 py-4 cursor-pointer border border-transparent hover:border-gray-200" onClick={() => setShowCityDropdown(!showCityDropdown)}>
             <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Город</span>
             <div className="flex items-center justify-between">
              <span className="text-[17px] font-extrabold text-[#3A332E]">{selectedCity}</span>
              <ChevronDown className={cn("w-5 h-5 transition-transform duration-300", showCityDropdown && "rotate-180")} />
             </div>
            </div>
            {showCityDropdown && (
             <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-[1.2rem] shadow-xl border border-gray-100 overflow-hidden">
              {(['Москва', 'Санкт-Петербург'] as const).map(c => (
               <button key={c} onClick={() => { setSelectedCity(c); setTempAddress(''); setSuggestions([]); setSelectedCoords(null); setShowCityDropdown(false) }} className={cn('w-full text-left px-5 py-3.5 text-[15px] font-bold border-b last:border-0 border-gray-50', selectedCity === c ? 'bg-gray-50' : 'hover:bg-gray-50')}>{c}</button>
              ))}
             </div>
            )}
           </div>

           {/* Street & House */}
           <div className="relative z-40">
            <div className="bg-[#F8F8F8] rounded-[1.2rem] px-5 py-4 focus-within:border-gray-300 border border-transparent">
             <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Улица и дом</span>
             <div className="flex items-center gap-2">
              <input type="text" value={tempAddress} onChange={(e) => setTempAddress(e.target.value)} placeholder="Введите адрес" className="w-full bg-transparent border-none outline-none text-[17px] font-extrabold text-[#3A332E] placeholder:text-gray-300" />
              {isLoadingSuggestions && <Loader2 className="w-4 h-4 animate-spin text-[#CF8F73]" />}
             </div>
            </div>
            <AnimatePresence>
             {suggestions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 bg-white rounded-[1.2rem] shadow-2xl border border-gray-100 overflow-hidden max-h-[320px] overflow-y-auto relative sm:absolute w-full left-0 z-50 py-1">
               {suggestions.map((s, idx) => (
                <button key={idx} onClick={() => {
                 skipNextFetch.current = true;
                 setTempAddress(s.display_name);
                 setHouse((s.address as any)?.house_number || "");
                 setCorpus("");
                 setSuggestions([]);
                 if (s.lat && s.lon) setSelectedCoords([parseFloat(s.lat), parseFloat(s.lon)]);
                 setIsEditingAddress(false);
                }} className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-50 flex flex-row items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#CF8F73]/10 group-hover:text-[#CF8F73] transition-colors shrink-0">
                   <Navigation className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                   <span className="text-[15px] sm:text-[17px] font-extrabold text-[#333] leading-tight truncate">{(s.address as any)?.title || s.display_name}</span>
                   <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{(s.address as any)?.subtitle || selectedCity}</span>
                  </div>
                 </button>
               ))}
              </motion.div>
             )}
             </AnimatePresence>
            </div>

            <div className="flex flex-col gap-4 mt-2 pb-4">
             <div className="flex gap-4">
              <div className="flex-1 bg-[#F8F8F8] rounded-[1.2rem] px-5 py-3 focus-within:border-gray-300 border border-transparent">
               <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Дом *</span>
               <input type="text" value={house} onChange={(e) => setHouse(e.target.value)} placeholder="1" className="w-full bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] placeholder:text-gray-300" />
              </div>
              <div className="flex-1 bg-[#F8F8F8] rounded-[1.2rem] px-5 py-3 focus-within:border-gray-300 border border-transparent">
               <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Корпус</span>
               <input type="text" value={corpus} onChange={(e) => setCorpus(e.target.value)} placeholder="А" className="w-full bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] placeholder:text-gray-300" />
              </div>
             </div>
             <div className="flex gap-3">
              <div className="flex-1 bg-[#F8F8F8] rounded-[1.2rem] px-4 py-3 focus-within:border-gray-300 border border-transparent">
               <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Подъезд *</span>
               <input type="text" value={entrance} onChange={(e) => setEntrance(e.target.value)} placeholder="1" className="w-full bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] placeholder:text-gray-300" />
              </div>
              <div className="flex-[0.8] bg-[#F8F8F8] rounded-[1.2rem] px-4 py-3 focus-within:border-gray-300 border border-transparent">
               <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Этаж</span>
               <input type="text" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="0" className="w-full bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] placeholder:text-gray-300" />
              </div>
              <div className="flex-1 bg-[#F8F8F8] rounded-[1.2rem] px-4 py-3 focus-within:border-gray-300 border border-transparent">
               <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Кв. *</span>
               <input type="text" value={apartment} onChange={(e) => setApartment(e.target.value)} placeholder="10" className="w-full bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] placeholder:text-gray-300" />
              </div>
             </div>
            </div>

           </div>

          <button onClick={handleSaveDelivery} disabled={!tempAddress || !house || !entrance || !apartment} className="mt-auto w-full h-[64px] sm:h-[72px] bg-[#CF8F73] disabled:bg-[#CF8F73]/40 text-white rounded-[1.5rem] font-black text-[18px] sm:text-[20px] transition-all active:scale-95 shadow-xl shadow-[#CF8F73]/20 mb-[calc(1rem+env(safe-area-inset-bottom))] sm:mb-0">
           {isEditingAddress && window.innerWidth < 640 ? 'Готово' : 'Всё верно'}
          </button>
         </div>
        </motion.div>
       </motion.div>
      )}

     </AnimatePresence>
    </motion.div>
   </div>
  </AnimatePresence>
 )
}
