"use client"

import React, { useState } from "react"
import { useApp } from "@/store/AppContext"
import { X, ChevronRight, Truck, MapPin, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type DeliveryType = "delivery" | "pickup" | null

const PICKUP_POINTS = [
 "Москва, Ижорская 3",
 "Москва, Арбат 5",
 "Москва, Ленинская 2",
 "Москва, Пушкина 12",
 "Москва, Садовая 8",
]

export default function CheckoutModal() {
 const { isCheckoutOpen, setCheckoutOpen, updateAddress } = useApp()
 const [step, setStep] = useState<1 | 2>(1)
 const [deliveryType, setDeliveryType] = useState<DeliveryType>(null)
 const [street, setStreet] = useState("")
 const [house, setHouse] = useState("")
 const [apt, setApt] = useState("")
 const [selectedPickup, setSelectedPickup] = useState<string | null>(null)

 const reset = () => {
  setStep(1)
  setDeliveryType(null)
  setStreet("")
  setHouse("")
  setApt("")
  setSelectedPickup(null)
 }

 const handleClose = () => {
  setCheckoutOpen(false)
  setTimeout(reset, 400)
 }

 const handleSaveDelivery = () => {
  if (street && house) {
   updateAddress(`${street}, д. ${house}${apt ? `, кв. ${apt}` : ""}`)
   handleClose()
  }
 }

 const handleSavePickup = () => {
  if (selectedPickup) {
   updateAddress(selectedPickup)
   handleClose()
  }
 }

 if (!isCheckoutOpen) return null

 const LeftPanel = ({ icon }: { icon: React.ReactNode }) => (
  <div className="flex-shrink-0 bg-[#EDE3D9] flex flex-col items-center justify-center gap-6
      w-[180px] sm:w-[220px] md:w-[280px]
      py-10 px-6">
   <div className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-full bg-white flex items-center justify-center shadow-md">
    {icon}
   </div>
   <p className="text-center text-[13px] sm:text-[14px] font-semibold text-[#6C5B52]/70 leading-snug">
    Доставим ваш заказ<br />прямо к двери
   </p>
  </div>
 )

 return (
  <AnimatePresence>
   {/* Full screen overlay container — items to stretched right */}
   <div className="fixed inset-0 z-[100] flex items-stretch justify-end p-4 sm:p-6">
    {/* Backdrop */}
    <motion.div
     key="backdrop"
     initial={{ opacity: 0 }}
     animate={{ opacity: 1 }}
     exit={{ opacity: 0 }}
     className="absolute inset-0 bg-[#3A332E]/35 backdrop-blur-[3px]"
     onClick={handleClose}
    />

    <AnimatePresence mode="wait">

     {/* ───── STEP 1: Способ получения ───── */}
     {step === 1 && (
      <motion.div
       key="step1"
       initial={{ opacity: 0, x: "100%" }}
       animate={{ opacity: 1, x: 0 }}
       exit={{ opacity: 0, x: "100%" }}
       transition={{ type: "spring", damping: 28, stiffness: 260 }}
       className="relative z-10 bg-white rounded-[2rem] shadow-2xl overflow-hidden flex
                w-full max-w-[580px] sm:max-w-[740px] md:max-w-[880px] h-full"
       style={{ minHeight: "80vh" }}
      >
       <LeftPanel icon={<Truck className="w-12 h-12 sm:w-14 sm:h-14 text-[#CF8F73]" strokeWidth={1.4} />} />

       <div className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col">
        <div className="flex items-start justify-between mb-8 sm:mb-10">
         <h2 className="text-[20px] sm:text-[24px] font-black text-[#4A3F39] leading-tight">
          Способ получения
         </h2>
         <button onClick={handleClose} className="mt-1 text-[#6C5B52]/40 hover:text-[#4A3F39] transition-colors flex-shrink-0">
          <X className="w-5 h-5" />
         </button>
        </div>

        <div className="flex flex-col gap-4">
         <button
          onClick={() => { setDeliveryType("delivery"); setStep(2) }}
          className="w-full px-5 py-4 sm:py-5 rounded-[1rem] border border-[#E8DDD7]
                      hover:border-[#CF8F73] hover:shadow-sm bg-white transition-all flex items-center justify-between group"
         >
          <div className="flex items-center gap-3">
           <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-[#CF8F73]" strokeWidth={1.7} />
           <span className="text-[15px] sm:text-[17px] font-bold text-[#4A3F39]">Доставка</span>
          </div>
          <ChevronRight className="w-5 h-5 text-[#CF8F73] group-hover:translate-x-0.5 transition-transform" />
         </button>

         <button
          onClick={() => { setDeliveryType("pickup"); setStep(2) }}
          className="w-full px-5 py-4 sm:py-5 rounded-[1rem] border border-[#E8DDD7]
                      hover:border-[#CF8F73] hover:shadow-sm bg-white transition-all flex items-center justify-between group"
         >
          <div className="flex items-center gap-3">
           <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#CF8F73]" strokeWidth={1.7} />
           <span className="text-[15px] sm:text-[17px] font-bold text-[#4A3F39]">Самовывоз</span>
          </div>
          <ChevronRight className="w-5 h-5 text-[#CF8F73] group-hover:translate-x-0.5 transition-transform" />
         </button>
        </div>
       </div>
      </motion.div>
     )}

     {/* ───── STEP 2: Delivery address form ───── */}
     {step === 2 && deliveryType === "delivery" && (
      <motion.div
       key="step2-delivery"
       initial={{ opacity: 0, x: "100%" }}
       animate={{ opacity: 1, x: 0 }}
       exit={{ opacity: 0, x: "100%" }}
       transition={{ type: "spring", damping: 28, stiffness: 260 }}
       className="relative z-10 bg-white rounded-[2rem] shadow-2xl overflow-hidden flex
                w-full max-w-[580px] sm:max-w-[740px] md:max-w-[880px] h-full"
       style={{ minHeight: "80vh" }}
      >
       <LeftPanel icon={<Truck className="w-12 h-12 sm:w-14 sm:h-14 text-[#CF8F73]" strokeWidth={1.4} />} />

       <div className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col">
        <div className="flex items-start justify-between mb-7 sm:mb-9">
         <h2 className="text-[20px] sm:text-[24px] font-black text-[#4A3F39] leading-tight">
          Введите адрес
         </h2>
         <button onClick={handleClose} className="mt-1 text-[#6C5B52]/40 hover:text-[#4A3F39] transition-colors flex-shrink-0">
          <X className="w-5 h-5" />
         </button>
        </div>

        <div className="flex flex-col gap-4 flex-1">
         {/* Улица */}
         <div>
          <label className="text-[10px] font-bold text-[#6C5B52]/50 uppercase tracking-widest mb-2 block">Улица</label>
          <input
           type="text"
           value={street}
           onChange={(e) => setStreet(e.target.value)}
           placeholder="Ижорская"
           className="w-full bg-[#FAF6F3] border border-[#EFE8E3] rounded-[0.85rem] px-4 py-3.5
                        text-[14px] sm:text-[15px] font-semibold text-[#4A3F39] placeholder:text-[#6C5B52]/30
                        focus:outline-none focus:border-[#CF8F73] transition-colors"
          />
         </div>

         {/* Дом + Кв */}
         <div className="flex gap-3">
          <div className="flex-1">
           <label className="text-[10px] font-bold text-[#6C5B52]/50 uppercase tracking-widest mb-2 block">Дом</label>
           <input
            type="text"
            value={house}
            onChange={(e) => setHouse(e.target.value)}
            placeholder="3"
            className="w-full bg-[#FAF6F3] border border-[#EFE8E3] rounded-[0.85rem] px-4 py-3.5
                          text-[14px] sm:text-[15px] font-semibold text-[#4A3F39] placeholder:text-[#6C5B52]/30
                          focus:outline-none focus:border-[#CF8F73] transition-colors"
           />
          </div>
          <div className="flex-1">
           <label className="text-[10px] font-bold text-[#6C5B52]/50 uppercase tracking-widest mb-2 block">Кв.</label>
           <input
            type="text"
            value={apt}
            onChange={(e) => setApt(e.target.value)}
            placeholder=""
            className="w-full bg-[#FAF6F3] border border-[#EFE8E3] rounded-[0.85rem] px-4 py-3.5
                          text-[14px] sm:text-[15px] font-semibold text-[#4A3F39] placeholder:text-[#6C5B52]/30
                          focus:outline-none focus:border-[#CF8F73] transition-colors"
           />
          </div>
         </div>

         <div className="flex-1" />

         {/* Сохранить */}
         <button
          onClick={handleSaveDelivery}
          disabled={!street || !house}
          className="w-full bg-[#CF8F73] disabled:bg-[#CF8F73]/40 disabled:cursor-not-allowed
                      rounded-[0.85rem] h-[56px] sm:h-[60px] text-white font-bold text-[15px] sm:text-[16px]
                      hover:bg-[#b87a60] transition-all"
         >
          Сохранить адрес
         </button>

         {/* Изменить способ */}
         <button
          onClick={() => { setStep(1); setDeliveryType(null) }}
          className="text-center text-[13px] sm:text-[14px] font-semibold text-[#CF8F73] hover:text-[#b87a60] transition-colors"
         >
          Изменить способ
         </button>
        </div>
       </div>
      </motion.div>
     )}

     {/* ───── STEP 2: Pickup ───── */}
     {step === 2 && deliveryType === "pickup" && (
      <motion.div
       key="step2-pickup"
       initial={{ opacity: 0, x: "100%" }}
       animate={{ opacity: 1, x: 0 }}
       exit={{ opacity: 0, x: "100%" }}
       transition={{ type: "spring", damping: 28, stiffness: 260 }}
       className="relative z-10 bg-white rounded-[2rem] shadow-2xl overflow-hidden flex
                w-full max-w-[580px] sm:max-w-[740px] md:max-w-[880px] h-full"
       style={{ minHeight: "80vh" }}
      >
       <LeftPanel icon={<MapPin className="w-12 h-12 sm:w-14 sm:h-14 text-[#CF8F73]" strokeWidth={1.4} />} />

       <div className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col">
        <div className="flex items-start justify-between mb-7 sm:mb-9">
         <h2 className="text-[20px] sm:text-[24px] font-black text-[#4A3F39] leading-tight">
          Самовывоз
         </h2>
         <button onClick={handleClose} className="mt-1 text-[#6C5B52]/40 hover:text-[#4A3F39] transition-colors flex-shrink-0">
          <X className="w-5 h-5" />
         </button>
        </div>

        <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto">
         {PICKUP_POINTS.map((p) => (
          <button
           key={p}
           onClick={() => setSelectedPickup(p)}
           className={`w-full px-4 py-3.5 rounded-[0.85rem] text-left text-[13px] sm:text-[14px] font-semibold transition-all border ${selectedPickup === p
            ? "bg-[#FDF0E8] border-[#CF8F73] text-[#4A3F39]"
            : "bg-[#FAF6F3] border-[#EFE8E3] text-[#4A3F39] hover:border-[#CF8F73]"
            }`}
          >
           {p}
          </button>
         ))}
        </div>

        <div className="mt-5 flex flex-col gap-3">
         <button
          onClick={handleSavePickup}
          disabled={!selectedPickup}
          className="w-full bg-[#CF8F73] disabled:bg-[#CF8F73]/40 disabled:cursor-not-allowed
                      rounded-[0.85rem] h-[56px] sm:h-[60px] text-white font-bold text-[15px] sm:text-[16px]
                      hover:bg-[#b87a60] transition-all"
         >
          Сохранить адрес
         </button>

         <button
          onClick={() => { setStep(1); setDeliveryType(null) }}
          className="text-center text-[13px] sm:text-[14px] font-semibold text-[#CF8F73] hover:text-[#b87a60] transition-colors"
         >
          Изменить способ
         </button>
        </div>
       </div>
      </motion.div>
     )}

    </AnimatePresence>
   </div>
  </AnimatePresence>
 )
}
