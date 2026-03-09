"use client"

import React from "react"
import { Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useApp } from "@/store/AppContext"

const CartSidebar: React.FC = () => {
 const { cart, updateQuantity, address, setCheckoutOpen } = useApp()
 const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

 return (
  <div className="flex flex-col h-[calc(100vh-8rem)] bg-gradient-to-b from-[#FDF8ED] to-[#F5E6DA] rounded-[2.5rem] font-manrope overflow-hidden p-6 shadow-2xl border border-white/20">

   {/* Header Area */}
   <div className="flex items-center justify-between mb-6 shrink-0">
    <div className="flex flex-col min-w-0 w-full">
     <span className="text-[12px] font-bold text-[#CF8D72] uppercase tracking-[0.2em] mb-1">Ваша корзина</span>
     <h2 className="text-[20px] font-extrabold text-[#4A423D] flex items-center gap-2 min-w-0">
      <span className="w-2 h-2 rounded-full bg-[#CF8D72] animate-pulse shrink-0" />
      <span className="truncate max-w-full" title={address || "ул. Ижорская, 3"}>
       {address || "ул. Ижорская, 3"}
      </span>
     </h2>
    </div>
   </div>

   {/* Items List */}
   <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
    {cart.length === 0 ? (
     <div className="h-full flex flex-col items-center justify-center text-center px-6">
      <div className="w-24 h-24 mb-6 rounded-full bg-white/50 flex items-center justify-center shadow-inner">
       <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#CF8D72]/40">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
       </svg>
      </div>
      <h3 className="text-[22px] font-black text-[#4A423D]/80 mb-3 tracking-tight">Корзина пуста</h3>
      <p className="text-[14px] text-[#8D8681] font-medium leading-[1.6] max-w-[240px]">
       Ваши будущие сладости появятся здесь. Давайте что-нибудь выберем!
      </p>
     </div>
    ) : (
     <div className="flex flex-col gap-4">
      <AnimatePresence initial={false}>
       {cart.map((item) => (
        <motion.div
         key={item.id}
         initial={{ opacity: 0, y: 15 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.9 }}
         transition={{ duration: 0.3 }}
         className="bg-white/90 backdrop-blur-md border border-white/40 shadow-premium rounded-[1.5rem] p-4 flex gap-4 group relative overflow-hidden shrink-0"
        >
         {/* Thumbnail */}
         <div className="relative flex-shrink-0 w-[85px] h-[85px] rounded-[1.1rem] overflow-hidden bg-white shadow-sm border border-black/5">
          {item.image && (
           <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="85px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
           />
          )}
         </div>

         {/* Details */}
         <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0 relative z-10">
          <div>
           <h4 className="text-[15px] font-extrabold text-[#4A423D] leading-tight mb-1 truncate">
            {item.name}
           </h4>
           <p className="text-[11px] font-bold text-[#8D8681] uppercase tracking-widest">
            {item.quantity} шт
           </p>
          </div>

          <div className="flex items-center justify-between mt-1">
           <div className="flex items-center bg-[#FDF8ED]/80 rounded-full p-1 border border-white/50 scale-90 -ml-1">
            <button
             onClick={() => updateQuantity(item.id, -1)}
             className="w-7 h-7 flex items-center justify-center text-[18px] font-bold text-[#4A423D] hover:text-[#CF8D72] transition-colors active:scale-90"
            >−</button>
            <span className="w-6 text-center text-[13px] font-black text-[#4A423D]">
             {item.quantity}
            </span>
            <button
             onClick={() => updateQuantity(item.id, 1)}
             className="w-7 h-7 flex items-center justify-center text-[18px] font-bold text-[#4A423D] hover:text-[#CF8D72] transition-colors active:scale-90"
            >+</button>
           </div>

           <div className="text-right">
            <span className="block text-[15px] font-black text-[#4A423D] tracking-tighter">
             {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
            </span>
           </div>
          </div>
         </div>
        </motion.div>
       ))}
      </AnimatePresence>
     </div>
    )}
   </div>

   {/* Checkout Footer */}
   {cart.length > 0 && (
    <div className="mt-6 space-y-4 shrink-0">
     <div className="flex items-center justify-between px-2">
      <span className="text-[14px] font-bold text-[#8D8681] uppercase tracking-widest">Итого</span>
      <span className="text-[24px] font-black text-[#4A423D] tracking-tighter">{total.toLocaleString("ru-RU")} ₽</span>
     </div>

     <button
      onClick={() => setCheckoutOpen(true)}
      className="w-full bg-[#CF8D72] rounded-[1.5rem] px-8 h-[72px] flex items-center justify-between text-white shadow-xl shadow-[#CF8D72]/30 group relative overflow-hidden"
     >
      <span className="text-[20px] font-extrabold relative z-10">Оформить</span>
      <div className="flex items-center gap-2 relative z-10">
       <div className="w-[1px] h-8 bg-white/20 mx-2" />
       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
        <path d="M5 12h14m-7-7 7 7-7 7" />
       </svg>
      </div>
     </button>
    </div>
   )}
  </div>
 )
}

export default CartSidebar
