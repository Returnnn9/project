import React, { useState, useEffect, useCallback, useRef } from "react"
import { useUIStore, useCartStore, useUserStore, useStoreData, useRootStore } from "@/store/hooks"
import { X, ChevronRight, ChevronDown, Truck, MapPin, ArrowLeft, User, Phone, CheckCircle2, XCircle, Loader2, Edit3, CreditCard, Navigation } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import MapPicker from "./MapPicker"
import { cn } from "@/lib/utils"
import { useAddressSearch } from "@/hooks/useAddressSearch"
import { PickupPoint, CityKey } from "@/lib/types/address"
import { PICKUP_POINTS, CITY_COORDS } from "@/lib/constants/delivery"
import DeliveryTypeSelector from "./DeliveryTypeSelector"
import { parseAddress, formatAddress, extractFromQuery } from "@/lib/address"
import { normalizePhone } from "@/lib/phone"
import { containerVariants, itemVariants, stepVariants } from "@/lib/motion-variants"

type DeliveryType = "delivery" | "pickup" | null

export default function CheckoutModal() {
 const uiStore = useUIStore()
 const userStore = useUserStore()
 const rootStore = useRootStore()

 const isCheckoutOpen = useStoreData(uiStore, s => s.getIsCheckoutOpen())
 const address = useStoreData(userStore, s => s.getAddress())
 const userName = useStoreData(userStore, s => s.getUserName())
 const userPhone = useStoreData(userStore, s => s.getUserPhone())

 const setCheckoutOpen = (o: boolean) => uiStore.setCheckoutOpen(o)
 const setUserName = (n: string) => userStore.setUserName(n)
 const setUserPhone = (p: string) => userStore.setUserPhone(p)
 const updateAddress = (a: string, t: "delivery" | "pickup") => userStore.updateAddress(a, t)
 const checkout = () => rootStore.checkout()
 const { data: session, status } = useSession()

 const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1)
 const [deliveryType, setDeliveryType] = useState<DeliveryType>(null)
 const [paymentMethod, setPaymentMethod] = useState<'sbp' | 'card' | null>(null)
 const [cardNumber, setCardNumber] = useState('')
 const [cardExpiry, setCardExpiry] = useState('')
 const [cardCVC, setCardCVC] = useState('')
 const [tempAddress, setTempAddress] = useState(address)
 const [selectedPickup, setSelectedPickup] = useState<PickupPoint | null>(null)
 const [mapError, setMapError] = useState<string | null>(null)
 const [selectedCity, setSelectedCity] = useState<CityKey>('Москва')
 const [showCityDropdown, setShowCityDropdown] = useState(false)
 const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null)
 const [acceptNews, setAcceptNews] = useState(true)

 // Mobile WOW adaptive states
 const [isEditingAddress, setIsEditingAddress] = useState(false)
 const [isMobile, setIsMobile] = useState(false)

 useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 640)
  check()
  window.addEventListener('resize', check)
  return () => window.removeEventListener('resize', check)
 }, [])

 // Expanded address fields
 const [house, setHouse] = useState('')
 const [corpus, setCorpus] = useState('')
 const [entrance, setEntrance] = useState('')
 const [floor, setFloor] = useState('')
 const [apartment, setApartment] = useState('')

 const phoneInputRef = useRef<HTMLInputElement>(null)

 // Auto-focus phone number in Step 1
 useEffect(() => {
  if (isCheckoutOpen && step === 1 && phoneInputRef.current) {
   setTimeout(() => {
    phoneInputRef.current?.focus()
   }, 400) // Delay to wait for modal transition
  }
 }, [isCheckoutOpen, step])

 // Address search hook
 const {
  suggestions,
  setSuggestions,
  clearSuggestions,
  isLoading: isLoadingSuggestions,
  isLocating,
  skipNextFetch,
  debouncedSearch,
  geolocate,
 } = useAddressSearch(selectedCity);



 const reset = useCallback(() => {
  setStep(1)
  setDeliveryType(null)
  setPaymentMethod(null)
  setCardNumber('')
  setCardExpiry('')
  setCardCVC('')
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

 const handleGeolocate = () => {
  geolocate((addr, coords, matchedCity) => {
   if (matchedCity) setSelectedCity(matchedCity);
   setTempAddress(addr);
   setSelectedCoords(coords);
  });
 }

 const handleClose = () => {
  setCheckoutOpen(false)
  setTimeout(reset, 400)
 }

 const handleNextFromDelivery = () => {
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
   setStep(5)
  }
 }

 const handleNextFromPickup = () => {
  if (selectedPickup) {
   updateAddress(`${selectedPickup.city}, ${selectedPickup.address}`, "pickup")
   setStep(5)
  }
 }

 const formatCardNumber = (val: string) => {
  const digits = val.replace(/\D/g, '').substring(0, 16)
  const groups = digits.match(/.{1,4}/g) || []
  return groups.join(' ')
 }

 const formatExpiry = (val: string) => {
  const digits = val.replace(/\D/g, '').substring(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`
 }

 const isCardValid = cardNumber.replace(/\D/g, '').length === 16 &&
  cardExpiry.length === 5 &&
  cardCVC.length === 3

 const handleFinalCheckout = async () => {
  const success = await checkout()
  if (success) {
   setStep(6)
   setTimeout(() => {
    handleClose()
   }, 3500)
  }
 }

 // Stabilized callbacks for MapPicker
 const onAddressSelect = useCallback((val: string) => {
  skipNextFetch.current = true;
  setTempAddress(val);
 }, [skipNextFetch]);

 const onAddressDetailsSelect = useCallback((details: import('./MapPicker').AddressDetails) => {
  skipNextFetch.current = true;

  // Handle potential city match from geocoding
  if (details.city) {
   const matchedCity = details.city.includes('Санкт-Петербург') ? 'Санкт-Петербург' :
    details.city.includes('Москва') ? 'Москва' : null;
   if (matchedCity) setSelectedCity(matchedCity);
  }

  let road = details.road || details.full.split(',')[0];
  const houseFromApi = details.house || '';

  // If road is just the city name, get a more specific part
  if (road === selectedCity || road === 'Москва' || road === 'Санкт-Петербург') {
   const parts = details.full.split(',').map((p: string) => p.trim());
   const streetPart = parts.find((p: string) => p !== selectedCity && p !== 'Москва' && p !== 'Санкт-Петербург');
   if (streetPart) road = streetPart;
  }

  const displayAddr = houseFromApi ? `${road}, ${houseFromApi}` : road;
  // Strip city name from the start (fixed regex: single backslash)
  const cleanAddr = displayAddr
   .replace(new RegExp(`^${selectedCity},?\\s*`, 'i'), '')
   .replace(/^Москва,?\s*/i, '')
   .replace(/^Санкт-Петербург,?\s*/i, '')
   .trim();

  const extracted = extractFromQuery(tempAddress, houseFromApi);

  setTempAddress(cleanAddr);
  setHouse(extracted.house);
  setCorpus(extracted.corpus);
  if (extracted.entrance) setEntrance(extracted.entrance);
  if (extracted.floor) setFloor(extracted.floor);
  if (extracted.apartment) setApartment(extracted.apartment);

  if (details.coords) {
   setSelectedCoords(details.coords);
  }
 }, [selectedCity, skipNextFetch]);

 if (!isCheckoutOpen) return null

 const LeftPanel = ({ icon, text }: { icon: React.ReactNode, text: React.ReactNode }) => (
  <div className="hidden sm:flex flex-shrink-0 bg-[#F8F8F8] border-r border-gray-100 flex-col items-center justify-center gap-6
					w-[200px] md:w-[280px]
					py-10 px-6">
   <div className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
    {mapError && step === 2 ? (
     <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
      <XCircle className="w-9 h-9 text-red-400" />
     </div>
    ) : icon}
   </div>
   <p className={cn(
    "text-center text-[14px] sm:text-[15px] font-[800] leading-relaxed px-2",
    mapError && step === 2 ? "text-red-500/80" : "text-[#3A332E]"
   )}>
    {mapError && step === 2 ? mapError : text}
   </p>
   {step > 1 && step < 6 && (
    <button
     onClick={() => setStep((step - 1) as 1 | 2 | 3 | 4 | 5 | 6)}
     className="flex items-center gap-2 text-[12px] font-bold text-[#3A332E]/40 hover:text-[#3A332E] transition-colors mt-2"
    >
     <ArrowLeft className="w-3.5 h-3.5" /> Назад
    </button>
   )}
  </div>
 )

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
     className="relative z-10 bg-white sm:bg-white/95 sm:backdrop-blur-[20px] rounded-t-[2rem] sm:rounded-[3rem] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] sm:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden flex w-full max-w-[1280px] h-[95vh] sm:h-full font-manrope sm:border-l sm:border-white/20 mt-auto sm:mt-0"
    >
     <button onClick={handleClose} className="absolute top-6 right-6 z-50 p-2.5 bg-gray-50/80 backdrop-blur-md rounded-full text-[#3A332E] hover:bg-gray-100 transition-colors sm:hidden shadow-sm">
      <X className="w-5 h-5" />
     </button>

     {step > 1 && step < 6 && (!isEditingAddress) && (
      <button
       onClick={() => {
        if (isEditingAddress) {
         setIsEditingAddress(false);
         return;
        }
        setStep((step - 1) as 1 | 2 | 3 | 4 | 5 | 6);
       }}
       className="absolute top-6 left-6 z-50 p-2.5 bg-gray-50/80 backdrop-blur-md rounded-full text-[#3A332E] hover:bg-gray-100 transition-colors sm:hidden shadow-sm"
      >
       <ArrowLeft className="w-5 h-5" />
      </button>
     )}

     <AnimatePresence mode="wait">

      {step === 1 && (
       <motion.div
        key="step1-guest"
        variants={stepVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex h-full w-full"
       >
        <div className="flex-1 p-6 sm:p-12 flex flex-col justify-center max-w-xl mx-auto">
         <h2 className="text-[24px] sm:text-[28px] font-extrabold text-[#3A332E] mb-8 tracking-tight">
          Как к вам обращаться?
         </h2>
         <div className="space-y-4">
          <div className="bg-[#F8F8F8] rounded-[1.2rem] px-6 py-4 border border-transparent focus-within:border-gray-300 transition-colors">
           <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Телефон</span>
           <input
            ref={phoneInputRef}
            type="tel"
            value={userPhone}
            onChange={(e) => setUserPhone(e.target.value)}
            placeholder="+7 (999) 000-00-00"
            className="bg-transparent border-none outline-none text-[16px] font-bold text-[#3A332E] placeholder:text-gray-300 w-full"
           />
          </div>
          <div className="bg-[#F8F8F8] rounded-[1.2rem] px-6 py-4 border border-transparent focus-within:border-gray-300 transition-colors">
           <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Имя</span>
           <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Иван"
            className="bg-transparent border-none outline-none text-[16px] font-bold text-[#3A332E] placeholder:text-gray-300 w-full"
           />
          </div>
         </div>
         <div className="flex items-start gap-3 mt-4">
          <button
           type="button"
           onClick={() => setAcceptNews(!acceptNews)}
           className={`w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-all ${acceptNews ? "bg-[#CF8F73] border-[#CF8F73] shadow-sm shadow-[#CF8F73]/20" : "bg-white border-gray-200"
            }`}
          >
           {acceptNews && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          </button>
          <p className="text-[13px] font-medium text-[#3A332E]/60 leading-snug">
           Соглашаюсь получать новости и специальные предложения
          </p>
         </div>

         <button
          onClick={() => setStep(2)}
          disabled={!userName || !normalizePhone(userPhone)}
          className="mt-8 w-full h-[64px] bg-[#CF8F73] disabled:bg-[#CF8F73]/40 text-white rounded-[1.2rem] font-[800] text-[18px] hover:bg-[#b87a60] transition-all active:scale-95 shadow-xl shadow-[#CF8F73]/20"
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
       </motion.div>
      )}

      {/* ───── STEP 2: Способ получения ───── */}
      {step === 2 && (
       <motion.div
        key="step2-method"
        variants={stepVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col sm:flex-row h-full w-full flex-1"
       >
        <div className="flex-1 p-5 sm:p-10 flex flex-col justify-center overflow-y-auto min-h-0 w-full">
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
             setStep(4);
            }
           }} />
         </div>
        </div>
       </motion.div>
      )}

      {/* ───── STEP 3: Saved Addresses (Delivery) ───── */}
      {step === 3 && deliveryType === "delivery" && (
       <motion.div
        key="step3-saved"
        variants={stepVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col h-full w-full p-6 sm:p-12 flex-1"
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
             setStep(5)
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

      {/* ───── STEP 4: Delivery ───── */}
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
         <div className="w-full h-full sm:rounded-[1.5rem] overflow-hidden sm:border border-gray-100 shadow-inner relative">
          <MapPicker
           hideSearch={true}
           showGeolocate={deliveryType === "delivery"}
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
          if (offset.y > 100 || velocity.y > 500) {
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
          "absolute bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:w-[50%] bg-white sm:bg-transparent z-10 flex flex-col rounded-t-[2.5rem] sm:rounded-none shadow-[0_-12px_40px_rgba(0,0,0,0.12)] sm:shadow-none overflow-y-auto sm:overflow-y-auto no-scrollbar touch-pan-y",
          isEditingAddress ? "max-h-[85vh] sm:h-full px-4 pt-6 sm:p-10" : "px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-6 sm:h-full sm:p-10"
         )}
         transition={{ type: "spring" as const, damping: 28, stiffness: 220 }}
        >
         {/* Drag Handle for Mobile */}
         <div className="w-12 h-1.5 bg-gray-200/50 rounded-full mx-auto mb-4 sm:hidden shrink-0 cursor-grab active:cursor-grabbing" />

         {/* Mobile Compact View */}
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
           <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 text-[#3A332E]">
             <Edit3 className="w-4 h-4" />
            </div>
           </div>
          </motion.div>
          <button
           onClick={handleNextFromDelivery}
           disabled={!tempAddress || !house || !entrance || !apartment}
           className="w-full h-[68px] bg-[#CF8F73] disabled:bg-[#CF8F73]/40 text-white rounded-[1.5rem] font-[900] text-[19px] hover:bg-[#b87a60] transition-all active:scale-95 shadow-xl shadow-[#CF8F73]/20 mt-1"
          >
           Всё верно
          </button>
         </div>

         {/* Expanded / Desktop View */}
         <div className={cn("flex-col h-full", isEditingAddress ? "flex" : "hidden sm:flex")}>
          <div className="flex items-center gap-4 mb-6 sm:mb-8 shrink-0">
           <button
            onClick={() => {
             if (window.innerWidth < 640 && isEditingAddress) {
              setIsEditingAddress(false);
             } else if (userStore.getSavedAddresses().length > 0) {
              setStep(3);
             } else {
              setStep(2);
             }
            }}
            className="p-1 text-[#3A332E] hover:text-[#2A2420] transition-colors"
           >
            <ArrowLeft className="w-6 h-6" />
           </button>
           <h2 className="text-[20px] sm:text-[24px] font-extrabold text-[#3A332E] tracking-tight">
             {isEditingAddress && isMobile ? 'Детали адреса' : 'Введите адрес'}
           </h2>
          </div>

          <motion.div className="flex-1 overflow-y-auto no-scrollbar pb-6 mt-4 space-y-4">
           <div className="relative">
            <div
             className="bg-[#F8F8F8] rounded-[1.2rem] px-5 py-4 cursor-pointer select-none border border-transparent hover:border-gray-200 transition-colors"
             onClick={() => setShowCityDropdown(v => !v)}
            >
             <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">Город</span>
             <div className="flex items-center justify-between text-[#3A332E]">
              <span className="text-[17px] font-extrabold">{selectedCity}</span>
              <ChevronDown className={cn("w-5 h-5 transition-transform duration-300", showCityDropdown && "rotate-180")} />
             </div>
            </div>
            {showCityDropdown && (
             <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-[1.2rem] shadow-[0_16px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50">
              {(['Москва', 'Санкт-Петербург'] as const).map(c => (
               <button
                key={c}
                onClick={() => { setSelectedCity(c); setTempAddress(''); setSuggestions([]); setSelectedCoords(null); setShowCityDropdown(false) }}
                className={cn(
                 'w-full text-left px-5 py-3.5 text-[15px] font-bold transition-colors border-b last:border-0 border-gray-50',
                 selectedCity === c ? 'text-[#3A332E] bg-gray-50' : 'text-[#3A332E] hover:bg-gray-50'
                )}
               >
                {c}
               </button>
              ))}
             </div>
            )}
           </div>

           <div className="relative">
            <div className="bg-[#F8F8F8] rounded-[1.2rem] px-5 py-4 flex flex-col justify-center border border-transparent focus-within:border-gray-300 transition-all">
             <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">Улица и дом</span>
             <div className="flex items-center gap-2">
              <input
               type="text"
               value={tempAddress}
               onChange={(e) => {
                setTempAddress(e.target.value)
                debouncedSearch(e.target.value)
               }}
               placeholder="Введите адрес"
               className="w-full bg-transparent border-none outline-none text-[17px] font-extrabold text-[#3A332E] placeholder:text-[#3A332E]/30"
              />
              {isLoadingSuggestions && <Loader2 className="w-4 h-4 animate-spin text-[#3A332E] flex-shrink-0" />}
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
              className="mt-2 bg-white rounded-[1.2rem] shadow-[0_16px_48px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden max-h-[340px] overflow-y-auto no-scrollbar relative sm:absolute w-full left-0 py-1.5 z-50"
             >
              {suggestions.map((s, idx) => {
               const title = s.address?.title || s.display_name;
               const subtitle = s.address?.subtitle || selectedCity;
               const road = s.address?.road || title;
               const houseNum = s.address?.house_number || "";

               return (
                <button
                 key={idx}
                 onClick={() => {
                  skipNextFetch.current = true;
                  const extracted = extractFromQuery(tempAddress, houseNum);

                  setTempAddress(road);
                  setHouse(extracted.house);
                  setCorpus(extracted.corpus);
                  if (extracted.entrance) setEntrance(extracted.entrance);
                  if (extracted.floor) setFloor(extracted.floor);
                  if (extracted.apartment) setApartment(extracted.apartment);

                  if (s.lat && s.lon) {
                   setSelectedCoords([parseFloat(s.lat), parseFloat(s.lon)]);
                  }
                  setSuggestions([]);
                  setIsEditingAddress(false);
                 }}
                 className="w-full text-left px-5 py-4 flex flex-row items-center gap-4 group hover:bg-[#F8F9FA] transition-colors border-b border-gray-50 last:border-0"
                >
                 <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#CF8F73]/10 group-hover:text-[#CF8F73] transition-colors shrink-0">
                  <Navigation className="w-5 h-5" />
                 </div>
                 <div className="flex flex-col min-w-0">
                  <span className="text-[15px] sm:text-[17px] font-[800] text-[#333333] leading-tight group-hover:text-[#3A332E] transition-colors truncate">{title}</span>
                  <span className="text-[12px] font-[600] text-[#999999] mt-0.5 uppercase tracking-wider">{subtitle}</span>
                 </div>
                </button>
               );
              })}
             </motion.div>
            )}
           </div>

           <div className="flex flex-col gap-4 mt-2 mb-2 pb-4">
            <div className="flex gap-4">
             <div className="flex-1 bg-[#F8F8F8] rounded-[1.2rem] px-5 py-3 focus-within:border-gray-300 border border-transparent transition-all">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Дом *</span>
              <input type="text" value={house} onChange={(e) => setHouse(e.target.value)} placeholder="1" className="w-full bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] placeholder:text-gray-300" />
             </div>
             <div className="flex-1 bg-[#F8F8F8] rounded-[1.2rem] px-5 py-3 focus-within:border-gray-300 border border-transparent transition-all">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Корпус</span>
              <input type="text" value={corpus} onChange={(e) => setCorpus(e.target.value)} placeholder="А" className="w-full bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] placeholder:text-gray-300" />
             </div>
            </div>
            <div className="flex gap-3">
             <div className="flex-1 bg-[#F8F8F8] rounded-[1.2rem] px-4 py-3 focus-within:border-gray-300 border border-transparent transition-all">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Подъезд *</span>
              <input type="text" value={entrance} onChange={(e) => setEntrance(e.target.value)} placeholder="1" className="w-full bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] placeholder:text-gray-300" />
             </div>
             <div className="flex-[0.8] bg-[#F8F8F8] rounded-[1.2rem] px-4 py-3 focus-within:border-gray-300 border border-transparent transition-all">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Этаж</span>
              <input type="text" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="0" className="w-full bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] placeholder:text-gray-300" />
             </div>
             <div className="flex-1 bg-[#F8F8F8] rounded-[1.2rem] px-4 py-3 focus-within:border-gray-300 border border-transparent transition-all">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Кв. *</span>
              <input type="text" value={apartment} onChange={(e) => setApartment(e.target.value)} placeholder="10" className="w-full bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] placeholder:text-gray-300" />
             </div>
            </div>
           </div>

          </motion.div>

          <button
           onClick={() => {
            if (window.innerWidth < 640 && isEditingAddress) {
             setIsEditingAddress(false);
            } else {
             handleNextFromDelivery();
            }
           }}
           disabled={!tempAddress || !house || !entrance || !apartment}
           className="mt-4 sm:mt-auto w-full h-[64px] sm:h-[72px] bg-[#CF8F73] disabled:bg-[#CF8F73]/40 text-white rounded-[1.2rem] font-[800] text-[18px] sm:text-[20px] hover:bg-[#b87a60] transition-all shadow-xl shadow-[#CF8F73]/20 active:scale-95 mb-[calc(1rem+env(safe-area-inset-bottom))] sm:mb-0"
          >
           {isEditingAddress && isMobile ? 'Готово' : 'Всё верно'}
          </button>
         </div>
        </motion.div>
       </motion.div>
      )}

      {/* ───── STEP 4: Pickup ───── */}
      {step === 4 && deliveryType === "pickup" && (
       <motion.div
        key="step4-pickup"
        variants={stepVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col sm:flex-row h-full w-full relative flex-1"
       >
        <div className="absolute inset-0 sm:relative sm:inset-auto sm:w-[50%] sm:h-full p-0 sm:p-6 sm:pb-6 z-0">
         <div className="w-full h-full sm:rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-inner relative">
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
         dragElastic={0.08}
         onDragEnd={(e, { offset, velocity }) => {
          if (offset.y > 100 || velocity.y > 500) {
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
          "absolute bottom-0 left-0 right-0 sm:relative sm:bottom-auto bg-white sm:bg-transparent z-10 flex flex-col sm:flex-1 rounded-t-[2.5rem] sm:rounded-none shadow-[0_-12px_40px_rgba(0,0,0,0.12)] sm:shadow-none overflow-hidden sm:overflow-y-auto no-scrollbar touch-pan-y",
          isEditingAddress ? "max-h-[85vh] sm:h-full px-4 pt-6 sm:px-10 sm:py-10" : "px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-6 sm:h-full sm:px-10 sm:py-10"
         )}
         transition={{ type: "spring" as const, damping: 28, stiffness: 220 }}
        >
         {/* Drag Handle for Mobile */}
         <div className="w-12 h-1.5 bg-gray-200/50 rounded-full mx-auto mb-4 sm:hidden shrink-0 cursor-grab active:cursor-grabbing" />

         {/* Mobile Compact View */}
         <div className={cn("sm:hidden flex flex-col gap-4", isEditingAddress ? "hidden" : "flex")}>
          <motion.div
           whileHover={{ scale: 1.01 }}
           whileTap={{ scale: 0.98 }}
           onClick={() => setIsEditingAddress(true)}
           onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsEditingAddress(true); }}
           role="button"
           tabIndex={0}
           className="w-full p-5 bg-[#F8F8F8] rounded-[1.5rem] border border-gray-100 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#3A332E]/20"
          >
           <div className="flex flex-col gap-1 overflow-hidden pr-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Пункт выдачи</span>
            <span className="text-[16px] font-extrabold text-[#3A332E] truncate">
             {selectedPickup ? selectedPickup.address : "Выберите пункт или на карте"}
            </span>
           </div>
           <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 text-[#3A332E]">
             <Edit3 className="w-4 h-4" />
            </div>
           </div>
          </motion.div>
          <button
           onClick={handleNextFromPickup}
           disabled={!selectedPickup}
           className="w-full h-[68px] bg-[#CF8F73] disabled:bg-[#CF8F73]/40 text-white rounded-[1.5rem] font-[900] text-[19px] hover:bg-[#b87a60] transition-all active:scale-95 shadow-xl shadow-[#CF8F73]/20 mt-1"
          >
           Всё верно
          </button>
         </div>

         {/* Expanded / Desktop View */}
         <div className={cn("flex-col h-full", isEditingAddress ? "flex" : "hidden sm:flex")}>
          <div className="flex items-center justify-between mb-5 sm:mb-8 shrink-0">
           <div className="flex items-center gap-4">
            <button
             onClick={() => {
              if (window.innerWidth < 640 && isEditingAddress) {
               setIsEditingAddress(false);
              } else {
               setStep(2);
              }
             }}
             className="p-1 text-gray-400 hover:text-[#3A332E] transition-colors"
            >
             <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-[22px] sm:text-[24px] font-extrabold text-[#3A332E] tracking-tight">
             Точка самовывоза
            </h2>
           </div>
           <button
            onClick={handleClose}
            className="hidden sm:block p-1 text-gray-400 hover:text-[#3A332E] transition-colors"
           >
            <X className="w-6 h-6" />
           </button>
          </div>

          <div className="relative mb-6">
           <div
            className="bg-[#F8F8F8] rounded-[1.2rem] px-5 py-4 cursor-pointer select-none border border-transparent hover:border-gray-200 transition-colors"
            onClick={() => setShowCityDropdown(v => !v)}
           >
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-0.5">Город</span>
            <div className="flex items-center justify-between">
             <span className="text-[15px] font-extrabold text-[#3A332E]">{selectedCity}</span>
             <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform duration-200', showCityDropdown && 'rotate-180')} />
            </div>
           </div>
           {showCityDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-[1.2rem] shadow-[0_16px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50">
             {(['Москва', 'Санкт-Петербург'] as const).map(c => (
              <button
               key={c}
               onClick={() => { setSelectedCity(c); setSelectedPickup(null); setShowCityDropdown(false) }}
               className={cn(
                'w-full text-left px-5 py-3.5 text-[15px] font-bold transition-colors border-b last:border-0 border-gray-50',
                selectedCity === c ? 'text-[#3A332E] bg-gray-50' : 'text-[#3A332E] hover:bg-gray-50'
               )}
              >
               {c}
              </button>
             ))}
            </div>
           )}
          </div>

          <motion.div
           variants={containerVariants}
           initial="hidden"
           animate="visible"
           className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1 no-scrollbar pb-4"
          >
           <AnimatePresence mode="popLayout">
            {PICKUP_POINTS.filter(p => p.city === selectedCity).map((p) => (
             <motion.button
              key={p.address}
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              layout
              onClick={() => setSelectedPickup(p)}
              className={cn(
               "w-full px-6 py-4 rounded-[1.8rem] border transition-all flex items-center justify-between group",
               selectedPickup?.address === p.address
                ? "border-[#CF8F73] bg-[#CF8F73] shadow-[0_8px_20px_rgba(207,141,114,0.2)]"
                : "border-gray-100 bg-white hover:border-gray-300"
              )}
             >
              <div className="flex flex-col items-start min-w-0 pr-4">
               <span className={cn(
                "text-[16px] font-[800] transition-colors truncate w-full text-left",
                selectedPickup?.address === p.address ? "text-white" : "text-[#3A332E]"
               )}>
                {p.address}
               </span>
               <span className={cn(
                "text-[12px] font-bold uppercase tracking-widest mt-1",
                selectedPickup?.address === p.address ? "text-white/70" : "text-gray-400"
               )}>Пункт выдачи</span>
              </div>
              <div className={cn(
               "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors px-0.5 shrink-0",
               selectedPickup?.address === p.address ? "border-white" : "border-gray-200 group-hover:border-gray-300"
              )}>
               <div className={cn(
                "w-2.5 h-2.5 rounded-full bg-white transition-all duration-300",
                selectedPickup?.address === p.address ? "scale-100 opacity-100" : "scale-0 opacity-0"
               )} />
              </div>
             </motion.button>
            ))}
           </AnimatePresence>
          </motion.div>

          <button
           onClick={() => {
            if (window.innerWidth < 640 && isEditingAddress) {
             setIsEditingAddress(false);
            } else {
             handleNextFromPickup();
            }
           }}
           disabled={!selectedPickup}
           className="mt-6 w-full h-[64px] sm:h-[72px] bg-[#CF8F73] disabled:bg-[#CF8F73]/40 text-white rounded-[1.5rem] font-[900] text-[18px] sm:text-[20px] hover:bg-[#b87a60] transition-all active:scale-95 shadow-xl shadow-[#CF8F73]/20 shrink-0 mb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:mb-0"
          >
           {isEditingAddress && isMobile ? 'Готово' : 'Всё верно'}
          </button>
         </div>
        </motion.div>
       </motion.div>
      )}

      {/* ───── STEP 5: Payment ───── */}
      {step === 5 && (
       <motion.div
        key="step5-pay"
        variants={stepVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex h-full w-full"
       >
        <div className="flex-1 p-6 sm:p-12 flex flex-col justify-center max-w-xl mx-auto">
         <h2 className="text-[24px] sm:text-[28px] font-extrabold text-[#3A332E] mb-8 tracking-tight">
          Оплата заказа
         </h2>

         <div className="space-y-4">
          <motion.button
           whileHover={{ scale: 1.01 }}
           whileTap={{ scale: 0.98 }}
           onClick={() => setPaymentMethod('sbp')}
           className={cn(
            "w-full p-6 rounded-[1.8rem] border-2 transition-all flex items-center justify-between group",
            paymentMethod === 'sbp' ? "border-[#CF8F73] bg-[#CF8F73]/5" : "border-gray-100 hover:border-gray-200"
           )}
          >
           <div className="flex items-center gap-4">
            <div className="w-12 h-8 rounded-md bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 flex items-center justify-center shadow-sm">
             <span className="text-white font-extrabold text-[12px] tracking-wider">СБП</span>
            </div>
            <span className="font-extrabold text-[#3A332E] text-[17px]">Оплата через СБП</span>
           </div>
           <div className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors px-0.5",
            paymentMethod === 'sbp' ? "border-[#CF8F73]" : "border-gray-200"
           )}>
            <div className={cn(
             "w-2.5 h-2.5 rounded-full bg-[#CF8F73] transition-all",
             paymentMethod === 'sbp' ? "scale-100 opacity-100" : "scale-0 opacity-0"
            )} />
           </div>
          </motion.button>

          <motion.button
           whileHover={{ scale: 1.01 }}
           whileTap={{ scale: 0.98 }}
           onClick={() => setPaymentMethod('card')}
           className={cn(
            "w-full p-6 rounded-[1.8rem] border-2 transition-all flex items-center justify-between group",
            paymentMethod === 'card' ? "border-[#CF8F73] bg-[#CF8F73]/5" : "border-gray-100 hover:border-gray-200"
           )}
          >
           <div className="flex items-center gap-4">
            <div className="w-12 h-8 rounded-md bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center shadow-sm">
             <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-[#3A332E] text-[17px]">Банковской картой</span>
           </div>
           <div className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors px-0.5",
            paymentMethod === 'card' ? "border-[#CF8F73]" : "border-gray-200"
           )}>
            <div className={cn(
             "w-2.5 h-2.5 rounded-full bg-[#CF8F73] transition-all",
             paymentMethod === 'card' ? "scale-100 opacity-100" : "scale-0 opacity-0"
            )} />
           </div>
          </motion.button>
         </div>

         {paymentMethod === 'card' && (
          <motion.div
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           className="mt-6 space-y-3"
          >
           <div className="bg-[#F8F8F8] rounded-[1.2rem] px-5 py-3.5 border border-transparent focus-within:border-gray-300 transition-colors">
            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Номер карты</span>
            <input
             type="text"
             value={cardNumber}
             onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
             placeholder="0000 0000 0000 0000"
             className="bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] w-full"
            />
           </div>
           <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8F8F8] rounded-[1.2rem] px-5 py-3.5 border border-transparent focus-within:border-gray-300 transition-colors">
             <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Срок</span>
             <input
              type="text"
              value={cardExpiry}
              onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
              placeholder="ММ/ГГ"
              className="bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] w-full"
             />
            </div>
            <div className="bg-[#F8F8F8] rounded-[1.2rem] px-5 py-3.5 border border-transparent focus-within:border-gray-300 transition-colors">
             <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">CVC</span>
             <input
              type="password"
              value={cardCVC}
              onChange={(e) => setCardCVC(e.target.value.substring(0, 3))}
              placeholder="•••"
              className="bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] w-full"
             />
            </div>
           </div>
          </motion.div>
         )}

         <button
          onClick={handleFinalCheckout}
          disabled={!paymentMethod || (paymentMethod === 'card' && !isCardValid)}
          className="mt-8 w-full h-[68px] bg-[#CF8F73] disabled:bg-[#CF8F73]/40 text-white rounded-[1.5rem] font-[900] text-[19px] hover:bg-[#b87a60] transition-all active:scale-95 shadow-xl shadow-[#CF8F73]/20"
         >
          Оплатить
         </button>
        </div>
       </motion.div>
      )}

      {/* ───── STEP 6: Success ───── */}
      {step === 6 && (
       <motion.div
        key="step6-success"
        variants={stepVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col items-center justify-center h-full w-full p-12 text-center"
       >
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
         <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-[#CF8F73] flex items-center justify-center shadow-lg shadow-[#CF8F73]/20"
         >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           <motion.path
            d="M20 6L9 17L4 12"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeInOut" }}
           />
          </svg>
         </motion.div>

         {/* Decorative particles */}
         {[...Array(6)].map((_, i) => (
          <motion.div
           key={i}
           className="absolute w-2 h-2 rounded-full bg-[#CF8F73]/40"
           initial={{ scale: 0, x: 0, y: 0 }}
           animate={{ scale: [0, 1, 0], x: (i % 2 === 0 ? 1 : -1) * (40 + i * 10), y: (i < 3 ? 1 : -1) * (40 + i * 5) }}
           transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
          />
         ))}
        </div>

        <h2 className="text-[28px] sm:text-[32px] font-extrabold text-[#3A332E] mb-4 tracking-tight" style={{ fontFeatureSettings: "'pnum' on, 'lnum' on" }}>
         Заказ принят!
        </h2>
        <p className="text-[#3A332E]/60 text-[16px] max-w-[320px] leading-relaxed mb-10">
         Спасибо за покупку. Мы уже начали готовить ваш заказ и скоро свяжемся с вами.
        </p>
        <button
         onClick={handleClose}
         className="w-full max-w-[280px] h-[64px] bg-[#CF8F73] text-white rounded-[1.5rem] font-[900] text-[19px] hover:bg-[#b87a60] transition-all active:scale-95 shadow-xl shadow-[#CF8F73]/20"
        >
         Отлично
        </button>
       </motion.div>
      )}

     </AnimatePresence>
    </motion.div>
   </div>
  </AnimatePresence>
 )
}

