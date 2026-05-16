"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { useUIStore, useUserStore } from "@/store/hooks"
import { X, ChevronDown, ArrowLeft, Edit3, Phone, User as UserIcon } from "lucide-react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import MapPicker from "./MapPicker"
import AddressSearchBox from "./AddressSearchBox"
import { cn } from "@/lib/utils"
import { useAddressSearch } from "@/hooks/useAddressSearch"
import { AddressEntity, PickupPoint, CityKey } from "@/lib/types/address"
import { PICKUP_POINTS, CITY_COORDS, CITIES } from "@/lib/constants/delivery"
import DeliveryTypeSelector from "./DeliveryTypeSelector"
import { entityFromSuggestion, formatAddress, parseRussianAddress } from "@/lib/address"
import { normalizePhone } from "@/lib/phone"
import { containerVariants, itemVariants, stepVariants } from "@/lib/motion-variants"
import { useSession } from "next-auth/react"

export default function AddressModal() {
 const { status: authStatus } = useSession()

 const prefersReducedMotion = useReducedMotion()
 const isAddressModalOpen = useUIStore(s => s.isAddressModalOpen)
 const setAddressModalOpen = useUIStore(s => s.setAddressModalOpen)
 const setAuthModalOpen = useUIStore(s => s.setAuthModalOpen)

 const address = useUserStore(s => s.address)
 const currentAddressEntity = useUserStore(s => s.currentAddressEntity)
 const updateAddress = useUserStore(s => s.updateAddress)
 const userName = useUserStore(s => s.userName)
 const userPhone = useUserStore(s => s.userPhone)
 const savedAddresses = useUserStore(s => s.savedAddresses)
 const setUserName = useUserStore(s => s.setUserName)
 const setUserPhone = useUserStore(s => s.setUserPhone)

 const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
 const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup" | null>(null)

 const [tempAddress, setTempAddress] = useState(address)
 const [selectedPickup, setSelectedPickup] = useState<PickupPoint | null>(null)
 const [selectedCity, setSelectedCity] = useState<CityKey>('Москва')
 const [showCityDropdown, setShowCityDropdown] = useState(false)
 const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null)

 const [isEditingAddress, setIsEditingAddress] = useState(false)

 const [house, setHouse] = useState('')
 const [corpus, setCorpus] = useState('')
 const [entrance, setEntrance] = useState('')
 const [floor, setFloor] = useState('')
 const [apartment, setApartment] = useState('')

 const {
  suggestions,
  clearSuggestions,
  isLoading: isLoadingSuggestions,
  history,
  onHistoryCleared,
  debouncedSearch,
 } = useAddressSearch(selectedCity);

 const reset = useCallback(() => {
  setStep(1)
  setDeliveryType(null)
  if (currentAddressEntity) {
   setTempAddress(currentAddressEntity.road)
   setHouse(currentAddressEntity.house || '')
   setCorpus(currentAddressEntity.corpus || '')
   setEntrance(currentAddressEntity.entrance || '')
   setFloor(currentAddressEntity.floor || '')
   setApartment(currentAddressEntity.apartment || '')
  } else if (address) {
   setTempAddress(address)
   setHouse('')
   setCorpus('')
   setEntrance('')
   setFloor('')
   setApartment('')
  } else {
   setTempAddress('')
   setHouse('')
   setCorpus('')
   setEntrance('')
   setFloor('')
   setApartment('')
  }
  setSelectedPickup(null)
  setSelectedCity('Москва')
  setShowCityDropdown(false)
  setSelectedCoords(null)
  setIsEditingAddress(false)
 }, [address, currentAddressEntity])

 const phoneInputRef = useRef<HTMLInputElement>(null)
 useEffect(() => {
  if (isAddressModalOpen && step === 1) {
   const timer = setTimeout(() => {
    phoneInputRef.current?.focus()
   }, 400)
   return () => clearTimeout(timer)
  }
 }, [isAddressModalOpen, step])

 useEffect(() => {
  if (isAddressModalOpen) {
   reset()
  }
 }, [isAddressModalOpen, reset])

 const handleClose = () => {
  setAddressModalOpen(false)
  setTimeout(reset, 400)
 }

 const handleSaveDelivery = () => {
  if (tempAddress && house) {
   const entity: AddressEntity = {
    road: tempAddress,
    house,
    corpus,
    entrance,
    floor,
    apartment,
    city: selectedCity,
    coords: selectedCoords,
    displayLine: [tempAddress, house].filter(Boolean).join(', '),
    full: formatAddress({ road: tempAddress, house, corpus, entrance, floor, apartment }),
   }
   updateAddress(entity, 'delivery')
   handleClose()
  }
 }

 const handleSavePickup = () => {
  if (selectedPickup) {
   const entity: AddressEntity = {
    road: selectedPickup.address,
    house: '',
    corpus: '',
    entrance: '',
    floor: '',
    apartment: '',
    city: selectedPickup.city,
    coords: selectedPickup.coords as [number, number],
    displayLine: selectedPickup.address,
    full: `${selectedPickup.city}, ${selectedPickup.address}`,
   }
   updateAddress(entity, 'pickup')
   handleClose()
  }
 }

 const onAddressSelect = useCallback((val: string) => {
  setTempAddress(val);
 }, []);

 const onAddressDetailsSelect = useCallback((entity: AddressEntity) => {
  if (entity.city) {
   const matched = entity.city.includes('Санкт-Петербург') ? 'Санкт-Петербург'
    : entity.city.includes('Москва') ? 'Москва' : null;
   if (matched) setSelectedCity(matched as CityKey);
  }
  setTempAddress(entity.road);
  // Always update — clears stale house when new pin has no house number
  setHouse(entity.house || '');
  if (entity.coords) setSelectedCoords(entity.coords);
 }, []);

 if (!isAddressModalOpen) return null

 return (
  <AnimatePresence>
   <div className="fixed inset-0 z-[100] flex flex-col sm:flex-row justify-end sm:items-stretch p-0 sm:p-6 overflow-hidden bg-black/50 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none">
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
     transition={prefersReducedMotion ? { duration: 0.15 } : { type: "spring" as const, damping: 32, stiffness: 280 }}
     className="relative z-10 bg-white sm:bg-white/95 sm:backdrop-blur-[20px] rounded-t-[2.5rem] sm:rounded-[3rem] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] sm:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] flex flex-col w-full max-w-[1240px] h-[95dvh] sm:h-full font-manrope sm:border-l sm:border-white/20 mt-auto sm:mt-0 overflow-hidden"
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
        if (step === 4 && savedAddresses.length > 0) {
         setStep(3);
        } else {
         setStep((step - 1) as 1 | 2 | 3 | 4 | 5);
        }
       }}
       className="absolute top-6 left-6 z-50 p-2.5 bg-gray-50/80 backdrop-blur-md rounded-full text-[#3A332E] hover:bg-gray-100 transition-all sm:hidden shadow-sm"
      >
       <ArrowLeft className="w-5 h-5" />
      </button>
     )}

     <AnimatePresence mode="wait">

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
           disabled={!userName || !normalizePhone(userPhone)}
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

          {authStatus !== 'authenticated' && (
           <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col items-center gap-2">
            <p className="text-[14px] font-medium text-[#3A332E]/40">
             Уже есть аккаунт?{" "}
             <button
              onClick={() => { handleClose(); setAuthModalOpen(true); }}
              className="text-[#CF8F73] font-bold hover:text-[#b87a60] transition-colors decoration-[#CF8F73]/30 underline underline-offset-4 decoration-2"
             >
              Войти
             </button>
            </p>
           </div>
          )}
         </div>
        </div>
       </motion.div>
      )}

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
          <h2 className="text-[26px] sm:text-[32px] font-black text-[#3A332E] tracking-tight">
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
            if (type === "delivery" && savedAddresses.length > 0) {
             setStep(3);
            } else {
             setStep(type === "delivery" ? 4 : 3);
            }
           }} />
         </div>
        </div>
       </motion.div>
      )}

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
          {savedAddresses.map((addr) => (
           <motion.button
            key={addr.displayLine}
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
             setTempAddress(addr.road);
             setHouse(addr.house || '');
             setCorpus(addr.corpus || '');
             setEntrance(addr.entrance || '');
             setFloor(addr.floor || '');
             setApartment(addr.apartment || '');
             updateAddress(addr, "delivery");
             handleClose();
            }}
            className={cn(
             "w-full px-6 py-5 rounded-[1.5rem] border transition-all flex items-center justify-between group",
             address === addr.full ? "border-[#CF8F73] bg-[#CF8F73]/5 shadow-sm" : "border-gray-100 bg-white hover:border-gray-200"
            )}
           >
            <div className="flex flex-col items-start gap-1 flex-1 min-w-0 mr-4">
             <span className={cn(
              "text-[16px] font-[800] transition-colors text-left truncate w-full",
              address === addr.full ? "text-[#CF8F73]" : "text-[#3A332E]"
             )}>{addr.displayLine}</span>
             <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">{addr.city || selectedCity}</span>
            </div>
            <div className={cn(
             "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
             address === addr.full ? "border-[#CF8F73] bg-[#CF8F73]" : "border-gray-200"
            )}>
             {address === addr.full && <div className="w-2 h-2 rounded-full bg-white" />}
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
           city={selectedCity}
           hideSearch={true}
           showGeolocate={true}
           interactive={true}
           initialAddress={selectedPickup ? `${selectedPickup.city}, ${selectedPickup.address}` : ""}
           onAddressSelect={() => { }}
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
           if (isEditingAddress) setIsEditingAddress(false);
          } else if (offset.y < -100 || velocity.y < -400) {
           setIsEditingAddress(true);
          }
         }}
         initial={{ y: "100%" }}
         animate={{ y: 0 }}
         className={cn(
          "absolute bottom-0 left-0 right-0 sm:relative sm:bottom-auto bg-white sm:bg-transparent z-10 flex flex-col rounded-t-[2.5rem] sm:rounded-none shadow-[0_-12px_40px_rgba(0,0,0,0.12)] sm:shadow-none overflow-hidden sm:overflow-y-auto no-scrollbar touch-pan-y",
          isEditingAddress ? "h-[85dvh] sm:h-full pt-6 px-6 pb-0 sm:p-10" : "p-6 pb-[calc(20px+env(safe-area-inset-bottom))] sm:h-full sm:p-10"
         )}
         transition={{ type: "spring" as const, damping: 28, stiffness: 220 }}
        >
         <div className="w-full flex items-center justify-center shrink-0 mb-4 sm:hidden group relative z-10 cursor-grab active:cursor-grabbing">
          <div className="absolute top-1/2 -translate-y-1/2 w-20 h-6 bg-[#CF8F73]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="w-14 h-[5px] rounded-full bg-[#4A403A]/15 border border-[#4A403A]/5 shadow-[0_1px_2px_rgba(255,255,255,0.8)_inset,0_1px_3px_rgba(0,0,0,0.05)] relative overflow-hidden transition-all duration-300 group-active:scale-95 group-active:bg-[#4A403A]/25">
           <motion.div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full" animate={{ translateX: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", repeatDelay: 0.5 }} />
          </div>
         </div>

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
          <div className="mt-auto shrink-0 sticky bottom-0 bg-white pt-4 pb-[calc(3.5rem+env(safe-area-inset-bottom))] sm:pb-0 z-50 border-t border-gray-100/80 -mx-6 px-6 sm:mx-0 sm:px-0 shadow-[0_-20px_50px_rgba(0,0,0,0.06)]">
           <button
            onClick={handleSavePickup}
            disabled={!selectedPickup}
            className="w-full h-[64px] sm:h-[72px] bg-[#CF8F73] disabled:bg-[#CF8F73]/40 text-white rounded-[1.8rem] font-black text-[18px] sm:text-[20px] transition-all active:scale-95 shadow-xl shadow-[#CF8F73]/20"
           >
            {isEditingAddress ? 'Готово' : 'Всё верно'}
           </button>
          </div>
         </div>
        </motion.div>
       </motion.div>
      )}

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
           city={selectedCity}
           hideSearch={true}
           showGeolocate={true}
           initialAddress={tempAddress}
           onAddressSelect={onAddressSelect}
           onAddressDetailsSelect={onAddressDetailsSelect}
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
           if (isEditingAddress) setIsEditingAddress(false);
          } else if (offset.y < -100 || velocity.y < -400) {
           setIsEditingAddress(true);
          }
         }}
         initial={{ y: "100%" }}
         animate={{ y: 0 }}
         className={cn(
          "absolute bottom-0 left-0 right-0 sm:relative sm:bottom-auto bg-white sm:bg-transparent z-10 flex flex-col rounded-t-[2.5rem] sm:rounded-none shadow-[0_-12px_40px_rgba(0,0,0,0.12)] sm:shadow-none overflow-hidden sm:overflow-y-auto no-scrollbar touch-pan-y",
          isEditingAddress ? "h-[85dvh] sm:h-full pt-6 px-6 pb-0 sm:p-10" : "p-6 pb-[calc(20px+env(safe-area-inset-bottom))] sm:h-full sm:p-10"
         )}
         transition={{ type: "spring" as const, damping: 28, stiffness: 220 }}
        >
         <div className="w-full flex items-center justify-center shrink-0 mb-4 sm:hidden group relative z-10 cursor-grab active:cursor-grabbing">
          <div className="absolute top-1/2 -translate-y-1/2 w-20 h-6 bg-[#CF8F73]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="w-14 h-[5px] rounded-full bg-[#4A403A]/15 border border-[#4A403A]/5 shadow-[0_1px_2px_rgba(255,255,255,0.8)_inset,0_1px_3px_rgba(0,0,0,0.05)] relative overflow-hidden transition-all duration-300 group-active:scale-95 group-active:bg-[#4A403A]/25">
           <motion.div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full" animate={{ translateX: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", repeatDelay: 0.5 }} />
          </div>
         </div>

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
           disabled={!tempAddress || !house}
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
              {CITIES.map(c => (
               <button key={c} onClick={() => { setSelectedCity(c); setTempAddress(''); clearSuggestions(); setSelectedCoords(null); setShowCityDropdown(false) }} className={cn('w-full text-left px-5 py-3.5 text-[15px] font-bold border-b last:border-0 border-gray-50', selectedCity === c ? 'bg-gray-50' : 'hover:bg-gray-50')}>{c}</button>
              ))}
             </div>
            )}
           </div>

           <div className="relative z-40">
            {/* Smart-parse hint moved ABOVE search box so it is never covered by dropdown */}
            {(house || corpus || apartment) && (
             <div className="mb-2 flex flex-wrap gap-1.5 px-1">
              {house && (
               <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#CF8F73]/10 text-[#CF8F73] text-[11px] font-bold rounded-full border border-[#CF8F73]/20">
                <span className="opacity-60">дом</span> {house}
               </span>
              )}
              {corpus && (
               <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#CF8F73]/10 text-[#CF8F73] text-[11px] font-bold rounded-full border border-[#CF8F73]/20">
                <span className="opacity-60">корп.</span> {corpus}
               </span>
              )}
              {apartment && (
               <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#CF8F73]/10 text-[#CF8F73] text-[11px] font-bold rounded-full border border-[#CF8F73]/20">
                <span className="opacity-60">кв.</span> {apartment}
               </span>
              )}
              {entrance && (
               <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#CF8F73]/10 text-[#CF8F73] text-[11px] font-bold rounded-full border border-[#CF8F73]/20">
                <span className="opacity-60">подъезд</span> {entrance}
               </span>
              )}
              {floor && (
               <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#CF8F73]/10 text-[#CF8F73] text-[11px] font-bold rounded-full border border-[#CF8F73]/20">
                <span className="opacity-60">эт.</span> {floor}
               </span>
              )}
             </div>
            )}

            <AddressSearchBox
             query={tempAddress}
             onQueryChange={(q) => {
              setTempAddress(q);

              // Always parse — this syncs fields both ways:
              // typing adds values, backspacing clears them
              const parsed = parseRussianAddress(q);
              setHouse(parsed.house || '');
              setCorpus(parsed.corpus || '');
              setEntrance(parsed.entrance || '');
              setFloor(parsed.floor || '');
              setApartment(parsed.apartment || '');

              // Send a clean query to geocoder (street + house only, no кв/под/эт)
              const cleanQ = parsed.road
               ? parsed.house ? `${parsed.road}, ${parsed.house}` : parsed.road
               : q;
              if (cleanQ.trim().length >= 2) debouncedSearch(cleanQ);
              else clearSuggestions();
             }}
             onSelect={(item) => {
              const entity = entityFromSuggestion(item);
              // Parse what user typed BEFORE we overwrite (using q captured in closure)
              const typed = parseRussianAddress(tempAddress);
              setTempAddress(entity.road || typed.road || '');
              // Geocoder house wins; fall back to what user typed
              setHouse(entity.house || typed.house || '');
              setCorpus(typed.corpus || '');
              setEntrance(typed.entrance || '');
              setFloor(typed.floor || '');
              setApartment(typed.apartment || '');
              if (entity.coords) setSelectedCoords(entity.coords);
              clearSuggestions();
              setIsEditingAddress(false);
             }}
             onClear={() => { setTempAddress(''); setHouse(''); setCorpus(''); setEntrance(''); setFloor(''); setApartment(''); clearSuggestions(); }}
             suggestions={suggestions}
             history={history}
             onClearHistory={onHistoryCleared}
             isLoading={isLoadingSuggestions}
             placeholder="Улица и дом"
            />
           </div>

           <div className="flex flex-col gap-3 mt-1 pb-4">
            {/* Row 1: Дом + Корпус */}
            <div className="flex gap-3">
             <div className={cn(
              "flex-1 rounded-[1.2rem] px-5 py-3.5 border transition-all duration-200",
              house
               ? "bg-[#CF8F73]/5 border-[#CF8F73]/30 focus-within:border-[#CF8F73]/50"
               : "bg-[#F8F8F8] border-transparent focus-within:border-gray-300"
             )}>
              <span className={cn(
               "block text-[10px] font-bold uppercase tracking-widest mb-1",
               house ? "text-[#CF8F73]/70" : "text-gray-400"
              )}>Дом *</span>
              <input
               type="text"
               value={house}
               onChange={(e) => setHouse(e.target.value)}
               placeholder="1"
               className="w-full bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] placeholder:text-gray-300"
              />
             </div>
             <div className={cn(
              "flex-1 rounded-[1.2rem] px-5 py-3.5 border transition-all duration-200",
              corpus
               ? "bg-[#CF8F73]/5 border-[#CF8F73]/30 focus-within:border-[#CF8F73]/50"
               : "bg-[#F8F8F8] border-transparent focus-within:border-gray-300"
             )}>
              <span className={cn(
               "block text-[10px] font-bold uppercase tracking-widest mb-1",
               corpus ? "text-[#CF8F73]/70" : "text-gray-400"
              )}>Корпус</span>
              <input
               type="text"
               value={corpus}
               onChange={(e) => setCorpus(e.target.value)}
               placeholder="А"
               className="w-full bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] placeholder:text-gray-300"
              />
             </div>
            </div>
            {/* Row 2: Подъезд + Этаж + Кв */}
            <div className="flex gap-3">
             <div className={cn(
              "flex-1 rounded-[1.2rem] px-4 py-3.5 border transition-all duration-200",
              entrance
               ? "bg-[#CF8F73]/5 border-[#CF8F73]/30 focus-within:border-[#CF8F73]/50"
               : "bg-[#F8F8F8] border-transparent focus-within:border-gray-300"
             )}>
              <span className={cn(
               "block text-[10px] font-bold uppercase tracking-widest mb-1",
               entrance ? "text-[#CF8F73]/70" : "text-gray-400"
              )}>Подъезд</span>
              <input
               type="text"
               value={entrance}
               onChange={(e) => setEntrance(e.target.value)}
               placeholder="1"
               className="w-full bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] placeholder:text-gray-300"
              />
             </div>
             <div className={cn(
              "flex-[0.8] rounded-[1.2rem] px-4 py-3.5 border transition-all duration-200",
              floor
               ? "bg-[#CF8F73]/5 border-[#CF8F73]/30 focus-within:border-[#CF8F73]/50"
               : "bg-[#F8F8F8] border-transparent focus-within:border-gray-300"
             )}>
              <span className={cn(
               "block text-[10px] font-bold uppercase tracking-widest mb-1",
               floor ? "text-[#CF8F73]/70" : "text-gray-400"
              )}>Этаж</span>
              <input
               type="text"
               value={floor}
               onChange={(e) => setFloor(e.target.value)}
               placeholder="0"
               className="w-full bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] placeholder:text-gray-300"
              />
             </div>
             <div className={cn(
              "flex-1 rounded-[1.2rem] px-4 py-3.5 border transition-all duration-200",
              apartment
               ? "bg-[#CF8F73]/5 border-[#CF8F73]/30 focus-within:border-[#CF8F73]/50"
               : "bg-[#F8F8F8] border-transparent focus-within:border-gray-300"
             )}>
              <span className={cn(
               "block text-[10px] font-bold uppercase tracking-widest mb-1",
               apartment ? "text-[#CF8F73]/70" : "text-gray-400"
              )}>Кв.</span>
              <input
               type="text"
               value={apartment}
               onChange={(e) => setApartment(e.target.value)}
               placeholder="10"
               className="w-full bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] placeholder:text-gray-300"
              />
             </div>
            </div>
           </div>
          </div>

          <div className="mt-auto shrink-0 sticky bottom-0 bg-white pt-4 pb-[calc(3.5rem+env(safe-area-inset-bottom))] sm:pb-0 z-50 border-t border-gray-100/80 -mx-6 px-6 sm:mx-0 sm:px-0 shadow-[0_-20px_50px_rgba(0,0,0,0.06)]">
           <button
            onClick={handleSaveDelivery}
            disabled={!tempAddress || !house}
            className="w-full h-[64px] sm:h-[72px] bg-[#CF8F73] disabled:bg-[#CF8F73]/40 text-white rounded-[1.8rem] font-black text-[18px] sm:text-[20px] transition-all active:scale-95 shadow-xl shadow-[#CF8F73]/20"
           >
            {isEditingAddress ? 'Готово' : 'Всё верно'}
           </button>
          </div>
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
