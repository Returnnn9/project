"use client"

import React from "react"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useUIStore, useCartStore, useUserStore } from "@/store/hooks"
import { cn } from "@/lib/utils"

interface CartSidebarProps {
 isMobile?: boolean
 onClose?: () => void
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isMobile = false, onClose }) => {
 const cart = useCartStore(s => s.cart)
 const updateQuantity = useCartStore(s => s.updateQuantity)
 const address = useUserStore(s => s.address)
 const setCheckoutOpen = useUIStore(s => s.setCheckoutOpen)

 const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

 return (
  <div className={`flex flex-col ${isMobile ? "h-full" : "h-[calc(100dvh-8rem)]"} ${!isMobile ? "bg-gradient-to-b from-[#FDF8ED] to-[#F5E6DA] rounded-[2.5rem] shadow-2xl border border-white/20 p-6" : ""} font-manrope overflow-hidden`}>

   {/* Header Area */}
   <div className={`flex items-center justify-between shrink-0 ${isMobile ? "mb-4 pt-1" : "mb-6"}`}>
    <div className="flex flex-col min-w-0 w-full">
     <span className="text-[10px] sm:text-[12px] font-bold text-[#CF8D72] uppercase tracking-[0.2em] mb-1">Ваша корзина</span>
     <h2 className="flex items-center gap-2 min-w-0">
      <span className="w-2 h-2 rounded-full bg-[#CF8D72] animate-pulse shrink-0" />
      <span className={cn(
       "font-extrabold text-[#4A423D] leading-tight max-w-full",
       isMobile ? "text-[17px]" : "text-[20px]"
      )} title={address || "Адрес не выбран"}>
       {address || "Адрес не выбран"}
      </span>
     </h2>
    </div>
   </div>

   {/* Items List */}
   <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
    {cart.length === 0 ? (
     <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full flex flex-col items-center justify-center text-center px-6"
     >
      <motion.div
       animate={{ y: [0, -10, 0] }}
       transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
       className="w-24 h-24 mb-6 rounded-full bg-[#EBE7E2]/50 flex items-center justify-center shadow-inner"
      >
       <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#CF8D72]/40">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
       </svg>
      </motion.div>
      <h3 className="text-[22px] font-black text-[#4A423D]/80 mb-3 tracking-tight">Корзина пуста</h3>
      <p className="text-[14px] text-[#8D8681] font-medium leading-[1.6] max-w-[240px]">
       Ваши будущие сладости появятся здесь. Давайте что-нибудь выберем!
      </p>
     </motion.div>
    ) : (
     <div className="flex flex-col gap-4">
      <AnimatePresence mode="popLayout">
       {cart.map((item, index) => (
        <motion.div
         key={item.id}
         layout="position"
         initial={{ opacity: 0, y: 20, scale: 0.98 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         exit={{ opacity: 0, x: -100, scale: 0.9, transition: { duration: 0.2 } }}
         whileTap={isMobile ? { scale: 0.98 } : {}}
         transition={{ type: "spring", stiffness: 350, damping: 25, delay: Math.min(index, 4) * 0.05 }}
         className="relative group shrink-0"
        >
          <div
           className="bg-[#FCF5EF] border border-[#4A403A]/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[2.5rem] p-3 flex gap-3 overflow-hidden relative z-10 w-full items-center active:bg-[#FDF8F4] transition-colors"
          >
           <div className="relative flex-shrink-0 w-[90px] h-[90px] rounded-[1.8rem] overflow-hidden bg-[#F5E6DA]/50 border border-[#4A403A]/5">
           {item.image && (
            <Image
             src={item.image}
             alt={item.name}
             fill
             sizes="200px"
             quality={90}
             className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
           )}
          </div>

           {/* Details */}
           <div className="flex-1 flex flex-col justify-between py-1 min-w-0 h-full">
            <div className="flex items-start justify-between gap-2">
             <h4 className="text-[15px] font-black text-[#4A423D] leading-[1.2] line-clamp-2 flex-1">
              {item.name}
             </h4>
             <motion.span
               key={item.quantity}
               initial={{ scale: 0.95, opacity: 0.8 }}
               animate={{ scale: 1, opacity: 1 }}
               className="text-[16px] font-black text-[#4A423D] tracking-tighter shrink-0 pt-0.5"
              >
               {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
             </motion.span>
            </div>

            <div className="flex items-center justify-start mt-auto">
             {/* Quantity Pill */}
             <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full p-0.5 border border-[#4A423D]/5 shadow-sm">
              <button
               onClick={() => updateQuantity(item.id, -1)}
               className="w-7 h-7 flex items-center justify-center text-[18px] font-medium text-[#4A423D] hover:text-[#CF8D72] transition-colors active:scale-75"
              >−</button>
              <span className="w-5 text-center text-[13px] font-black text-[#4A423D]">
               {item.quantity}
              </span>
              <button
               onClick={() => updateQuantity(item.id, 1)}
               className="w-7 h-7 flex items-center justify-center text-[18px] font-medium text-[#4A423D] hover:text-[#CF8D72] transition-colors active:scale-75"
              >+</button>
             </div>
            </div>
           </div>
          </div>
        </motion.div>
       ))}
      </AnimatePresence>
     </div>
    )}
   </div>

   {cart.length > 0 && (
    <div className="mt-6 space-y-5 shrink-0">
     <div className="flex items-end justify-between px-2">
      <span className="text-[14px] font-[900] text-[#8D8681] uppercase tracking-[0.2em] pb-1">итого</span>
      <motion.span
       key={total}
       initial={{ y: 10, opacity: 0 }}
       animate={{ y: 0, opacity: 1 }}
       className="text-[22px] font-black text-[#4A423D] tracking-tight leading-none"
      >
       {total.toLocaleString("ru-RU")} ₽
      </motion.span>
     </div>

     <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
       setCheckoutOpen(true)
       if (onClose) onClose()
      }}
      className="w-full bg-[#CF8F73] rounded-[1.4rem] px-6 h-[54px] sm:h-[60px] flex items-center justify-between text-white shadow-[0_8px_30px_rgba(207,143,115,0.25)] group relative overflow-hidden"
     >

      <span className="text-[17px] font-[900] relative z-10 drop-shadow-sm">Оформить</span>
      <div className="flex items-center gap-2 relative z-10">
       <div className="w-[1px] h-6 bg-[#FDF8ED]/30 mx-2" />
       <motion.svg
        width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        animate={{ x: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
       >
        <path d="M5 12h14m-7-7 7 7-7 7" />
       </motion.svg>
      </div>
     </motion.button>
     <p className="mt-4 text-[11px] font-medium text-[#4A423D]/40 leading-relaxed text-center px-4 pb-4 sm:pb-0">
      Нажимая «Оформить», вы принимаете условия{" "}
      <a href="/offer" className="text-[#CF8F73] underline underline-offset-2 hover:text-[#b87a60] transition-colors">оферты</a>
      {" "}и{" "}
      <a href="/privacy" className="text-[#CF8F73] underline underline-offset-2 hover:text-[#b87a60] transition-colors">политики конфиденциальности</a>
     </p>
    </div>
   )}
  </div>
 )
}

export default CartSidebar
