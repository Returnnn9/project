"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Clock, Heart, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react"
import { useApp, Product, CartItem } from "@/store/AppContext"
import { products } from "@/components/data"
import ProductCard from "@/components/ProductCard"
import { OrderSkeleton, ProductCardSkeleton } from "@/components/Skeleton"
import { LogOut } from "lucide-react"

interface LocalSession { name: string; email: string; }

export default function ProfilePage() {
 const { addToCart, updateQuantity, setAuthModalOpen, setUserName, favorites, orderHistory, cart } = useApp()
 const [localSession, setLocalSession] = useState<LocalSession | null>(null)
 const [activeTab, setActiveTab] = useState("Избранное")
 const [isLoading, setIsLoading] = useState(true)

 useEffect(() => {
  try {
   const raw = localStorage.getItem("smuslest_session")
   if (raw) setLocalSession(JSON.parse(raw))
  } catch { /* ignore */ }
 }, [])

 useEffect(() => {
  setIsLoading(true);
  const timer = setTimeout(() => setIsLoading(false), 800);
  return () => clearTimeout(timer);
 }, [activeTab]);

 // Get favorite products from the data source
 const favoriteProducts = products.filter(p => favorites.includes(p.id))

 const isAuthenticated = !!localSession
 const displayName = isAuthenticated ? localSession!.name.toUpperCase() : "ГОСТЬ"

 const handleLogout = () => {
  localStorage.removeItem("smuslest_session")
  setLocalSession(null)
  setUserName("")
  window.location.reload()
 }

 return (
  <div className="min-h-screen bg-smusl-beige font-montserrat flex flex-col">
   <Header />

   <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 pb-20 mt-10">
    {/* ── Back Link ── */}
    <Link href="/market" className="flex items-center gap-2 text-smusl-brown/60 hover:text-smusl-brown transition-colors mb-6 group font-bold">
     <ArrowLeft className="w-4 h-4 text-smusl-brown group-hover:-translate-x-1 transition-transform" />
     <span className="text-[13px]">Назад</span>
    </Link>

    <div className="flex flex-col lg:flex-row justify-between items-start mb-8 sm:mb-10 gap-4 w-full">
     <div className="space-y-1">
      <h1 className="text-[20px] sm:text-[28px] lg:text-[36px] font-bold text-[#CF8F73]/50 leading-tight tracking-tight">
       Добро пожаловать,
      </h1>
      <h1 className="text-[28px] sm:text-[40px] lg:text-[48px] font-black text-[#CF8F73] leading-[0.95] tracking-tighter">
       {displayName}!
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-3">
       {isAuthenticated ? (
        <button
         onClick={handleLogout}
         className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-500 border border-red-100 text-[13px] font-bold hover:bg-red-100 transition-all active:scale-95"
        >
         <LogOut className="w-3.5 h-3.5" />
         Выйти
        </button>
       ) : (
        <button
         onClick={() => setAuthModalOpen(true)}
         className="flex items-center gap-2 px-5 py-2 rounded-full bg-smusl-terracotta text-white text-[13px] font-bold hover:bg-smusl-terracotta/90 transition-all active:scale-95 shadow-sm"
        >
         Войти в аккаунт
        </button>
       )}
      </div>
     </div>

     {/* Points Block */}
     {isAuthenticated && (
      <div className="w-full sm:w-auto px-5 py-4 sm:p-6 border-2 border-[#CF8F73]/20 rounded-[1.5rem] flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start sm:min-w-[200px] bg-white shadow-sm group hover:border-[#CF8F73]/40 transition-colors">
       <span className="text-[11px] text-[#CF8F73]/60 font-bold uppercase tracking-widest">Всего баллов</span>
       <span className="text-[28px] sm:text-[40px] font-black text-[#4A403A] leading-none tracking-tight">1,102</span>
      </div>
     )}
    </div>

    {/* ── Tabs ── */}
    <div className="flex gap-2 mb-6 overflow-x-auto py-1 no-scrollbar">
     {[
      { label: "История заказов", icon: Clock },
      { label: "Избранное", icon: Heart },
      { label: "Корзина", icon: ShoppingBag },
     ].map((tab) => (
      <button
       key={tab.label}
       onClick={() => setActiveTab(tab.label)}
       className={`flex items-center gap-2 px-4 py-2.5 rounded-[1rem] text-[13px] font-bold transition-all border-2 whitespace-nowrap ${activeTab === tab.label
        ? "bg-white text-[#CF8F73] border-[#CF8F73] shadow-md shadow-[#CF8F73]/10"
        : "bg-white text-smusl-gray border-transparent hover:border-smusl-light-gray"
        }`}
      >
       <tab.icon className={`w-4 h-4 shrink-0 ${activeTab === tab.label ? "fill-[#CF8F73]" : ""}`} />
       {tab.label}
      </button>
     ))}
    </div>

    {/* ── Content ── */}
    <AnimatePresence mode="wait">
     <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
     >
      {activeTab === "Избранное" ? (
       <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {isLoading ? (
         Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
         ))
        ) : favoriteProducts.length > 0 ? (
         favoriteProducts.map((p: Product, i) => (
          <ProductCard key={p.id} {...p} onAdd={() => addToCart(p)} index={i} />
         ))
        ) : (
         <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-dashed border-[#CF8F73]/30">
          <Heart className="w-12 h-12 text-[#CF8F73]/20 mb-4" />
          <p className="text-smusl-gray font-bold text-center px-4">В избранном пока пусто. Добавляйте товары из магазина!</p>
          <Link href="/market" className="mt-6 text-[#CF8F73] font-black border-b-2 border-[#CF8F73]">Перейти в магазин</Link>
         </div>
        )}
       </div>
      ) : activeTab === "История заказов" ? (
       <div className="space-y-4">
        {isLoading ? (
         Array.from({ length: 4 }).map((_, i) => (
          <OrderSkeleton key={i} />
         ))
        ) : orderHistory.length > 0 ? (
         orderHistory.map((order, i) => (
          <motion.div
           key={order.id}
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.4, delay: i * 0.1 }}
           className="flex flex-col bg-white border border-smusl-light-gray rounded-[1.5rem] shadow-sm hover:border-smusl-terracotta transition-all overflow-hidden"
          >
           <div className="p-4 sm:p-6 md:p-8 flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-3 flex-1">
             <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-green-50 text-green-600 rounded-full text-[11px] font-bold uppercase tracking-wide border border-green-100">Выполнен</span>
              <span className="text-smusl-gray text-[12px] sm:text-[13px] font-medium">{order.date}</span>
              <span className="text-smusl-gray text-[12px]">№{order.id.toString().slice(-6)}</span>
             </div>

             <div className="space-y-1.5">
              <span className="block text-[11px] font-bold text-smusl-gray uppercase tracking-widest">Товары:</span>
              <div className="flex flex-wrap gap-1.5">
               {order.items.map((item: CartItem) => (
                <div key={item.id} className="flex items-center gap-1.5 bg-smusl-beige/30 px-2 py-1.5 rounded-xl border border-smusl-light-gray">
                 <img src={item.image} className="w-6 h-6 rounded-lg object-cover" alt="" />
                 <span className="text-[11px] sm:text-[12px] font-bold text-smusl-brown">{item.name} <span className="text-[#CF8F73]">x{item.quantity}</span></span>
                </div>
               ))}
              </div>
             </div>

             <div>
              <span className="block text-[10px] font-bold text-smusl-gray uppercase tracking-widest mb-0.5">Адрес:</span>
              <span className="text-[12px] sm:text-[13px] text-smusl-brown font-medium">{order.address}</span>
             </div>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3">
             <div className="text-left md:text-right">
              <span className="block text-[10px] font-bold text-smusl-gray uppercase tracking-widest mb-0.5">Сумма:</span>
              <span className="text-[22px] sm:text-[26px] font-black text-smusl-brown leading-none">{order.total} ₽</span>
             </div>

             <button
              onClick={() => {
               order.items.forEach((item: CartItem) => {
                const p = products.find(prod => prod.id === item.id)
                if (p) addToCart(p)
               })
              }}
              className="shrink-0 px-5 py-2.5 bg-smusl-terracotta text-white rounded-xl text-[12px] sm:text-[13px] font-bold hover:bg-[#b87a60] transition-all shadow-md shadow-smusl-terracotta/20 active:scale-95"
             >
              Повторить
             </button>
            </div>
           </div>
          </motion.div>
         ))
        ) : (
         <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-dashed border-[#CF8F73]/30">
          <Clock className="w-12 h-12 text-[#CF8F73]/20 mb-4" />
          <p className="text-smusl-gray font-bold text-center px-4">История заказов пуста</p>
          <Link href="/market" className="mt-6 text-[#CF8F73] font-black border-b-2 border-[#CF8F73]">Заказать что-нибудь вкусное</Link>
         </div>
        )}
       </div>
      ) : (
       <div className="space-y-6">
        {cart.length > 0 ? (
         <>
          <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-smusl-light-gray shadow-sm overflow-hidden">
           {cart.map((item, i) => (
            <motion.div
             key={item.id}
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: i * 0.05 }}
             className={`flex items-center justify-between p-3 sm:p-5 gap-3 ${i !== cart.length - 1 ? "border-b border-smusl-light-gray/50" : ""}`}
            >
             <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1rem] overflow-hidden bg-smusl-beige/50 shrink-0">
               <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
              </div>
              <div className="min-w-0">
               <h3 className="text-[13px] sm:text-[14px] font-bold text-smusl-brown leading-tight truncate">{item.name}</h3>
               <p className="text-[12px] sm:text-[13px] font-black text-[#CF8F73]">{item.price} ₽</p>
              </div>
             </div>

             <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 bg-smusl-beige/30 px-3 py-1.5 rounded-xl border border-smusl-light-gray/50">
               <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-smusl-brown hover:bg-smusl-terracotta hover:text-white transition-all shadow-sm active:scale-90">
                <Minus className="w-3 h-3" />
               </button>
               <span className="text-[13px] font-black text-smusl-brown min-w-[16px] text-center">{item.quantity}</span>
               <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-smusl-brown hover:bg-smusl-terracotta hover:text-white transition-all shadow-sm active:scale-90">
                <Plus className="w-3 h-3" />
               </button>
              </div>
              <button onClick={() => updateQuantity(item.id, -item.quantity)} className="text-red-400 hover:text-red-600 transition-colors p-1">
               <Trash2 className="w-4 h-4" />
              </button>
             </div>
            </motion.div>
           ))}
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-4 bg-white px-5 py-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-smusl-light-gray shadow-sm">
           <div>
            <span className="text-[11px] font-bold text-smusl-gray uppercase tracking-widest block mb-0.5">Итого:</span>
            <span className="text-[28px] sm:text-[36px] font-black text-smusl-brown leading-none">
             {cart.reduce((sum, item) => sum + item.price * item.quantity, 0)} ₽
            </span>
           </div>
           <Link
            href="/market"
            className="shrink-0 px-6 sm:px-10 py-3 sm:py-4 bg-smusl-terracotta text-white rounded-xl text-[13px] sm:text-[15px] font-black uppercase tracking-wider hover:bg-[#b87a60] transition-all shadow-lg shadow-smusl-terracotta/20 text-center active:scale-95"
           >
            Оформить заказ
           </Link>
          </div>
         </>
        ) : (
         <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-dashed border-[#CF8F73]/30">
          <ShoppingBag className="w-12 h-12 text-[#CF8F73]/20 mb-4" />
          <p className="text-smusl-gray font-bold text-center px-4">В корзине пока пусто</p>
          <Link href="/market" className="mt-6 text-[#CF8F73] font-black border-b-2 border-[#CF8F73]">Начать покупки</Link>
         </div>
        )}
       </div>
      )}
     </motion.div>
    </AnimatePresence>
   </main>

   <Footer />
  </div>
 )
}
