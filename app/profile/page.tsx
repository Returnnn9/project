"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Clock, Heart, ShoppingBag, Minus, Plus, Trash2, LogOut, RotateCcw } from "lucide-react"
import { Product, CartItem } from "@/store/types"
import { useUIStore, useCartStore, useUserStore, useProductStore } from "@/store/hooks"
import { useSession, signOut } from "next-auth/react"
import ProductCard from "@/components/ProductCard"
import { ProductCardSkeleton } from "@/components/Skeleton"

type TabLabel = "История заказов" | "Избранное" | "Корзина"

const TABS: { label: TabLabel; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
 { label: "История заказов", icon: Clock },
 { label: "Избранное", icon: Heart },
 { label: "Корзина", icon: ShoppingBag },
]

function EmptyState({ icon: Icon, text, linkText, linkHref }: {
 icon: React.FC<React.SVGProps<SVGSVGElement>>
 text: string
 linkText: string
 linkHref: string
}) {
 return (
  <div className="py-16 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-dashed border-[#CF8F73]/30">
   <Icon className="w-10 h-10 text-[#CF8F73]/20 mb-4" />
   <p className="text-smusl-gray font-bold text-center px-4 mb-6">{text}</p>
   <Link href={linkHref} className="text-[#CF8F73] font-black border-b-2 border-[#CF8F73]">
    {linkText}
   </Link>
  </div>
 )
}

