"use client"

import React, { useState } from "react"
import { motion, AnimatePresence, useDragControls } from "framer-motion"
import { X, ShoppingBag, Heart } from "lucide-react"
import Image from "next/image"
import { useUIStore, useCartStore, useUserStore } from "@/store/hooks"

export default function ProductDetailsModal() {
 const selectedProduct = useUIStore(s => s.selectedProduct)
 const setSelectedProduct = useUIStore(s => s.setSelectedProduct)

 const favorites = useUserStore(s => s.favorites)
 const toggleFavorite = useUserStore(s => s.toggleFavorite)

 const addToCart = useCartStore(s => s.addToCart)

 const [quantity, setQuantity] = useState(1)

 // Only allow drag from the handle bar — prevents scroll conflicts
 const dragControls = useDragControls()

 const handleClose = () => {
  setSelectedProduct(null)
  setQuantity(1)
 }

 const handleAddToCart = () => {
  if (!selectedProduct) return
  addToCart(selectedProduct, quantity)
  handleClose()
 }

 const decrement = () => setQuantity(q => Math.max(1, q - 1))
 const increment = () => setQuantity(q => q + 1)

 const renderContent = (isMobile: boolean = false) => {
  if (!selectedProduct) return null
  const isFavorite = Array.isArray(favorites) && favorites.includes(selectedProduct.id)

  return (
   <>
    <div className="w-full bg-white sm:bg-[#EBE7E2] overflow-hidden aspect-[4/3] sm:aspect-[16/9] relative shrink-0 flex items-center justify-center group sm:rounded-t-none">

     {selectedProduct.image ? (
      <motion.div
       className="relative w-full h-full"
       initial={{ scale: 1.05, opacity: 0 }}
       animate={{ scale: 1, opacity: 1 }}
       transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
       <Image
        src={selectedProduct.image}
        alt={selectedProduct.name}
        fill
        sizes="(max-width: 640px) 100vw, 680px"
        className="object-cover"
        priority
       />
       {/* Soft gradient fade into white content below */}
       <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/60 to-transparent pointer-events-none" />
      </motion.div>
     ) : (
      <div className="w-full h-full bg-[#EBE7E2]" />
     )}

     <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClose}
      className={`absolute top-4 left-4 sm:top-5 sm:left-5 h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-[#4A403A]/10 shadow-md flex items-center justify-center transition-all z-20 ${isMobile ? "bg-white/40 backdrop-blur-md text-[#4A403A]" : "bg-[#EBE7E2]/50 text-[#4A403A] hover:bg-white"}`}
     >
      <X className="w-5 h-5 sm:w-6 sm:h-6" />
     </motion.button>

     <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9, rotate: -15 }}
      onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedProduct.id); }}
      className={`absolute top-4 right-4 sm:top-5 sm:right-5 h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-[#4A403A]/10 shadow-md hidden sm:flex items-center justify-center transition-all z-20 ${isFavorite ? "bg-[#e94e4e] text-white" : (isMobile ? "bg-white/40 backdrop-blur-md text-[#4A403A]/40" : "bg-[#EBE7E2]/50 text-[#4A403A]/40 hover:text-[#CF8F73] hover:bg-white")}`}
     >
      <Heart className="w-5 h-5 sm:w-6 sm:h-6" fill={isFavorite ? "currentColor" : "none"} />
     </motion.button>
    </div>

    <div className="flex flex-col p-6 sm:p-10 gap-6 sm:gap-8 flex-1 pb-10 sm:pb-12 bg-white select-none">
     <div className="space-y-1">
      <h1 className="text-[28px] sm:text-[42px] font-black text-[#4A403A] leading-[1.1] tracking-tighter">
       {selectedProduct.name}
      </h1>
      <div className="flex items-center gap-2">
       <span className="text-[14px] sm:text-[16px] font-bold text-[#4A403A]/40 uppercase tracking-widest">{selectedProduct.weight}</span>
       {selectedProduct.quantity != null && (
        <>
         <span className="w-1.5 h-1.5 rounded-full bg-[#4A403A]/10" />
         <span className="text-[13px] sm:text-[14px] font-bold text-[#CF8F73]">В наличии {selectedProduct.quantity} шт</span>
        </>
       )}
      </div>
     </div>

     <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex items-center gap-3 sm:gap-5">
       <span className="shrink-0 h-[56px] sm:h-[72px] px-5 sm:px-7 flex items-center justify-center bg-[#CF8F73] text-white text-[20px] sm:text-[26px] font-black rounded-[1.2rem] shadow-lg shadow-[#CF8F73]/20 whitespace-nowrap">
        {selectedProduct.price} ₽
       </span>

       <div className="flex-1 sm:flex-none flex items-center justify-between sm:justify-center h-[56px] sm:h-[72px] sm:gap-6 bg-[#FDF4EE] rounded-[1.2rem] px-5 sm:px-8 border border-[#CF8F73]/5">
        <button onClick={decrement} className="text-[22px] sm:text-[28px] font-light text-[#CF8F73] leading-none hover:opacity-100 opacity-60 transition-opacity w-6 flex items-center justify-center">−</button>
        <span className="text-[17px] sm:text-[22px] font-black text-[#4A403A] min-w-[20px] text-center tabular-nums">{quantity}</span>
        <button onClick={increment} className="text-[22px] sm:text-[28px] font-light text-[#CF8F73] leading-none hover:opacity-100 opacity-60 transition-opacity w-6 flex items-center justify-center">+</button>
       </div>

       <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleAddToCart}
        className="hidden sm:flex flex-1 h-[64px] sm:h-[72px] bg-gradient-to-br from-[#DF997E] to-[#CD8B70] text-white rounded-[1.2rem] font-black text-[17px] items-center justify-center gap-3 shadow-[0_20px_40px_-12px_rgba(223,153,126,0.25)] transition-all duration-500 select-none touch-manipulation"
       >
        <ShoppingBag className="w-6 h-6 shrink-0 drop-shadow-md" />
        <span className="tracking-tight uppercase tracking-[0.05em] drop-shadow-md">Добавить в корзину</span>
       </motion.button>
      </div>

      <motion.button
       whileTap={{ scale: 0.98 }}
       onClick={handleAddToCart}
       className="sm:hidden w-full h-[56px] bg-gradient-to-br from-[#DF997E] to-[#CD8B70] text-white rounded-[1.2rem] font-black text-[15px] flex items-center justify-center gap-2.5 shadow-[0_20px_40px_-12px_rgba(223,153,126,0.25)] transition-all duration-500 select-none touch-manipulation"
      >
       <ShoppingBag className="w-5 h-5 shrink-0 drop-shadow-md" />
       <span className="uppercase tracking-[0.05em] drop-shadow-md">Добавить в корзину</span>
      </motion.button>
     </div>

     {selectedProduct.nutrition && (
      <div className="w-full bg-[#FEF4E8] rounded-[2rem] p-6 sm:p-8 border border-[#CF8F73]/5">
       <span className="text-[10px] sm:text-[11px] font-black text-[#CF8F73]/50 uppercase tracking-[0.2em] block mb-4">
        Энергетическая ценность / 100г
       </span>
       <div className="grid grid-cols-4 gap-4 sm:gap-6">
        {[
         { label: "Ккал", val: selectedProduct.nutrition.kcal },
         { label: "Белки", val: selectedProduct.nutrition.proteins },
         { label: "Жиры", val: selectedProduct.nutrition.fats },
         { label: "Угл.", val: selectedProduct.nutrition.carbs },
        ].map((n, i) => (
         <div key={i} className="flex flex-col gap-0.5">
          <span className="text-[18px] sm:text-[24px] font-black text-[#CF8F73] leading-none">{n.val}</span>
          <span className="text-[9px] sm:text-[11px] font-bold text-[#CF8F73]/60 uppercase tracking-tighter leading-tight">{n.label}</span>
         </div>
        ))}
       </div>
      </div>
     )}

     <div className="grid gap-6 sm:gap-8">
      {selectedProduct.description && (
       <div className="space-y-2">
        <h3 className="text-[14px] sm:text-[16px] font-black text-[#4A403A]/20 uppercase tracking-[0.15em]">Описание</h3>
        <p className="text-[15px] sm:text-[17px] text-[#4A403A]/80 leading-relaxed font-bold tracking-tight">
         {selectedProduct.description}
        </p>
       </div>
      )}

      {selectedProduct.composition && (
       <div className="space-y-2">
        <h3 className="text-[14px] sm:text-[16px] font-black text-[#4A403A]/20 uppercase tracking-[0.15em]">Состав</h3>
        <p className="text-[13px] sm:text-[14px] text-[#4A403A]/50 leading-relaxed font-bold">
         {selectedProduct.composition}
        </p>
       </div>
      )}
     </div>
    </div>
   </>
  )
 }

 return (
  <AnimatePresence>
   {selectedProduct && (
    <>
     <motion.div
      key="overlay"
      className="fixed inset-0 z-[200] bg-[#3A332E]/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleClose}
     />

     {/* Mobile bottom sheet — drag ONLY from handle to avoid scroll conflicts */}
     <motion.div
      key="modal-mobile"
      className="fixed inset-x-0 bottom-0 z-[210] sm:hidden flex flex-col"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 26, stiffness: 260, mass: 0.8 }}
      drag="y"
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0 }}
      dragElastic={0.1}
      onDragEnd={(_, info) => {
       if (info.offset.y > 80 || info.velocity.y > 400) {
        handleClose()
       }
      }}
      style={{ maxHeight: '96dvh' }}
     >

      {/* Bottom extension for Safari safety, blocks anything from bleeding through under modal */}
      <div className="absolute top-[95%] left-0 right-0 h-[100vh] bg-white pointer-events-none sm:hidden" />
      <div className="relative bg-white rounded-t-[2.5rem] shadow-2xl w-full flex flex-col overflow-hidden font-manrope">

       <div
        className="w-full pt-4 pb-3 flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: 'none' }}
        onPointerDown={(e) => {
         e.preventDefault()
         dragControls.start(e)
        }}
       >
        <div className="w-10 h-[5px] rounded-full bg-[#4A403A]/15" />
       </div>

       {/* ── Scrollable content — free from drag interference ── */}
       <div
        className="flex-1 overflow-y-auto no-scrollbar bg-white"
        style={{
         touchAction: 'pan-y',
         WebkitOverflowScrolling: 'touch',
         paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))',
        }}
       >
        {renderContent(true)}
       </div>
      </div>
     </motion.div>

     {/* Desktop side panel */}
     <motion.div
      key="modal-desktop"
      className="fixed inset-y-0 right-0 z-[210] hidden sm:flex items-stretch"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 280, mass: 1 }}
     >
      <div className="relative bg-white shadow-2xl w-[min(680px,100vw)] h-full overflow-y-auto flex flex-col font-manrope">
       {renderContent(false)}
      </div>
     </motion.div>
    </>
   )}
  </AnimatePresence>
 )
}
