import React, { useState, useEffect } from "react"
import { useApp } from "@/store/AppContext"
import { X, ChevronRight, Truck, MapPin, ArrowLeft, User, Phone, CheckCircle2, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import MapPicker from "./MapPicker"
import { cn } from "@/lib/utils"

type DeliveryType = "delivery" | "pickup" | null

const PICKUP_POINTS = [
 "Москва, Ижорская 3",
 "Москва, Арбат 5",
 "Москва, Ленинская 2",
 "Москва, Пушкина 12",
 "Москва, Садовая 8",
]

export default function CheckoutModal() {
 const {
  isCheckoutOpen,
  setCheckoutOpen,
  updateAddress,
  address,
  userName,
  setUserName,
  userPhone,
  setUserPhone,
  checkout
 } = useApp()
 const { data: session, status } = useSession()

 const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
 const [deliveryType, setDeliveryType] = useState<DeliveryType>(null)
 const [tempAddress, setTempAddress] = useState(address)
 const [selectedPickup, setSelectedPickup] = useState<string | null>(null)
 const [mapError, setMapError] = useState<string | null>(null)

 const reset = () => {
  setStep(1)
  setDeliveryType(null)
  setTempAddress(address)
  setSelectedPickup(null)
  setMapError(null)
 }

 const handleClose = () => {
  setCheckoutOpen(false)
  setTimeout(reset, 400)
 }

 const handleNextFromDelivery = () => {
  if (tempAddress) {
   updateAddress(tempAddress)
   if (status === "authenticated") {
    handleFinalCheckout()
   } else {
    setStep(3)
   }
  }
 }

 const handleNextFromPickup = () => {
  if (selectedPickup) {
   updateAddress(selectedPickup)
   if (status === "authenticated") {
    handleFinalCheckout()
   } else {
    setStep(3)
   }
  }
 }

 const handleFinalCheckout = () => {
  const success = checkout()
  if (success) {
   setStep(4)
   setTimeout(() => {
    handleClose()
   }, 3000)
  }
 }

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
   {step > 1 && step < 4 && (
    <button
     onClick={() => setStep(step === 3 ? 2 : 1)}
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
        className="flex h-full w-full"
       >
        <LeftPanel
         icon={<Truck className="w-14 h-14 sm:w-16 sm:h-16 text-[#CF8F73]" strokeWidth={1} />}
         text={<>Доставим ваш заказ<br />прямо к двери</>}
        />

        <div className="flex-1 p-5 sm:p-8 md:p-10 flex flex-col">
         <div className="flex items-start justify-between mb-6 sm:mb-10">
          <div>
           {/* Mobile back button */}
           {step > 1 && (
            <button onClick={() => setStep(1)} className="sm:hidden flex items-center gap-1.5 text-[12px] font-bold text-[#6C5B52]/50 mb-3">
             <ArrowLeft className="w-3.5 h-3.5" /> Назад
            </button>
           )}
           <h2 className="text-[20px] sm:text-[24px] font-[800] text-[#4A3F39] tracking-tight">
            Способ получения
           </h2>
          </div>
          <button onClick={handleClose} className="p-2 bg-[#FAF6F3] rounded-full text-[#6C5B52]/40 hover:text-[#4A3F39] transition-colors shrink-0">
           <X className="w-5 h-5" />
          </button>
         </div>

         <div className="flex flex-col gap-3 sm:gap-5">
          <button
           onClick={() => { setDeliveryType("delivery"); setStep(2) }}
           className="w-full p-5 sm:p-7 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-[#E8DDD7]
																hover:border-[#CF8F73] bg-white transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
          >
           <div className="flex items-center gap-3 sm:gap-5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#FAF6F3] flex items-center justify-center group-hover:bg-[#FDF0E8] transition-colors">
             <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-[#CF8F73]" strokeWidth={2} />
            </div>
            <div className="flex flex-col items-start">
             <span className="text-[15px] sm:text-[17px] font-[800] text-[#4A3F39]">Доставка</span>
             <span className="text-[12px] sm:text-[13px] text-[#6C5B52]/60 font-medium">Курьером по адресу</span>
            </div>
           </div>
           <ChevronRight className="w-5 h-5 text-[#CF8F73]/40 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
           onClick={() => { setDeliveryType("pickup"); setStep(2) }}
           className="w-full p-5 sm:p-7 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-[#E8DDD7]
																hover:border-[#CF8F73] bg-white transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
          >
           <div className="flex items-center gap-3 sm:gap-5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#FAF6F3] flex items-center justify-center group-hover:bg-[#FDF0E8] transition-colors">
             <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#CF8F73]" strokeWidth={2} />
            </div>
            <div className="flex flex-col items-start">
             <span className="text-[15px] sm:text-[17px] font-[800] text-[#4A3F39]">Самовывоз</span>
             <span className="text-[12px] sm:text-[13px] text-[#6C5B52]/60 font-medium">Бесплатно из пекарни</span>
            </div>
           </div>
           <ChevronRight className="w-5 h-5 text-[#CF8F73]/40 group-hover:translate-x-1 transition-transform" />
          </button>
         </div>
        </div>
       </motion.div>
      )}

      {/* ───── STEP 2: Delivery address (MAP) ───── */}
      {step === 2 && deliveryType === "delivery" && (
       <motion.div
        key="step2-delivery"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex h-full w-full"
       >
        <LeftPanel
         icon={<Truck className="w-14 h-14 text-[#CF8F73]" strokeWidth={1.2} />}
         text={<>Укажите точку<br />доставки на карте</>}
        />

        <div className="flex-1 p-5 sm:p-8 md:p-10 flex flex-col overflow-hidden">
         <div className="flex items-start justify-between mb-5 sm:mb-8">
          <div>
           <button onClick={() => setStep(1)} className="sm:hidden flex items-center gap-1.5 text-[12px] font-bold text-[#6C5B52]/50 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Назад
           </button>
           <h2 className="text-[20px] sm:text-[24px] font-[800] text-[#4A3F39] tracking-tight">
            Где вы сейчас?
           </h2>
          </div>
          <button onClick={handleClose} className="p-2 bg-[#FAF6F3] rounded-full text-[#6C5B52]/40 hover:text-[#4A3F39] transition-colors shrink-0">
           <X className="w-5 h-5" />
          </button>
         </div>

         <div className="flex-1 overflow-hidden mb-5 sm:mb-8">
          <MapPicker
           initialAddress={tempAddress}
           onAddressSelect={setTempAddress}
           onError={setMapError}
          />
         </div>

         <button
          onClick={handleNextFromDelivery}
          disabled={!tempAddress}
          className="w-full bg-[#CF8F73] disabled:bg-[#CF8F73]/40 disabled:cursor-not-allowed
																rounded-[1.2rem] h-[52px] sm:h-[60px] text-white font-[800] text-[15px] sm:text-[17px]
																hover:bg-[#b87a60] transition-all shadow-xl shadow-[#CF8F73]/20 active:scale-95"
         >
          {status === "authenticated" ? "Заказать" : "Продолжить"}
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
        className="flex h-full w-full"
       >
        <LeftPanel
         icon={<MapPin className="w-14 h-14 text-[#CF8F73]" strokeWidth={1.2} />}
         text={<>Выберите удобный<br />пункт самовывоза</>}
        />

        <div className="flex-1 p-5 sm:p-8 md:p-10 flex flex-col">
         <div className="flex items-start justify-between mb-5 sm:mb-8">
          <div>
           <button onClick={() => setStep(1)} className="sm:hidden flex items-center gap-1.5 text-[12px] font-bold text-[#6C5B52]/50 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Назад
           </button>
           <h2 className="text-[20px] sm:text-[24px] font-[800] text-[#4A3F39] tracking-tight">
            Самовывоз
           </h2>
          </div>
          <button onClick={handleClose} className="p-2 bg-[#FAF6F3] rounded-full text-[#6C5B52]/40 hover:text-[#4A3F39] transition-colors shrink-0">
           <X className="w-5 h-5" />
          </button>
         </div>

         <div className="flex flex-col gap-2.5 sm:gap-3 flex-1 overflow-y-auto pr-1 scrollbar-hide">
          {PICKUP_POINTS.map((p) => (
           <button
            key={p}
            onClick={() => setSelectedPickup(p)}
            className={`w-full p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.5rem] text-left text-[14px] sm:text-[15px] font-[800] transition-all border-2 ${selectedPickup === p
             ? "bg-[#FDF0E8] border-[#CF8F73] text-[#4A3F39]"
             : "bg-[#FAF6F3] border-[#E8E1DC] text-[#4A3F39] hover:border-[#CF8F73]/40"
             }`}
           >
            {p}
           </button>
          ))}
         </div>

         <div className="mt-4 sm:mt-6">
          <button
           onClick={handleNextFromPickup}
           disabled={!selectedPickup}
           className="w-full bg-[#CF8F73] disabled:bg-[#CF8F73]/40 disabled:cursor-not-allowed
																rounded-[1.2rem] h-[52px] sm:h-[60px] text-white font-[800] text-[15px] sm:text-[17px]
																hover:bg-[#b87a60] transition-all shadow-xl shadow-[#CF8F73]/20 active:scale-95"
          >
           {status === "authenticated" ? "Заказать" : "Продолжить"}
          </button>
         </div>
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
         icon={<User className="w-14 h-14 text-[#CF8F73]" strokeWidth={1.2} />}
         text={<>Оставьте контакты для<br />связи с вами</>}
        />

        <div className="flex-1 p-5 sm:p-8 md:p-10 flex flex-col">
         <div className="flex items-start justify-between mb-6 sm:mb-10">
          <div>
           <button onClick={() => setStep(2)} className="sm:hidden flex items-center gap-1.5 text-[12px] font-bold text-[#6C5B52]/50 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Назад
           </button>
           <h2 className="text-[20px] sm:text-[24px] font-[800] text-[#4A3F39] tracking-tight">
            Ваши контакты
           </h2>
          </div>
          <button onClick={handleClose} className="p-2 bg-[#FAF6F3] rounded-full text-[#6C5B52]/40 hover:text-[#4A3F39] transition-colors shrink-0">
           <X className="w-5 h-5" />
          </button>
         </div>

         <div className="flex flex-col gap-4 sm:gap-6 flex-1">
          <div className="space-y-1.5">
           <label className="text-[10px] sm:text-[11px] font-[800] text-[#6C5B52]/50 uppercase tracking-[0.1em] ml-2">Ваше имя</label>
           <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#6C5B52]/30" />
            <input
             type="text"
             value={userName}
             onChange={(e) => setUserName(e.target.value)}
             placeholder="Иван"
             className="w-full bg-[#FAF6F3] border-2 border-transparent rounded-[1rem] sm:rounded-[1.2rem] pl-11 sm:pl-14 pr-4 py-3 sm:py-4
																			text-[14px] sm:text-[16px] font-[800] text-[#4A3F39] placeholder:text-[#6C5B52]/20
																			focus:outline-none focus:border-[#CF8F73] transition-all shadow-sm focus:bg-white"
            />
           </div>
          </div>

          <div className="space-y-1.5">
           <label className="text-[10px] sm:text-[11px] font-[800] text-[#6C5B52]/50 uppercase tracking-[0.1em] ml-2">Телефон</label>
           <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#6C5B52]/30" />
            <input
             type="tel"
             value={userPhone}
             onChange={(e) => setUserPhone(e.target.value)}
             placeholder="+7 (999) 000-00-00"
             className="w-full bg-[#FAF6F3] border-2 border-transparent rounded-[1rem] sm:rounded-[1.2rem] pl-11 sm:pl-14 pr-4 py-3 sm:py-4
																			text-[14px] sm:text-[16px] font-[800] text-[#4A3F39] placeholder:text-[#6C5B52]/20
																			focus:outline-none focus:border-[#CF8F73] transition-all shadow-sm focus:bg-white"
            />
           </div>
          </div>

          <div className="flex-1" />

          <button
           onClick={handleFinalCheckout}
           disabled={!userName || !userPhone}
           className="w-full bg-[#CF8F73] disabled:bg-[#CF8F73]/40 disabled:cursor-not-allowed
																rounded-[1.2rem] h-[52px] sm:h-[60px] text-white font-[800] text-[15px] sm:text-[17px]
																hover:bg-[#b87a60] transition-all shadow-xl shadow-[#CF8F73]/20"
          >
           Оформить заказ
          </button>
         </div>
        </div>
       </motion.div>
      )}

      {/* ───── STEP 4: Success! ───── */}
      {step === 4 && (
       <motion.div
        key="step4-success"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="flex flex-col items-center justify-center p-12 w-full h-full"
       >
        <div className="w-24 h-24 rounded-[2.5rem] bg-green-50 flex items-center justify-center mb-8 shadow-inner">
         <CheckCircle2 className="w-12 h-12 text-green-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-[32px] font-[800] text-[#4A3F39] mb-4 text-center tracking-tight">
         Заказ принят!
        </h2>
        <p className="text-[#6C5B52] text-[18px] text-center font-medium leading-relaxed mb-10 max-w-[340px]">
         Спасибо за ваш выбор. <br />
         Мы свяжемся с вами в ближайшее время для подтверждения.
        </p>
        <button
         onClick={handleClose}
         className="px-14 py-5 bg-[#CF8F73] text-white rounded-[1.2rem] font-[800] text-[17px] hover:bg-[#b87a60] transition-all shadow-xl shadow-[#CF8F73]/20"
        >
         Вернуться к покупкам
        </button>
       </motion.div>
      )}

     </AnimatePresence>
    </motion.div>
   </div>
  </AnimatePresence>
 )
}