function CartItemRow({ item, index, isLast, onDecrement, onIncrement, onRemove }: {
 item: CartItem
 index: number
 isLast: boolean
 onDecrement: () => void
 onIncrement: () => void
 onRemove: () => void
}) {
 return (
  <motion.div
   initial={{ opacity: 0, y: 16, scale: 0.98 }}
   animate={{ opacity: 1, y: 0, scale: 1 }}
   exit={{ opacity: 0, x: -40, scale: 0.95 }}
   transition={{ delay: index * 0.06, type: "spring", damping: 22, stiffness: 260 }}
   className={`group relative flex items-start sm:items-center gap-4 px-4 py-5 sm:px-8 sm:py-6 bg-white hover:bg-[#FDFAF8] transition-all duration-300 ${!isLast ? "border-b border-[#F3EDE8]" : ""}`}
  >
   {/* Image */}
   <div className="relative w-[80px] h-[80px] sm:w-[96px] sm:h-[96px] rounded-[1.5rem] overflow-hidden bg-[#FAF5F0] shrink-0 shadow-sm border border-[#EEE8E2]">
    <Image
     src={item.image}
     fill
     sizes="96px"
     className="object-cover transition-transform duration-500 group-hover:scale-110"
     alt={item.name}
    />
   </div>

   {/* Content Wrapper */}
   <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
    
    {/* Name and Mobile Price */}
    <div className="min-w-0 flex-1">
     <h3 className="text-[15px] sm:text-[18px] font-[800] text-[#3A332E] leading-snug line-clamp-2">{item.name}</h3>
     
     {/* Mobile Sub-line (Price) */}
     <div className="mt-1 sm:mt-1.5">
       <motion.p
        key={item.quantity}
        initial={{ scale: 0.92, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-[13px] sm:text-[15px] font-[900] text-[#CF8F73] tabular-nums"
       >
        {item.price} ₽ за шт.
       </motion.p>
     </div>
    </div>

    {/* Controls Area */}
    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 mt-1 sm:mt-0">
     
     {/* Price per Item x Quantity Calculation for Desktop only */}
     <motion.span
      key={item.quantity}
      initial={{ y: -6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="hidden sm:block text-[18px] font-[900] text-[#3A332E] tabular-nums min-w-[80px] text-right order-2 sm:order-none ml-auto"
     >
      {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
     </motion.span>

     {/* Quantity Pill Wrapper */}
     <div className="flex items-center gap-1 bg-[#F5F0EC] rounded-full p-1 shadow-inner border border-[#EAE4DE] shrink-0">
      <motion.button
       onClick={onDecrement}
       whileTap={{ scale: 0.82 }}
       className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white text-[#3A332E] hover:bg-[#CF8F73] hover:text-white shadow-sm transition-all duration-200"
      >
       <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2.5} />
      </motion.button>
      <motion.span
       key={item.quantity}
       initial={{ scale: 0.7, opacity: 0 }}
       animate={{ scale: 1, opacity: 1 }}
       className="w-6 sm:w-7 text-center text-[14px] sm:text-[15px] font-[900] text-[#3A332E] tabular-nums"
      >
       {item.quantity}
      </motion.span>
      <motion.button
       onClick={onIncrement}
       whileTap={{ scale: 0.82 }}
       className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white text-[#3A332E] hover:bg-[#CF8F73] hover:text-white shadow-sm transition-all duration-200"
      >
       <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2.5} />
      </motion.button>
     </div>

     {/* Trash Action Button */}
     <motion.button
      onClick={onRemove}
      whileTap={{ scale: 0.82 }}
      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[#F5F0EC] text-[#CF8F73]/70 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 border border-[#EAE4DE] shrink-0"
     >
      <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
     </motion.button>
    </div>
   </div>
  </motion.div>
 )
}

export default function ProfilePage() {
 const setAuthModalOpen = useUIStore(s => s.setAuthModalOpen)
 const setCheckoutOpen = useUIStore(s => s.setCheckoutOpen)

 const cart = useCartStore(s => s.cart)
 const addToCart = useCartStore(s => s.addToCart)
 const addMultipleToCart = useCartStore(s => s.addMultipleToCart)
 const updateQuantity = useCartStore(s => s.updateQuantity)

 const favorites = useUserStore(s => s.favorites) || []
 const orderHistory = useUserStore(s => s.orderHistory) || []
 const userName = useUserStore(s => s.userName)

 const products = useProductStore(s => s.products) || []
 const fetchProducts = useProductStore(s => s.fetchProducts)

 const { data: session, status: authStatus } = useSession()
 const isAuthenticated = authStatus === "authenticated"
 const isLoadingSession = authStatus === "loading"
 const [activeTab, setActiveTab] = useState<TabLabel>("История заказов")
 const [mounted, setMounted] = useState(false)


 useEffect(() => {
  setMounted(true)
 }, [])

 useEffect(() => {
  if (products.length === 0) {
   fetchProducts()
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [])

 let displayName = isAuthenticated ? (session?.user?.name || "Пользователь") : "Гость";
 const localName = userName;
 if (isAuthenticated && displayName && /^[\d\s\-\+\(\)]+$/.test(displayName)) {
  displayName = localName || "Пользователь";
 } else if (isAuthenticated && localName && localName !== displayName && !/^[\d\s\-\+\(\)]+$/.test(localName)) {
  displayName = localName;
 }
 const isLoading = isLoadingSession || !mounted
 const favoriteProducts = products.filter((p: Product) => Array.isArray(favorites) && favorites.includes(p.id))
 const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

 const handleLogout = async () => {
  await signOut({ callbackUrl: "/" })
 }

 const handleRepeatOrder = (order: { items: CartItem[] }) => {
  const productsToAdd: Product[] = []
  order.items.forEach((item: CartItem) => {
   const product = products.find((p: Product) => p.id === item.id)
   if (product) productsToAdd.push({ ...product, quantity: item.quantity })
  })
  if (productsToAdd.length > 0) {
   addMultipleToCart(productsToAdd)
   setActiveTab("Корзина")
  }
 }

 return (
  <div className="min-h-screen w-full bg-[#FAF8F5] font-montserrat flex flex-col">
   <Header showCategories={false} />

   <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 pb-24 pt-8">
    <Link href="/market" className="inline-flex items-center gap-2 text-[#4A403A]/40 hover:text-smusl-terracotta transition-all mb-10 text-[15px] sm:text-[17px] font-black uppercase tracking-[0.1em]">
     <ArrowLeft className="w-5 h-5" />
     Назад в магазин
    </Link>

    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6 mb-8">
     <div>
      <h1 className="text-[28px] sm:text-[40px] lg:text-[52px] font-bold text-[#CF8F73] leading-tight">Добро пожаловать,</h1>
      <h2 className="text-[32px] sm:text-[48px] lg:text-[60px] font-black text-[#CF8F73] leading-[0.95]">{displayName}!</h2>
      <div className="mt-8 flex flex-wrap items-center gap-3">
       {!isAuthenticated && (
        <button
         onClick={() => setAuthModalOpen(true)}
         className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-full bg-[#CD8B70] text-white text-[14px] sm:text-[16px] font-bold hover:bg-[#C27E63] transition-colors shadow-sm active:scale-95 select-none touch-manipulation"
        >
         <span className="tracking-wide pointer-events-none">Войти в аккаунт</span>
        </button>
       )}
       {isAuthenticated && (
        <div className="flex items-center gap-3">
         {session?.user?.role === "ADMIN" && (
          <Link href="/admin" className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-full bg-[#3A332E] text-white text-[14px] sm:text-[16px] font-bold hover:bg-black transition-colors shadow-sm active:scale-95">
           Панель управления
          </Link>
         )}
         <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "rgba(254, 226, 226, 0.8)" }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-50/50 text-red-500 border border-red-200/50 text-[14px] font-bold backdrop-blur-md transition-all shadow-sm hover:shadow-md hover:border-red-300"
         >
          <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          Выйти
         </motion.button>
        </div>
       )}
      </div>
     </div>

     {isAuthenticated && (
      <div className="px-5 py-3 sm:px-6 sm:py-4 border-2 border-[#CF8F73]/30 rounded-[1.5rem] flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-0 bg-white shadow-sm self-start">
       <span className="text-[11px] text-[#CF8F73]/60 font-bold uppercase tracking-widest sm:mb-1">Всего баллов</span>
       <span className="text-[36px] sm:text-[44px] font-black text-[#4A403A] leading-none tracking-tight">102</span>
      </div>
     )}
    </div>

    {/* Tabs */}
    <div className="mt-12 sm:mt-16 mb-8 sm:mb-12 -mx-4 sm:mx-0">
     <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar pb-4 px-4 sm:px-1">
      {TABS.map(({ label, icon: Icon }) => (
       <button
        key={label}
        onClick={() => setActiveTab(label)}
        className={`flex items-center gap-2 px-5 sm:px-8 py-3 sm:py-4 rounded-[1.5rem] text-[14px] sm:text-[16px] font-bold border-2 shrink-0 whitespace-nowrap transition-all duration-300 ${activeTab === label
         ? "bg-white text-[#CF8F73] border-[#CF8F73] shadow-lg shadow-[#CF8F73]/10"
         : "bg-white text-smusl-gray/70 border-smusl-light-gray hover:border-smusl-gray/40 hover:text-smusl-gray"}`}
       >
        <Icon className={`w-[18px] h-[18px] shrink-0 ${activeTab === label ? "text-[#CF8F73]" : "text-smusl-gray/40"}`} />
        {label}
       </button>
      ))}
      <div className="w-2 shrink-0 sm:hidden" />
     </div>
    </div>

    <AnimatePresence mode="wait">
     <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
     >
      {/* История заказов */}
      {activeTab === "История заказов" && (
       <div className="space-y-4">
        {isLoading ? (
         <div className="space-y-4">
          {[0, 1, 2].map(i => <div key={i} className="h-32 bg-white rounded-[2rem] animate-pulse shadow-sm" />)}
         </div>
        ) : orderHistory.length > 0 ? (
         orderHistory.map((order, i) => {
          const firstItem = order.items[0] as CartItem
          const firstProduct = products.find((p: Product) => p.id === firstItem?.id)
          const extraCount = order.items.length - 1
          return (
           <motion.div key={order.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-500 overflow-hidden group">
            <div className="sm:hidden p-6 flex flex-col gap-5">
             <div className="flex gap-5">
              <div className="relative w-24 h-24 rounded-[1.6rem] overflow-hidden bg-[#FDFBF9] shrink-0 shadow-sm">
               {firstProduct?.image ? <Image src={firstProduct.image} alt={firstProduct.name} fill sizes="96px" className="object-cover" /> : <div className="w-full h-full bg-smusl-beige/60" />}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
               <p className="text-[18px] font-bold text-[#5B5047] leading-tight">{firstItem?.name}</p>
               {extraCount > 0 && <p className="text-[13px] text-[#CF8F73] font-black uppercase tracking-tighter">+{extraCount} товаров</p>}
               <p className="text-[20px] font-black text-[#5B5047]">{order.total} ₽</p>
              </div>
             </div>
             <div className="space-y-3 pt-4 border-t border-smusl-brown/[0.05]">
              <p className="text-[13px] text-smusl-gray/60 font-medium leading-relaxed">{order.address}</p>
              <motion.button
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => handleRepeatOrder(order)}
               className="w-full flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-[#D99A82] to-[#CF8F73] text-white rounded-[1.6rem] text-[16px] font-black uppercase tracking-widest shadow-[0_12px_32px_rgba(207,143,115,0.3)] active:scale-95 transition-all"
              >
               <RotateCcw className="w-5 h-5" />
               Повторить заказ
              </motion.button>
             </div>
            </div>
            <div className="hidden sm:grid grid-cols-[auto_1fr_110px_minmax(140px,260px)_100px_auto] items-center gap-4 lg:gap-8 p-6 lg:p-10">
             <div className="relative w-28 h-28 rounded-[2rem] overflow-hidden bg-[#FDFBF9] shrink-0 shadow-sm">
              {firstProduct?.image ? <Image src={firstProduct.image} alt={firstProduct.name} fill sizes="112px" className="object-cover" /> : <div className="w-full h-full bg-smusl-beige/60" />}
             </div>
             <div className="min-w-0 pr-4">
              <p className="text-[17px] lg:text-[20px] font-bold text-[#5B5047] leading-tight truncate">{firstItem?.name}</p>
              <p className="text-[13px] lg:text-[15px] text-smusl-gray/60 font-black mt-1.5 line-clamp-1">
               {firstProduct?.weight} × {firstItem?.quantity}
               {extraCount > 0 && <span className="ml-2 lg:ml-4 text-[#CF8F73] uppercase tracking-tighter">+{extraCount} ещё</span>}
              </p>
             </div>
             <div className="text-center px-1 sm:px-2">
              <p className="text-[10px] text-smusl-gray/30 font-black uppercase tracking-[0.2em] mb-1.5">Дата</p>
              <p className="text-[14px] lg:text-[15px] text-[#5B5047] font-bold whitespace-nowrap">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : '—'}</p>
             </div>
             <div className="px-1 sm:px-2 min-w-0">
              <p className="text-[10px] text-smusl-gray/30 font-black uppercase tracking-[0.2em] mb-1.5">Адрес</p>
              <p className="text-[13px] lg:text-[14px] text-[#5B5047]/80 font-medium leading-relaxed line-clamp-2">{order.address}</p>
             </div>
             <div className="text-right px-1 sm:px-2">
              <p className="text-[10px] text-smusl-gray/30 font-black uppercase tracking-[0.2em] mb-1.5">Сумма</p>
              <p className="text-[20px] lg:text-[28px] font-black text-[#5B5047] whitespace-nowrap">{order.total} ₽</p>
             </div>
             <motion.button
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRepeatOrder(order)}
              className="flex items-center gap-3 px-10 py-[18px] bg-gradient-to-r from-[#D99A82] to-[#B87A60] text-white rounded-[1.6rem] text-[15px] lg:text-[16px] font-black uppercase tracking-widest hover:brightness-105 transition-all active:scale-95 shadow-[0_15px_40px_rgba(207,143,115,0.25)] hover:shadow-[0_25px_50px_-12px_rgba(207,143,115,0.3)] shrink-0"
             >
              <RotateCcw className="w-[18px] h-[18px] lg:w-5 lg:h-5" />
              <span className="whitespace-nowrap">Повторить заказ</span>
             </motion.button>
            </div>
           </motion.div>
          )
         })
        ) : (
         <EmptyState icon={Clock} text="История заказов пуста" linkText="Заказать что-нибудь вкусное" linkHref="/market" />
        )}
       </div>
      )}

      {/* Избранное */}
      {activeTab === "Избранное" && (
       <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {isLoading
         ? Array.from({ length: 4 }).map((_, i: number) => <ProductCardSkeleton key={i} />)
         : favoriteProducts.length > 0
          ? favoriteProducts.map((p: Product, i) => <ProductCard key={p.id} {...p} onAdd={() => addToCart(p)} index={i} />)
          : <div className="col-span-full"><EmptyState icon={Heart} text="В избранном пока пусто" linkText="Перейти в магазин" linkHref="/market" /></div>
        }
       </div>
      )}

      {/* Корзина */}
      {activeTab === "Корзина" && (
       cart.length > 0 ? (
        <div className="space-y-5">
         {/* Items */}
         <motion.div layout className="bg-white rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.05)] overflow-hidden border border-[#F0EBE5]">
          <AnimatePresence initial={false}>
           {cart.map((item, i) => (
            <CartItemRow
             key={item.id}
             item={item}
             index={i}
             isLast={i === cart.length - 1}
             onDecrement={() => updateQuantity(item.id, -1)}
             onIncrement={() => updateQuantity(item.id, 1)}
             onRemove={() => updateQuantity(item.id, -item.quantity)}
            />
           ))}
          </AnimatePresence>
         </motion.div>

         {/* Footer */}
         <motion.div
          layout
          className="relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-10 px-8 sm:px-14 py-8 sm:py-12 rounded-[3.5rem] bg-white/40 backdrop-blur-3xl border border-white/20 shadow-[0_32px_80px_rgba(207,143,115,0.12)] group hover:shadow-[0_45px_100px_rgba(207,143,115,0.18)] transition-all duration-700"
         >
          <div className="pointer-events-none absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#CF8F73]/[0.05] via-transparent to-[#CF8F73]/[0.02] opacity-50" />
          <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-[#CF8F73]/[0.08] rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-1000" />

          <div className="relative z-10">
           <span className="block text-[11px] font-[950] text-[#3A332E]/30 uppercase tracking-[0.4em] mb-3">Итого к оплате</span>
           <div className="flex items-baseline gap-3">
            <motion.span
             key={cartTotal}
             initial={{ opacity: 0.6, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="text-[60px] sm:text-[84px] font-black text-[#3A332E] leading-none tracking-tighter font-manrope drop-shadow-sm"
            >
             {cartTotal.toLocaleString("ru-RU")}
            </motion.span>
            <span className="text-[32px] sm:text-[44px] font-[900] text-[#CF8F73] leading-none">₽</span>
           </div>
           <p className="text-[13px] font-[700] text-[#3A332E]/40 mt-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CF8F73]" />
            {cart.reduce((s, i) => s + i.quantity, 0)} позиций в корзине
           </p>
          </div>

          <motion.div
           whileHover={{ scale: 1.03, y: -2 }}
           whileTap={{ scale: 0.97 }}
           className="relative z-10 w-full sm:w-auto"
          >
           <button
            onClick={() => setCheckoutOpen(true)}
            className="relative overflow-hidden w-full sm:w-auto h-[58px] sm:h-auto flex items-center justify-center gap-3 sm:gap-5 px-6 sm:px-20 py-0 sm:py-8 bg-gradient-to-br from-[#E2A68E] via-[#CF8F73] to-[#B87A60] text-white rounded-[1.5rem] sm:rounded-[2.5rem] text-[15px] sm:text-[22px] font-black uppercase tracking-wider sm:tracking-[0.2em] shadow-[0_15px_35px_rgba(207,143,115,0.35)] hover:shadow-[0_35px_80px_rgba(207,143,115,0.55)] active:scale-95 transition-all duration-500"
           >

            <span className="relative z-5 whitespace-nowrap">Оформить заказ</span>
            <motion.svg
             className="relative z-10 w-6 h-6"
             viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
             animate={{ x: [0, 6, 0] }}
             transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            >
             <path d="M5 12h14m-7-7 7 7-7 7" />
            </motion.svg>
           </button>
          </motion.div>
         </motion.div>
        </div>
       ) : (
        <EmptyState icon={ShoppingBag} text="В корзине пока пусто" linkText="Начать покупки" linkHref="/market" />
       )
      )}
     </motion.div>
    </AnimatePresence>
   </main>

   <Footer />
  </div>
 )
}
