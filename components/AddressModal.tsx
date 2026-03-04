"use client"

import React, { useState } from "react"
import { useApp } from "@/store/AppContext"
import { X, MapPin, Truck, ChevronRight } from "lucide-react"

export default function AddressModal() {
 const { isAddressModalOpen, setAddressModalOpen, address, updateAddress } = useApp()
 const [step, setStep] = useState(0) // 0: Method, 1: Details/Selection
 const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery")

 if (!isAddressModalOpen) return null

 const handleClose = () => {
  setAddressModalOpen(false)
  setStep(0)
 }

 return (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
   {/* Overlay */}
   <div
    className="absolute inset-0 bg-smusl-brown/40 backdrop-blur-sm transition-opacity duration-300"
    onClick={handleClose}
   />

   {/* Modal Container */}
   <div className="relative bg-white w-full max-w-[600px] rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col md:flex-row">

    {/* Left Side: Illustration or Visual (matching screenshot style) */}
    <div className="hidden md:flex w-[240px] bg-smusl-clay p-8 flex-col justify-center items-center gap-4 border-r border-smusl-light-gray">
     <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-lg">
      {deliveryType === "delivery" ? (
       <Truck className="w-16 h-16 text-smusl-terracotta" />
      ) : (
       <MapPin className="w-16 h-16 text-smusl-terracotta" />
      )}
     </div>
     <p className="text-[14px] font-bold text-smusl-brown text-center leading-relaxed">
      {deliveryType === "delivery" ? "Доставим ваш заказ прямо к двери" : "Заберите заказ в ближайшей пекарне"}
     </p>
    </div>

    {/* Right Side: Content */}
    <div className="flex-1 p-10 flex flex-col font-montserrat">
     <div className="flex justify-between items-center mb-8">
      <h2 className="text-[22px] font-black text-smusl-brown">
       {step === 0 ? "Способ получения" : deliveryType === "delivery" ? "Введите адрес" : "Выберите пункт"}
      </h2>
      <button
       onClick={handleClose}
       className="p-2 hover:bg-smusl-clay rounded-full transition-colors"
      >
       <X className="w-6 h-6 text-smusl-gray/60" />
      </button>
     </div>

     <div className="flex-1">
      {step === 0 ? (
       <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
        <button
         onClick={() => {
          setDeliveryType("delivery")
          setStep(1)
         }}
         className="w-full p-6 rounded-[1.5rem] border-2 border-smusl-light-gray hover:border-smusl-terracotta transition-all flex items-center justify-between group bg-smusl-beige/30"
        >
         <div className="flex items-center gap-4">
          <Truck className="w-6 h-6 text-smusl-terracotta" />
          <span className="font-bold text-smusl-brown">Доставка</span>
         </div>
         <ChevronRight className="w-5 h-5 text-smusl-gray group-hover:translate-x-1 transition-transform" />
        </button>

        <button
         onClick={() => {
          setDeliveryType("pickup")
          setStep(1)
         }}
         className="w-full p-6 rounded-[1.5rem] border-2 border-smusl-light-gray hover:border-smusl-terracotta transition-all flex items-center justify-between group bg-smusl-beige/30"
        >
         <div className="flex items-center gap-4">
          <MapPin className="w-6 h-6 text-smusl-terracotta" />
          <span className="font-bold text-smusl-brown">Самовывоз</span>
         </div>
         <ChevronRight className="w-5 h-5 text-smusl-gray group-hover:translate-x-1 transition-transform" />
        </button>
       </div>
      ) : deliveryType === "delivery" ? (
       <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
        <div className="grid grid-cols-1 gap-4">
         <div className="space-y-1">
          <label className="text-[12px] font-bold text-smusl-gray/60 uppercase ml-2">Улица</label>
          <input
           type="text"
           defaultValue="Ижорская"
           className="w-full py-4 px-6 bg-smusl-beige rounded-2xl border border-transparent focus:border-smusl-terracotta focus:bg-white transition-all text-[15px] font-medium outline-none"
          />
         </div>
         <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
           <label className="text-[12px] font-bold text-smusl-gray/60 uppercase ml-2">Дом</label>
           <input
            type="text"
            defaultValue="3"
            className="w-full py-4 px-6 bg-smusl-beige rounded-2xl border border-transparent focus:border-smusl-terracotta focus:bg-white transition-all text-[15px] font-medium outline-none"
           />
          </div>
          <div className="space-y-1">
           <label className="text-[12px] font-bold text-smusl-gray/60 uppercase ml-2">Кв.</label>
           <input
            type="text"
            className="w-full py-4 px-6 bg-smusl-beige rounded-2xl border border-transparent focus:border-smusl-terracotta focus:bg-white transition-all text-[15px] font-medium outline-none"
           />
          </div>
         </div>
        </div>

        <button
         onClick={handleClose}
         className="w-full mt-6 py-5 bg-smusl-terracotta text-white rounded-[1.2rem] font-bold text-[16px] hover:bg-[#b87a60] transition-all shadow-xl shadow-smusl-terracotta/10 active:scale-95"
        >
         Сохранить адрес
        </button>
       </div>
      ) : (
       <div className="space-y-3 animate-in slide-in-from-right-4 duration-300">
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
          className="w-full p-5 rounded-2xl border border-smusl-light-gray hover:border-smusl-terracotta bg-white flex flex-col items-start transition-all group"
         >
          <span className="font-bold text-smusl-brown mb-1">{loc.name}</span>
          <span className="text-[13px] text-smusl-gray">{loc.addr}</span>
         </button>
        ))}
       </div>
      )}
     </div>

     {step > 0 && (
      <button
       onClick={() => setStep(0)}
       className="mt-6 text-[14px] font-bold text-smusl-terracotta hover:underline"
      >
       Изменить способ
      </button>
     )}
    </div>
   </div>
  </div>
 )
}
