"use client"

import React, { useState } from "react"
import { useApp } from "@/store/AppContext"
import { X, MapPin, Truck, ChevronRight, ArrowLeft } from "lucide-react"
import MapPicker from "./MapPicker"
import { cn } from "@/lib/utils"

export default function AddressModal() {
 const { isAddressModalOpen, setAddressModalOpen, address, updateAddress } = useApp()
 const [step, setStep] = useState(0) // 0: Method, 1: Details/Selection
 const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery")
 const [tempAddress, setTempAddress] = useState(address)
 const [mapError, setMapError] = useState<string | null>(null)

 if (!isAddressModalOpen) return null

 const handleClose = () => {
  setAddressModalOpen(false)
  setStep(0)
  setMapError(null)
 }

 const handleSave = () => {
  updateAddress(tempAddress)
  handleClose()
 }

 return (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
   {/* Overlay */}
   <div
    className="absolute inset-0 bg-smusl-brown/40 backdrop-blur-sm transition-opacity duration-300"
    onClick={handleClose}
   />

   {/* Modal Container */}
   <div className="relative bg-white w-full max-w-[900px] min-h-[600px] rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col md:flex-row transition-all">

    {/* Left Side: Illustration or Visual (matching screenshot style) */}
    <div className="hidden md:flex w-[260px] bg-smusl-clay p-8 flex-col justify-center items-center gap-6 border-r border-smusl-light-gray/50">
     <div className="w-36 h-36 rounded-full bg-white flex items-center justify-center shadow-xl">
      {mapError ? (
       <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
        <X className="w-10 h-10 text-red-400" />
       </div>
      ) : deliveryType === "delivery" ? (
       <Truck className="w-20 h-20 text-smusl-terracotta" strokeWidth={1.2} />
      ) : (
       <MapPin className="w-20 h-20 text-smusl-terracotta" strokeWidth={1.2} />
      )}
     </div>
     <div className="space-y-4 text-center px-4">
      <p className={cn(
       "text-[15px] font-[800] leading-relaxed",
       mapError ? "text-red-500/80" : "text-smusl-brown"
      )}>
       {mapError ? mapError : (deliveryType === "delivery" ? "Доставим ваш заказ прямо к двери" : "Заберите заказ в ближайшей пекарне")}
      </p>
      {step > 0 && (
       <button
        onClick={() => setStep(0)}
        className="flex items-center gap-2 mx-auto text-[13px] font-bold text-smusl-terracotta/60 hover:text-smusl-terracotta transition-colors pt-2"
       >
        <ArrowLeft className="w-4 h-4" /> Назад
       </button>
      )}
     </div>
    </div>

    {/* Right Side: Content */}
    <div className="flex-1 p-8 sm:p-10 flex flex-col font-manrope">
     <div className="flex justify-between items-center mb-8">
      <h2 className="text-[24px] font-[800] text-smusl-brown tracking-tight">
       {step === 0 ? "Способ получения" : deliveryType === "delivery" ? "Где вы сейчас?" : "Выберите пункт"}
      </h2>
      <button
       onClick={handleClose}
       className="p-2 hover:bg-smusl-clay rounded-full transition-colors group"
      >
       <X className="w-6 h-6 text-smusl-gray/40 group-hover:text-smusl-brown" />
      </button>
     </div>

     <div className="flex-1 flex flex-col">
      {step === 0 ? (
       <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
        <button
         onClick={() => {
          setDeliveryType("delivery")
          setStep(1)
         }}
         className="w-full p-8 rounded-[2rem] border-2 border-smusl-light-gray hover:border-smusl-terracotta transition-all flex items-center justify-between group bg-smusl-beige/30"
        >
         <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
           <Truck className="w-6 h-6 text-smusl-terracotta" />
          </div>
          <div className="flex flex-col items-start">
           <span className="text-[18px] font-[800] text-smusl-brown">Доставка</span>
           <span className="text-[13px] text-smusl-gray font-medium">Курьером до двери</span>
          </div>
         </div>
         <ChevronRight className="w-6 h-6 text-smusl-terracotta/40 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
         onClick={() => {
          setDeliveryType("pickup")
          setStep(1)
         }}
         className="w-full p-8 rounded-[2rem] border-2 border-smusl-light-gray hover:border-smusl-terracotta transition-all flex items-center justify-between group bg-smusl-beige/30"
        >
         <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
           <MapPin className="w-6 h-6 text-smusl-terracotta" />
          </div>
          <div className="flex flex-col items-start">
           <span className="text-[18px] font-[800] text-smusl-brown">Самовывоз</span>
           <span className="text-[13px] text-smusl-gray font-medium">Бесплатно из пекарни</span>
          </div>
         </div>
         <ChevronRight className="w-6 h-6 text-smusl-terracotta/40 group-hover:translate-x-1 transition-transform" />
        </button>
       </div>
      ) : deliveryType === "delivery" ? (
       <div className="flex-1 flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500">
        <div className="flex-1 min-h-[350px]">
         <MapPicker
          initialAddress={tempAddress}
          onAddressSelect={setTempAddress}
          onError={setMapError}
         />
        </div>

        <button
         onClick={handleSave}
         className="w-full py-5 bg-smusl-terracotta text-white rounded-[1.5rem] font-[800] text-[17px] hover:bg-[#b87a60] transition-all shadow-xl shadow-smusl-terracotta/20 active:scale-95 mb-2"
        >
         Подтвердить адрес
        </button>
       </div>
      ) : (
       <div className="space-y-3 animate-in slide-in-from-right-4 duration-500">
        {[
         { name: "СМЫСЛ есть • Ижорская", addr: "ул. Ижорская, 3" },
         { name: "СМЫСЛ есть • Тверская", addr: "ул. Тверская, 7" },
         { name: "СМЫСЛ есть • Цветной", addr: "Цветной бул., 15" },
        ].map((loc, i) => (
         <button
          key={i}
          onClick={() => {
           updateAddress(loc.addr)
           handleClose()
          }}
          className="w-full p-6 rounded-2xl border-2 border-smusl-light-gray hover:border-smusl-terracotta bg-white flex flex-col items-start transition-all group shadow-sm hover:shadow-md"
         >
          <span className="font-[800] text-[16px] text-smusl-brown mb-1">{loc.name}</span>
          <span className="text-[14px] text-smusl-gray font-medium">{loc.addr}</span>
         </button>
        ))}
       </div>
      )}
     </div>
    </div>
   </div>
  </div>
 )
}
