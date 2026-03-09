"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingBag, Heart } from "lucide-react"
import { useApp } from "@/store/AppContext"

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProductDetailsModal() {
 const { selectedProduct, setSelectedProduct, addToCart, favorites, toggleFavorite } = useApp()
 const [quantity, setQuantity] = useState(1)

 const handleClose = () => {
  setSelectedProduct(null)
  setQuantity(1)
 }

 const handleAddToCart = () => {
  if (!selectedProduct) return
  for (let i = 0; i < quantity; i++) addToCart(selectedProduct)
  handleClose()
 }

 const decrement = () => setQuantity(q => Math.max(1, q - 1))
 const increment = () => setQuantity(q => q + 1)

 const renderContent = () => {
  if (!selectedProduct) return null
  const isFavorite = favorites.includes(selectedProduct.id)

  return (
   <>
    {/* Image & Buttons */}
    <div className="w-full bg-[#EBE7E2] overflow-hidden aspect-[4/3] sm:aspect-[16/9] relative shrink-0 flex items-center justify-center group">
     {selectedProduct.image ? (
      <motion.img
       src={selectedProduct.image}
       alt={selectedProduct.name}
       className="w-full h-full object-cover sm:transition-transform sm:duration-700 sm:group-hover:scale-105"
       initial={{ scale: 0.95, opacity: 0 }}
       animate={{ scale: 1, opacity: 1 }}
       transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      />
     ) : (
      <div className="w-full h-full bg-[#EBE7E2]" />
     )}

     {/* Close Button */}
     <button
      onClick={handleClose}
      className="absolute top-4 left-4 sm:top-5 sm:left-5 h-10 w-10 rounded-full bg-white/90 backdrop-blur-md shadow-xl flex items-center justify-center text-[#4A403A] hover:bg-[#FDF4EE] transition-colors z-10"
     >
      <X className="w-5 h-5 sm:w-6 sm:h-6" />
     </button>

     {/* Favorite Button */}
     <button
      onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedProduct.id); }}
      className={`absolute top-4 right-4 sm:top-5 sm:right-5 h-10 w-10 rounded-full bg-white/90 backdrop-blur-md shadow-xl flex items-center justify-center transition-colors z-10 ${isFavorite ? "text-[#e94e4e]" : "text-[#D8D8D8] hover:text-[#CF8F73]"
       }`}
     >
      <Heart className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
     </button>
    </div>

    {/* Content */}
    <div className="flex flex-col p-5 sm:p-8 gap-5 sm:gap-6 flex-1 pb-8 sm:pb-8">
     {/* Name + weight */}
     <div>
      <h1 className="text-[24px] sm:text-[32px] font-bold text-[#4A403A] leading-[1.1] mb-1">
       {selectedProduct.name}
      </h1>
      <p className="text-[14px] sm:text-[16px] font-medium text-[#4A403A]/60">{selectedProduct.weight}</p>
     </div>

     {/* Price */}
     <div className="flex items-center gap-3">
      <span className="px-5 sm:px-6 py-2.5 sm:py-3 bg-[#CF8F73] text-white text-[19px] sm:text-[24px] font-bold rounded-[1rem] shadow-sm shadow-[#CF8F73]/20">
       {selectedProduct.price} ₽/шт
      </span>
      <span className="text-[13px] sm:text-[14px] font-medium text-[#4A403A]/50">в наличии 31 шт</span>
     </div>

     {/* Quantity + Add */}
     <div className="flex items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-4 sm:gap-6 bg-[#FDF4EE] rounded-[1rem] sm:rounded-[1.2rem] px-5 sm:px-6 py-3 sm:py-3.5">
       <button
        onClick={decrement}
        className="text-[24px] sm:text-[28px] font-light text-[#CF8F73] leading-none w-6 text-center hover:opacity-70 transition-opacity"
       >
        −
       </button>
       <span className="text-[19px] sm:text-[20px] font-bold text-[#4A403A] min-w-[20px] sm:min-w-[24px] text-center">
        {quantity}
       </span>
       <button
        onClick={increment}
        className="text-[24px] sm:text-[28px] font-light text-[#CF8F73] leading-none w-6 text-center hover:opacity-70 transition-opacity"
       >
        +
       </button>
      </div>

      <button
       onClick={handleAddToCart}
       className="flex-1 h-[56px] sm:h-[68px] bg-[#CF8F73] text-white rounded-[1.2rem] font-semibold text-[16px] sm:text-[18px] flex items-center justify-center gap-2 sm:gap-3 shadow-lg shadow-[#CF8F73]/20 hover:bg-[#b87a60] transition-all active:scale-95"
      >
       <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
       Добавить в корзину
      </button>
     </div>

     {/* Nutrition */}
     {selectedProduct.nutrition && (
      <div className="w-full bg-[#FEF4E8] rounded-[1.5rem] p-4 sm:p-6">
       <p className="text-[10px] sm:text-[12px] font-black text-[#CF8F73] uppercase tracking-[0.15em] mb-3 sm:mb-4">
        на 100 грамм
       </p>
       <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {[
         { label: "Ккал/кДж", val: selectedProduct.nutrition.kcal },
         { label: "Белки, г", val: selectedProduct.nutrition.proteins },
         { label: "Жиры, г", val: selectedProduct.nutrition.fats },
         { label: "Углеводы, г", val: selectedProduct.nutrition.carbs },
        ].map((n, i) => (
         <div key={i} className="flex flex-col gap-0.5 sm:gap-1">
          <span className="text-[16px] sm:text-[22px] font-black text-[#CF8F73] leading-none">{n.val}</span>
          <span className="text-[8px] sm:text-[10px] font-bold text-[#CF8F73]/40 uppercase leading-tight">{n.label}</span>
         </div>
        ))}
       </div>
      </div>
     )}

     {/* Description */}
     {selectedProduct.description && (
      <div>
       <h3 className="text-[17px] sm:text-[20px] font-bold text-[#4A403A] mb-1.5 sm:mb-2">Описание</h3>
       <p className="text-[14px] sm:text-[16px] text-[#4A403A]/80 leading-[1.6] sm:leading-[1.7] font-medium">
        {selectedProduct.description}
       </p>
      </div>
     )}

     {/* Composition */}
     {selectedProduct.composition && (
      <div className="pb-0 sm:pb-2">
       <h3 className="text-[17px] sm:text-[20px] font-bold text-[#4A403A] mb-1.5 sm:mb-2">Состав</h3>
       <p className="text-[13px] sm:text-[15px] text-[#4A403A]/60 leading-[1.5] sm:leading-[1.6] font-medium">
        {selectedProduct.composition}
       </p>
      </div>
     )}
    </div>
   </>
  )
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

     {/* Mobile: bottom sheet */}
     <motion.div
      key="modal-mobile"
      className="fixed inset-x-0 bottom-0 z-[110] sm:hidden"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
     >
      <div className="relative bg-white rounded-t-[2rem] shadow-2xl w-full max-h-[92dvh] overflow-y-auto flex flex-col font-montserrat">
       {/* Drag handle */}
       <div className="sticky top-0 z-20 flex justify-center pt-3 pb-1 bg-white/80 backdrop-blur-sm">
        <div className="w-10 h-1 rounded-full bg-[#4A403A]/15" />
       </div>
       {renderContent()}
      </div>
     </motion.div>

     {/* Desktop: right drawer */}
     <motion.div
      key="modal-desktop"
      className="fixed inset-y-0 right-0 z-[110] hidden sm:flex items-stretch"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
     >
      <div className="relative bg-white shadow-2xl w-[min(680px,100vw)] h-full overflow-y-auto flex flex-col font-montserrat">
       {renderContent()}
      </div>
     </motion.div>
    </>
   )}
  </AnimatePresence>
 )
}
