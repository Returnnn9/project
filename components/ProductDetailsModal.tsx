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
     <motion.div
      key="overlay"
      className="fixed inset-0 z-[100] bg-[#4A403A]/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={handleClose}
     />

     <motion.div
      key="modal"
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
     >
      <motion.div
       className="relative bg-white rounded-[1.75rem] shadow-2xl w-full max-w-[1200px] overflow-hidden font-montserrat h-screen md:h-[98vh] flex flex-col md:flex-row"
       initial={{ scale: 0.94, y: 20, opacity: 0 }}
       animate={{ scale: 1, y: 0, opacity: 1 }}
       exit={{ scale: 0.94, y: 20, opacity: 0 }}
       transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >

       <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-[#F2F0EC] transition-colors"
       >
        <X className="w-5 h-5 text-[#4A403A]/50" />
       </button>

       {/* ── MAIN CONTENT: Split into two columns ── */}
       <div className="flex flex-col md:flex-row w-full h-full">

        {/* LEFT COLUMN: Image + Details (Scrollable) */}
        <div className="w-full md:w-[60%] h-full overflow-y-auto p-5 sm:p-7 md:p-10 flex flex-col gap-10">
         {/* Image */}
         <div className="w-full rounded-[1.5rem] bg-[#EBE7E2] overflow-hidden aspect-[1.1/1] relative group">
          <motion.img
           src={selectedProduct.image}
           alt={selectedProduct.name}
           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* Heart Button */}
          <motion.button
           whileHover={{ scale: 1.15 }}
           whileTap={{ scale: 0.85, rotate: -10 }}
           className="absolute top-6 right-6 h-11 w-11 rounded-full bg-white/90 backdrop-blur-md shadow-xl flex items-center justify-center text-[#D8D8D8] hover:text-[#CF8F73] transition-colors z-10"
          >
           <Heart className="w-6 h-6 fill-current" />
          </motion.button>
         </div>

         {/* Details below image */}
         <div className="flex flex-col gap-10">
          {/* Description */}
          {selectedProduct.description && (
           <div>
            <h3 className="text-[20px] sm:text-[24px] font-bold text-[#4A403A] mb-4">Описание</h3>
            <p className="text-[15px] sm:text-[17px] text-[#4A403A]/70 leading-[1.7] font-medium">
             {selectedProduct.description}
            </p>
           </div>
          )}

          {/* Composition */}
          {selectedProduct.composition && (
           <div className="pb-6">
            <h3 className="text-[20px] sm:text-[24px] font-bold text-[#4A403A] mb-4">Состав</h3>
            <p className="text-[14px] sm:text-[15px] text-[#4A403A]/50 leading-[1.6] font-medium">
             {selectedProduct.composition}
            </p>
           </div>
          )}
         </div>
        </div>

        {/* RIGHT COLUMN: Purchase Info */}
        <div className="w-full md:w-[40%] h-full overflow-y-auto p-5 sm:p-7 md:p-8 flex flex-col items-start gap-4">
         <div className="w-full">
          <h1 className="text-[24px] sm:text-[32px] font-bold text-[#4A403A] leading-[1.1] mb-1.5">
           {selectedProduct.name}
          </h1>
          <p className="text-[15px] font-medium text-[#4A403A]/40 mb-6">
           {selectedProduct.weight}
          </p>

          <div className="flex flex-col items-start gap-2 mb-8">
           <span className="px-6 py-2.5 bg-[#CF8F73] text-white text-[18px] sm:text-[20px] font-bold rounded-[1rem] shadow-sm shadow-[#CF8F73]/20 whitespace-nowrap">
            {selectedProduct.price} Р/шт
           </span>
           <span className="text-[12px] font-medium text-[#4A403A]/40 pl-1">
            в наличии 31 шт
           </span>
          </div>

          {/* Quantity Stepper */}
          <div className="flex items-center gap-6 bg-[#FDF4EE] rounded-[1rem] px-6 py-3 mb-4 w-fit">
           <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="text-[28px] font-light text-[#CF8F73] leading-none w-6 text-center hover:opacity-70 transition-opacity"
           >
            −
           </button>
           <span className="text-[20px] font-bold text-[#4A403A] min-w-[20px] text-center">{qty}</span>
           <button
            onClick={() => setQty(q => q + 1)}
            className="text-[28px] font-light text-[#CF8F73] leading-none w-6 text-center hover:opacity-70 transition-opacity"
           >
            +
           </button>
          </div>

          {/* Add to cart button */}
          <button
           onClick={handleAdd}
           className="w-full h-[90px] bg-[#CF8F73] text-white rounded-[1rem] font-bold text-[16px] sm:text-[17px] flex items-center justify-center gap-3 shadow-lg shadow-[#CF8F73]/20 hover:bg-[#b87a60] transition-all mb-8"
          >
           <ShoppingBag className="w-9 h-9" />
           Добавить в корзину
          </button>

          {/* Nutrition Block */}
          {selectedProduct.nutrition && (
           <div className="w-full bg-[#FEF4E8] rounded-[1.5rem] p-5 sm:p-6 mb-4">
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
         </div>
        </div>
       </div>
      </motion.div>
     </motion.div>
    </>
   )}
  </AnimatePresence>
 )
}
