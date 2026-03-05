"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/store/AppContext"
import { X, ShoppingBag, Heart } from "lucide-react"

export default function ProductDetailsModal() {
 const { selectedProduct, setSelectedProduct, addToCart } = useApp()
 const [qty, setQty] = useState(1)

 const handleClose = () => {
  setSelectedProduct(null)
  setQty(1)
 }

 const handleAdd = () => {
  if (!selectedProduct) return
  for (let i = 0; i < qty; i++) addToCart(selectedProduct)
  handleClose()
 }

 return (
  <AnimatePresence>
   {selectedProduct && (
    <>
     {/* Overlay */}
     <motion.div
      key="overlay"
      className="fixed inset-0 z-[100] bg-[#4A403A]/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={handleClose}
     />

     {/* Right-side drawer */}
     <motion.div
      key="modal"
      className="fixed inset-y-0 right-0 z-[110] flex items-stretch"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
     >
      <div className="relative bg-white shadow-2xl w-[min(680px,100vw)] h-full overflow-y-auto flex flex-col font-montserrat">

       {/* Close button */}
       <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-[#F2F0EC] transition-colors"
       >
        <X className="w-5 h-5 text-[#4A403A]/50" />
       </button>

       {/* Image */}
       <div className="w-full bg-[#EBE7E2] overflow-hidden aspect-[16/9] relative shrink-0 group">
        <motion.img
         src={selectedProduct.image}
         alt={selectedProduct.name}
         className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
         initial={{ scale: 0.95, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.button
         whileHover={{ scale: 1.15 }}
         whileTap={{ scale: 0.85, rotate: -10 }}
         className="absolute top-5 right-5 h-10 w-10 rounded-full bg-white/90 backdrop-blur-md shadow-xl flex items-center justify-center text-[#D8D8D8] hover:text-[#CF8F73] transition-colors z-10"
        >
         <Heart className="w-5 h-5 fill-current" />
        </motion.button>
       </div>

       {/* Content */}
       <div className="flex flex-col p-6 sm:p-8 gap-6 flex-1">

        {/* Name + weight */}
        <div>
         <h1 className="text-[24px] sm:text-[28px] font-bold text-[#4A403A] leading-[1.1] mb-1">
          {selectedProduct.name}
         </h1>
         <p className="text-[14px] font-medium text-[#4A403A]/40">
          {selectedProduct.weight}
         </p>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
         <span className="px-5 py-2.5 bg-[#CF8F73] text-white text-[18px] sm:text-[20px] font-bold rounded-[1rem] shadow-sm shadow-[#CF8F73]/20">
          {selectedProduct.price} Р/шт
         </span>
         <span className="text-[12px] font-medium text-[#4A403A]/40">в наличии 31 шт</span>
        </div>

        {/* Quantity + Add to cart row */}
        <div className="flex items-center gap-4">
         <div className="flex items-center gap-5 bg-[#FDF4EE] rounded-[1rem] px-5 py-3">
          <button
           onClick={() => setQty(q => Math.max(1, q - 1))}
           className="text-[24px] font-light text-[#CF8F73] leading-none w-6 text-center hover:opacity-70 transition-opacity"
          >−</button>
          <span className="text-[18px] font-bold text-[#4A403A] min-w-[20px] text-center">{qty}</span>
          <button
           onClick={() => setQty(q => q + 1)}
           className="text-[24px] font-light text-[#CF8F73] leading-none w-6 text-center hover:opacity-70 transition-opacity"
          >+</button>
         </div>

         <button
          onClick={handleAdd}
          className="flex-1 h-[56px] bg-[#CF8F73] text-white rounded-[1rem] font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-[#CF8F73]/20 hover:bg-[#b87a60] transition-all active:scale-95"
         >
          <ShoppingBag className="w-5 h-5" />
          Добавить в корзину
         </button>
        </div>

        {/* Nutrition */}
        {selectedProduct.nutrition && (
         <div className="w-full bg-[#FEF4E8] rounded-[1.5rem] p-5 sm:p-6">
          <p className="text-[11px] sm:text-[12px] font-black text-[#CF8F73] uppercase tracking-[0.15em] mb-4">
           на 100 грамм
          </p>
          <div className="grid grid-cols-4 gap-4">
           {[
            { label: "Ккал/кДж", val: selectedProduct.nutrition.kcal },
            { label: "Белки, г", val: selectedProduct.nutrition.proteins },
            { label: "Жиры, г", val: selectedProduct.nutrition.fats },
            { label: "Углеводы, г", val: selectedProduct.nutrition.carbs },
           ].map((n, i) => (
            <div key={i} className="flex flex-col gap-1">
             <span className="text-[18px] sm:text-[22px] font-black text-[#CF8F73] leading-none">{n.val}</span>
             <span className="text-[9px] sm:text-[10px] font-bold text-[#CF8F73]/40 uppercase leading-tight">{n.label}</span>
            </div>
           ))}
          </div>
         </div>
        )}

        {/* Description */}
        {selectedProduct.description && (
         <div>
          <h3 className="text-[17px] font-bold text-[#4A403A] mb-2">Описание</h3>
          <p className="text-[14px] text-[#4A403A]/70 leading-[1.7] font-medium">
           {selectedProduct.description}
          </p>
         </div>
        )}

        {/* Composition */}
        {selectedProduct.composition && (
         <div className="pb-2">
          <h3 className="text-[17px] font-bold text-[#4A403A] mb-2">Состав</h3>
          <p className="text-[13px] text-[#4A403A]/50 leading-[1.6] font-medium">
           {selectedProduct.composition}
          </p>
         </div>
        )}

       </div>
      </div>
     </motion.div>
    </>
   )}
  </AnimatePresence>
 )
}
