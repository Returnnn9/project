import React, { useState, useEffect, useCallback } from "react"
import { useUIStore, useCartStore, useUserStore, useStoreData, useRootStore } from "@/store/hooks"
import { X, ChevronRight, ChevronDown, Truck, MapPin, ArrowLeft, User, Phone, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import MapPicker from "./MapPicker"
import { cn } from "@/lib/utils"
import { useAddressSearch } from "@/hooks/useAddressSearch"
import { PICKUP_POINTS } from "@/lib/constants/delivery"
import { PickupPoint, CityKey } from "@/lib/types/address"

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

 const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
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
   setSuggestions(prev => prev.length > 0 ? [] : prev)
  }
  return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current) }
 }, [tempAddress, step, deliveryType, selectedCity, fetchSuggestions, searchTimeout, setSuggestions, skipNextFetch])

 const reset = () => {
  setStep(1)
  setDeliveryType(null)
  setPaymentMethod(null)
  setCardNumber('')
  setCardExpiry('')
  setCardCVC('')
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
   const fullAddress = [
    tempAddress,
    house && `д. ${house}`,
    entrance && `под. ${entrance}`,
    floor && `эт. ${floor}`,
    apartment && `кв. ${apartment}`
   ].filter(Boolean).join(', ')

   updateAddress(fullAddress, "delivery")
   if (status === "authenticated") {
    handleFinalCheckout()
   } else {
    setStep(3)
   }
  }
 }

 const handleNextFromPickup = () => {
  if (selectedPickup) {
   updateAddress(`${selectedPickup.city}, ${selectedPickup.address}`, "pickup")
   if (status === "authenticated") {
    handleFinalCheckout()
   } else {
    setStep(3)
   }
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

 const handleFinalCheckout = () => {
  const success = checkout()
  if (success) {
   setStep(5)
   setTimeout(() => {
    handleClose()
   }, 3000)
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

 if (!isCheckoutOpen) return null

 const LeftPanel = ({ icon, text }: { icon: React.ReactNode, text: React.ReactNode }) => (
  <div className="hidden sm:flex flex-shrink-0 bg-[#EDE3D9] flex-col items-center justify-center gap-6
					w-[200px] md:w-[280px]
					py-10 px-6">
   <div className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-full bg-white flex items-center justify-center shadow-lg">
    {mapError && step === 2 ? (
     <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
      <XCircle className="w-9 h-9 text-red-400" />
     </div>
    ) : icon}
   </div>
   <p className={cn(
    "text-center text-[14px] sm:text-[15px] font-[800] leading-relaxed px-2",
    mapError && step === 2 ? "text-red-500/80" : "text-[#6C5B52]"
   )}>
    {mapError && step === 2 ? mapError : text}
   </p>
   {step > 1 && step < 5 && (
    <button
     onClick={() => setStep(step === 4 ? 3 : step === 3 ? 2 : 1)}
     className="flex items-center gap-2 text-[12px] font-bold text-[#6C5B52]/50 hover:text-[#6C5B52] transition-colors mt-2"
    >
     <ArrowLeft className="w-3.5 h-3.5" /> Назад
    </button>
   )}
  </div>
 )

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
        <div className="w-full h-[280px] sm:h-full sm:w-[45%] p-4 pb-0 sm:p-6 sm:pb-6 shrink-0 sm:shrink">
         <div className="w-full h-full rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-inner relative">
          <MapPicker
           hideSearch={true}
           initialAddress={selectedCity}
           onAddressSelect={() => { }}
           onError={setMapError}
          />
         </div>
        </div>

        <div className="flex-1 p-5 sm:p-10 flex flex-col justify-center overflow-y-auto min-h-0">
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
        <div className="w-full h-[260px] shrink-0 sm:h-full sm:w-[55%] p-4 pb-0 sm:p-6 sm:pb-6">
         <div className="w-full h-full rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-inner">
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

        <div className="flex-1 p-5 sm:p-10 flex flex-col overflow-y-auto no-scrollbar min-h-0">
         <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <button
           onClick={() => setStep(1)}
           className="p-1 text-smusl-gray hover:text-smusl-brown transition-colors"
          >
           <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-[20px] sm:text-[24px] font-extrabold text-smusl-brown tracking-tight">
           Введите адрес
          </h2>
         </div>

         <div className="space-y-3 flex-1">
          <div className="relative">
           <div
            className="bg-[#F2F2F2] rounded-[1rem] px-5 py-4 cursor-pointer select-none"
            onClick={() => setShowCityDropdown(v => !v)}
           >
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-0.5">Город</span>
            <div className="flex items-center justify-between">
             <span className="text-[15px] font-extrabold text-smusl-brown">{selectedCity}</span>
             <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform duration-200', showCityDropdown && 'rotate-180')} />
            </div>
           </div>
           {showCityDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-[1rem] shadow-[0_16px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50">
             {(['Москва', 'Санкт-Петербург'] as const).map(c => (
              <button
               key={c}
               onClick={() => { setSelectedCity(c); setTempAddress(''); setSuggestions([]); setSelectedCoords(null); setShowCityDropdown(false) }}
               className={cn(
                'w-full text-left px-5 py-3.5 text-[15px] font-bold transition-colors border-b last:border-0 border-gray-50',
                selectedCity === c ? 'text-smusl-terracotta bg-smusl-terracotta/5' : 'text-smusl-brown hover:bg-gray-50'
               )}
              >
               {c}
              </button>
             ))}
            </div>
           )}
          </div>

          <div className="relative">
           <div className="bg-[#F2F2F2] rounded-[1rem] px-5 py-3.5">
            <div className="flex justify-between items-center mb-0.5">
             <span className="block text-[10px] font-bold text-gray-400 tracking-wide uppercase">
              Улица и дом
             </span>
            </div>
            <div className="flex items-center gap-2">
             <input
              type="text"
              value={tempAddress}
              onChange={(e) => setTempAddress(e.target.value)}
              placeholder="Введите адрес"
              className="bg-transparent border-none outline-none text-[15px] font-extrabold text-[#4A3F39] placeholder:text-[#BDBDBD] placeholder:font-normal w-full"
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
                 setTempAddress(road);
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
            <span className="block text-[7px] min-[375px]:text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-normal sm:tracking-[0.1em] mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis" title="Кв. / Офис">Кв. / Офис</span>
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
           className="flex items-center gap-2.5 w-full px-5 py-3.5 rounded-[1rem] bg-[#F2F2F2] text-smusl-brown text-[14px] font-bold hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-50"
          >
           {isLocating
            ? <Loader2 className="w-4 h-4 animate-spin text-smusl-terracotta flex-shrink-0" />
            : <MapPin className="w-4 h-4 text-smusl-terracotta flex-shrink-0" />
           }
           {isLocating ? 'Определяем...' : 'Где я'}
          </button>
         </div>

         <button
          onClick={handleNextFromDelivery}
          disabled={!tempAddress}
          className="mt-4 sm:mt-auto w-full h-[56px] sm:h-[64px] bg-smusl-terracotta disabled:bg-smusl-terracotta/40 text-white rounded-[1.2rem] font-[800] text-[16px] sm:text-[18px] hover:bg-[#b87a60] transition-all shadow-xl shadow-smusl-terracotta/20 active:scale-95 mb-[calc(1rem+env(safe-area-inset-bottom))] sm:mb-0"
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
        <div className="w-full h-[260px] shrink-0 sm:h-full sm:w-[55%] p-4 pb-0 sm:p-6 sm:pb-6">
         <div className="w-full h-full rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-inner">
          <MapPicker
           hideSearch={true}
           initialAddress={selectedPickup ? `${selectedPickup.city}, ${selectedPickup.address}` : ""}
           onAddressSelect={() => { }}
           onError={setMapError}
           externalCoords={selectedPickup ? (selectedPickup.coords as [number, number]) : null}
          />
         </div>
        </div>

        <div className="flex-1 p-6 pb-12 sm:pb-10 sm:p-10 flex flex-col min-h-0">
         <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
           <button
            onClick={() => setStep(1)}
            className="p-1 text-smusl-gray hover:text-smusl-brown transition-colors"
           >
            <ArrowLeft className="w-6 h-6" />
           </button>
           <h2 className="text-[22px] sm:text-[24px] font-extrabold text-smusl-brown tracking-tight">
            Выберите адрес самовывоза
           </h2>
          </div>
          <button
           onClick={handleClose}
           className="p-1 text-smusl-gray hover:text-smusl-brown transition-colors"
          >
           <X className="w-6 h-6" />
          </button>
         </div>

         <div className="relative mb-6">
          <div
           className="bg-[#F2F2F2] rounded-[1rem] px-5 py-4 cursor-pointer select-none"
           onClick={() => setShowCityDropdown(v => !v)}
          >
           <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-0.5">Город</span>
           <div className="flex items-center justify-between">
            <span className="text-[15px] font-extrabold text-smusl-brown">{selectedCity}</span>
            <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform duration-200', showCityDropdown && 'rotate-180')} />
           </div>
          </div>
          {showCityDropdown && (
           <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-[1rem] shadow-[0_16px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50">
            {(['Москва', 'Санкт-Петербург'] as const).map(c => (
             <button
              key={c}
              onClick={() => { setSelectedCity(c); setSelectedPickup(null); setShowCityDropdown(false) }}
              className={cn(
               'w-full text-left px-5 py-3.5 text-[15px] font-bold transition-colors border-b last:border-0 border-gray-50',
               selectedCity === c ? 'text-smusl-terracotta bg-smusl-terracotta/5' : 'text-smusl-brown hover:bg-gray-50'
              )}
             >
              {c}
             </button>
            ))}
           </div>
          )}
         </div>

         <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1 no-scrollbar">
          {PICKUP_POINTS.filter(p => p.city === selectedCity).map((p) => (
           <button
            key={p.address}
            onClick={() => setSelectedPickup(p)}
            className={cn(
             "w-full h-[72px] px-6 rounded-[1.5rem] border transition-all flex items-center justify-between group",
             selectedPickup?.address === p.address
              ? "border-smusl-terracotta bg-white"
              : "border-gray-200 bg-white hover:border-smusl-terracotta/50"
            )}
           >
            <span className={cn(
             "text-[17px] font-extrabold transition-colors",
             selectedPickup?.address === p.address ? "text-smusl-brown" : "text-smusl-brown/80"
            )}>
             {p.address}
            </span>
            <div className={cn(
             "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors px-0.5",
             selectedPickup?.address === p.address ? "border-smusl-terracotta" : "border-gray-200 group-hover:border-smusl-terracotta/50"
            )}>
             <div className={cn(
              "w-2.5 h-2.5 rounded-full bg-smusl-terracotta transition-all duration-300",
              selectedPickup?.address === p.address ? "scale-100 opacity-100" : "scale-0 opacity-0"
             )} />
            </div>
           </button>
          ))}
         </div>

         <button
          onClick={handleNextFromPickup}
          disabled={!selectedPickup}
          className="mt-6 w-full h-[64px] bg-smusl-terracotta disabled:bg-smusl-terracotta/40 text-white rounded-[1.2rem] font-[800] text-[18px] hover:bg-[#b87a60] transition-all active:scale-95 shadow-xl shadow-smusl-terracotta/20 shrink-0 mb-[calc(2rem+env(safe-area-inset-bottom))] sm:mb-0"
         >
          Всё верно
         </button>
        </div>
       </motion.div>
      )}

      {/* ───── STEP 3: Guest Contact Info ───── */}
      {step === 3 && (
       <motion.div
        key="step3-guest"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex h-full w-full"
       >
        <LeftPanel
         icon={<User className="w-12 h-12 text-smusl-terracotta" />}
         text="Ваши контактные данные для уточнения деталей заказа"
        />
        <div className="flex-1 p-6 sm:p-12 flex flex-col justify-center">
         <h2 className="text-[24px] sm:text-[28px] font-extrabold text-smusl-brown mb-8 tracking-tight">
          Как к вам обращаться?
         </h2>
         <div className="space-y-4">
          <div className="bg-[#F2F2F2] rounded-[1.2rem] px-6 py-4">
           <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Имя</span>
           <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Иван"
            className="bg-transparent border-none outline-none text-[16px] font-extrabold text-smusl-brown placeholder:text-gray-300 w-full"
           />
          </div>
          <div className="bg-[#F2F2F2] rounded-[1.2rem] px-6 py-4">
           <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Телефон</span>
           <input
            type="tel"
            value={userPhone}
            onChange={(e) => setUserPhone(e.target.value)}
            placeholder="+7 (999) 000-00-00"
            className="bg-transparent border-none outline-none text-[16px] font-extrabold text-smusl-brown placeholder:text-gray-300 w-full"
           />
          </div>
         </div>
         <button
          onClick={() => setStep(4)}
          disabled={!userName || !userPhone}
          className="mt-10 w-full h-[64px] bg-smusl-terracotta disabled:bg-smusl-terracotta/40 text-white rounded-[1.2rem] font-[800] text-[18px] hover:bg-[#b87a60] transition-all active:scale-95 shadow-xl shadow-smusl-terracotta/20"
         >
          Далее
         </button>
        </div>
       </motion.div>
      )}

      {/* ───── STEP 4: Payment ───── */}
      {step === 4 && (
       <motion.div
        key="step4-pay"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex h-full w-full"
       >
        <LeftPanel
         icon={<CheckCircle2 className="w-12 h-12 text-smusl-terracotta" />}
         text="Выберите удобный способ оплаты"
        />
        <div className="flex-1 p-6 sm:p-12 flex flex-col justify-center">
         <h2 className="text-[24px] sm:text-[28px] font-extrabold text-smusl-brown mb-8 tracking-tight">
          Оплата заказа
         </h2>

         <div className="space-y-4">
          <button
           onClick={() => setPaymentMethod('sbp')}
           className={cn(
            "w-full p-6 rounded-[1.5rem] border-2 transition-all flex items-center justify-between group",
            paymentMethod === 'sbp' ? "border-smusl-terracotta bg-smusl-terracotta/5" : "border-gray-100 hover:border-gray-200"
           )}
          >
           <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-[#1D1B1A] rounded flex items-center justify-center text-white font-bold text-[10px]">SBP</div>
            <span className="font-extrabold text-smusl-brown">Оплата через СБП</span>
           </div>
           <div className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors px-0.5",
            paymentMethod === 'sbp' ? "border-smusl-terracotta" : "border-gray-200"
           )}>
            <div className={cn(
             "w-2.5 h-2.5 rounded-full bg-smusl-terracotta transition-all",
             paymentMethod === 'sbp' ? "scale-100 opacity-100" : "scale-0 opacity-0"
            )} />
           </div>
          </button>

          <button
           onClick={() => setPaymentMethod('card')}
           className={cn(
            "w-full p-6 rounded-[1.5rem] border-2 transition-all flex items-center justify-between group",
            paymentMethod === 'card' ? "border-smusl-terracotta bg-smusl-terracotta/5" : "border-gray-100 hover:border-gray-200"
           )}
          >
           <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-[#1D1B1A] rounded flex items-center justify-center text-white font-bold text-[10px]">CARD</div>
            <span className="font-extrabold text-smusl-brown">Банковской картой</span>
           </div>
           <div className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors px-0.5",
            paymentMethod === 'card' ? "border-smusl-terracotta" : "border-gray-200"
           )}>
            <div className={cn(
             "w-2.5 h-2.5 rounded-full bg-smusl-terracotta transition-all",
             paymentMethod === 'card' ? "scale-100 opacity-100" : "scale-0 opacity-0"
            )} />
           </div>
          </button>
         </div>

         {paymentMethod === 'card' && (
          <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="mt-6 space-y-3"
          >
           <div className="bg-[#F2F2F2] rounded-[1.2rem] px-5 py-3">
            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Номер карты</span>
            <input
             type="text"
             value={cardNumber}
             onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
             placeholder="0000 0000 0000 0000"
             className="bg-transparent border-none outline-none text-[15px] font-extrabold text-smusl-brown w-full"
            />
           </div>
           <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F2F2F2] rounded-[1.2rem] px-5 py-3">
             <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Срок</span>
             <input
              type="text"
              value={cardExpiry}
              onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
              placeholder="ММ/ГГ"
              className="bg-transparent border-none outline-none text-[15px] font-extrabold text-smusl-brown w-full"
             />
            </div>
            <div className="bg-[#F2F2F2] rounded-[1.2rem] px-5 py-3">
             <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">CVC</span>
             <input
              type="password"
              value={cardCVC}
              onChange={(e) => setCardCVC(e.target.value.substring(0, 3))}
              placeholder="•••"
              className="bg-transparent border-none outline-none text-[15px] font-extrabold text-smusl-brown w-full"
             />
            </div>
           </div>
          </motion.div>
         )}

         <button
          onClick={handleFinalCheckout}
          disabled={!paymentMethod || (paymentMethod === 'card' && !isCardValid)}
          className="mt-8 w-full h-[64px] bg-smusl-terracotta disabled:bg-smusl-terracotta/40 text-white rounded-[1.2rem] font-[800] text-[18px] hover:bg-[#b87a60] transition-all active:scale-95 shadow-xl shadow-smusl-terracotta/20"
         >
          Оплатить
         </button>
        </div>
       </motion.div>
      )}

      {/* ───── STEP 5: Success ───── */}
      {step === 5 && (
       <motion.div
        key="step5-success"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full w-full p-12 text-center"
       >
        <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-8">
         <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-[28px] sm:text-[32px] font-extrabold text-smusl-brown mb-4 tracking-tight">
         Заказ принят!
        </h2>
        <p className="text-smusl-brown/60 text-[16px] max-w-[320px] leading-relaxed mb-10">
         Спасибо за покупку. Мы уже начали готовить ваш заказ и скоро свяжемся с вами.
        </p>
        <button
         onClick={handleClose}
         className="w-full max-w-[280px] h-[64px] bg-smusl-brown text-white rounded-[1.2rem] font-[800] text-[18px] hover:bg-[#2D231F] transition-all active:scale-95"
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
