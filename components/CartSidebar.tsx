"use client"
import React from "react"
import { useApp } from "@/store/AppContext"
import { Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const CartSidebar = () => {
 const { cart, updateQuantity, address, setCheckoutOpen } = useApp()
 const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

 const handleCheckout = () => {
  if (cart.length > 0) setCheckoutOpen(true)
 }

 return (
  <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#F5E6DA] rounded-[2rem] font-montserrat overflow-hidden p-5">

   {/* ── Address ── */}
   <h2 className="text-[18px] font-bold text-[#4A403A] mb-4">
    {address || "ул. Ижорская, 3"}
   </h2>

   {/* ── Items ── */}
   {cart.length === 0 ? (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
     <h3 className="text-[22px] font-black text-[#6C5B52]/80 mb-3">
      Корзина пуста
     </h3>
     <p className="text-[14px] text-[#6C5B52]/60 font-medium leading-[1.4] max-w-[260px]">
      Пожалуйста, добавьте товар в корзину, чтобы оформить заказ
     </p>
    </div>
   ) : (
    <div className="flex flex-col gap-3">
     <AnimatePresence initial={false}>
      {cart.map((item) => (
       <motion.div
        key={item.id}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        layout
        className="bg-white rounded-[1.25rem] p-3 flex gap-3"
       >
        <div className="relative flex-shrink-0 w-[100px] sm:w-[140px] h-[70px] sm:h-[96px] bg-[#F9F9F9] rounded-[1rem] overflow-hidden flex items-center justify-center border border-[#F0F0F0]">
         <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
         />
         <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center">
          <Heart className="w-3 h-3 fill-[#CF8F73] text-[#CF8F73]" />
         </div>
        </div>

        {/* Text content */}
        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
         <div>
          <p className="text-[14px] font-black text-[#4A403A] leading-[1.2] mb-1">
           {item.name}
          </p>
          <p className="text-[10px] sm:text-[11px] font-bold text-[#4A403A]/30 uppercase tracking-widest">1 шт</p>
         </div>
         <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 text-[#4A403A]/50">
           <button
            onClick={() => updateQuantity(item.id, -1)}
            className="text-[16px] sm:text-[18px] font-bold leading-none hover:text-smusl-terracotta transition-colors px-1"
           >
            −
           </button>
           <span className="text-[14px] sm:text-[15px] font-black text-[#4A403A]">{item.quantity}</span>
           <button
            onClick={() => updateQuantity(item.id, 1)}
            className="text-[16px] sm:text-[18px] font-bold leading-none hover:text-smusl-terracotta transition-colors px-1"
           >
            +
           </button>
          </div>
          <span className="text-[14px] sm:text-[16px] font-black text-[#4A403A] tracking-tighter shrink-0 ml-2">
           {item.price * item.quantity} ₽
          </span>
         </div>
        </div>
       </motion.div>
      ))}
     </AnimatePresence>
    </div>
   )}

   {/* ── Checkout Button ── */}
   {cart.length > 0 && (
    <button
     onClick={handleCheckout}
     className="mt-4 w-full bg-[#CF8F73] rounded-[1rem] px-6 h-[60px] flex items-center justify-between text-white hover:bg-[#b87a60] transition-all"
    >
     <span className="text-[20px] font-bold">Далее</span>
     <span className="text-[20px] font-black">{total.toLocaleString("ru-RU")} ₽</span>
    </button>
   )}
  </div>
 )
}

export default CartSidebar
