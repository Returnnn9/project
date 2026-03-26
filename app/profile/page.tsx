"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Clock, Heart, ShoppingBag, Minus, Plus, Trash2, LogOut, RotateCcw } from "lucide-react"
import { Product, CartItem } from "@/store/types"
import { useUIStore, useCartStore, useUserStore, useProductStore, useStoreData } from "@/store/hooks"
import { useSession, signOut } from "next-auth/react"
import ProductCard from "@/components/ProductCard"
import { ProductCardSkeleton } from "@/components/Skeleton"

// ─── Types ───────────────────────────────────────────────────────────────────

interface LocalSession {
 name: string
 email: string
}

type TabLabel = "История заказов" | "Избранное" | "Корзина"

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS: { label: TabLabel; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
 { label: "История заказов", icon: Clock },
 { label: "Избранное", icon: Heart },
 { label: "Корзина", icon: ShoppingBag },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

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
   initial={{ opacity: 0, x: -10 }}
   animate={{ opacity: 1, x: 0 }}
   transition={{ delay: index * 0.05 }}
   className={`flex flex-col sm:flex-row sm:items-center p-4 sm:p-8 gap-4 sm:gap-5 bg-white hover:bg-[#FAF8F5]/80 transition-colors ${!isLast ? "border-b border-smusl-light-gray/40" : ""}`}
  >
   {/* Top row: image + name/price */}
   <div className="flex items-center gap-4 flex-1 min-w-0">
    <div className="relative w-16 h-16 sm:w-32 sm:h-32 rounded-[1.4rem] sm:rounded-[1.8rem] overflow-hidden bg-white shrink-0 p-1 sm:p-1.5 border border-smusl-light-gray/40 shadow-sm">
     <Image src={item.image} fill sizes="(max-width: 640px) 64px, 128px" className="object-cover rounded-[1.1rem] sm:rounded-[1.4rem]" alt={item.name} />
    </div>
    <div className="min-w-0 flex-1">
     <h3 className="text-[15px] sm:text-[22px] font-bold text-[#5B5047] leading-tight">{item.name}</h3>
     <p className="text-[14px] sm:text-[20px] font-black text-[#5B5047] mt-0.5 sm:mt-1">{item.price} ₽</p>
    </div>
   </div>

   {/* Bottom row on mobile / right side on desktop: controls + price + trash */}
   <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
    {/* Quantity Controls */}
    <div className="flex items-center p-1.5 sm:p-2 bg-[#FAF8F5] rounded-[1.2rem] sm:rounded-[1.4rem] border border-smusl-light-gray/60 shadow-sm">
     <div className="flex items-center gap-2 sm:gap-4 px-1">
      <button
       onClick={onDecrement}
       className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white border border-smusl-light-gray text-smusl-brown hover:bg-smusl-terracotta hover:text-white transition-all shadow-sm active:scale-90"
      >
       <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
      <span className="text-[15px] sm:text-[18px] font-black text-smusl-brown min-w-[24px] sm:min-w-[32px] text-center">{item.quantity}</span>
      <button
       onClick={onIncrement}
       className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white border border-smusl-light-gray text-smusl-brown hover:bg-smusl-terracotta hover:text-white transition-all shadow-sm active:scale-90"
      >
       <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
     </div>

     {/* Divider */}
     <div className="w-px h-6 sm:h-8 bg-smusl-light-gray/60 mx-2 sm:mx-3" />

     {/* Delete */}
     <button
      onClick={onRemove}
      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-[0.8rem] sm:rounded-[1rem] text-[#CF8F73] hover:text-red-500 hover:bg-red-50 transition-all active:scale-95 group"
     >
      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
     </button>
    </div>

    {/* Total price on mobile (hidden on sm where it shows inline above) */}
    <span className="sm:hidden text-[15px] font-black text-[#5B5047] tabular-nums">
     {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
    </span>
   </div>
  </motion.div>
 )
}


// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ProfilePage() {
 const uiStore = useUIStore()
 const cartStore = useCartStore()
 const userStore = useUserStore()
 const productStore = useProductStore()

 const products = useStoreData(productStore, s => s.getProducts()) || []

 const cart = useStoreData(cartStore, s => s.getCart())
 const favorites = useStoreData(userStore, s => s.getFavorites())
 const orderHistory = useStoreData(userStore, s => s.getOrderHistory())

 const setAuthModalOpen = (o: boolean) => uiStore.setAuthModalOpen(o)
 const setUserName = (n: string) => userStore.setUserName(n)
 const addToCart = (p: Product) => cartStore.addToCart(p)
 const addMultipleToCart = (p: Product[]) => cartStore.addMultipleToCart(p)
 const updateQuantity = (id: number, d: number) => cartStore.updateQuantity(id, d)
 const { data: session, status: authStatus } = useSession()
 const isAuthenticated = authStatus === "authenticated"
 const isLoadingSession = authStatus === "loading"
 const [activeTab, setActiveTab] = useState<TabLabel>("История заказов")
 const [isPageLoading, setIsPageLoading] = useState(true)

 useEffect(() => {
  const timer = setTimeout(() => setIsPageLoading(false), 600)
  return () => clearTimeout(timer)
 }, [])

 useEffect(() => {
  if (products.length === 0) {
   productStore.fetchProducts()
  }
 }, [])

  let displayName = isAuthenticated ? (session?.user?.name || "Пользователь") : "Гость";
  const localName = userStore.getUserName();
  if (isAuthenticated && displayName && /^[\d\s\-\+\(\)]+$/.test(displayName)) {
    displayName = localName || "Пользователь";
  } else if (isAuthenticated && localName && localName !== displayName && !/^[\d\s\-\+\(\)]+$/.test(localName)) {
    displayName = localName;
  }
  const isLoading = isLoadingSession || (isPageLoading && !isAuthenticated)
  const favoriteProducts = products.filter((p: Product) => favorites.includes(p.id))
 const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

 const handleLogout = async () => {
  await signOut({ callbackUrl: "/" })
 }

 const handleRepeatOrder = (order: any) => {
  const productsToAdd: Product[] = []
  order.items.forEach((item: CartItem) => {
   const product = products.find((p: any) => p.id === item.id)
   if (product) productsToAdd.push(product)
  })

  if (productsToAdd.length > 0) {
   addMultipleToCart(productsToAdd)
   setActiveTab("Корзина")
  }
 }

 return (
  <div className="min-h-screen bg-[#FAF8F5] font-montserrat flex flex-col">
   <Header showCategories={false} />

   <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 pb-24 pt-8">

    {/* Back */}
    <Link href="/market" className="inline-flex items-center gap-2 text-[#4A403A]/40 hover:text-smusl-terracotta transition-all mb-10 text-[15px] sm:text-[17px] font-black uppercase tracking-[0.1em] group">
     <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
     Назад в магазин
    </Link>

    {/* Header row */}
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6 mb-8">
     <div>
      <h1 className="text-[28px] sm:text-[40px] lg:text-[52px] font-bold text-[#CF8F73] leading-tight">
       Добро пожаловать,
      </h1>
      <h1 className="text-[32px] sm:text-[48px] lg:text-[60px] font-black text-[#CF8F73] leading-[0.95]">
       {displayName}!
      </h1>
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
         {(session?.user as any)?.role === "ADMIN" && (
          <Link
           href="/admin"
           className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-full bg-[#3A332E] text-white text-[14px] sm:text-[16px] font-bold hover:bg-black transition-colors shadow-sm active:scale-95"
          >
           Панель управления
          </Link>
         )}
         <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "rgba(254, 226, 226, 0.8)" }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-50/50 text-red-500 border border-red-200/50 text-[14px] font-bold backdrop-blur-md transition-all shadow-sm hover:shadow-md hover:border-red-300"
         >
          <motion.div
           variants={{
            hover: { x: 3 }
           }}
           transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
           <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </motion.div>
          Выйти
         </motion.button>
        </div>
       )}
      </div>
     </div>

     {/* Points block */}
     {isAuthenticated && (
      <div className="px-5 py-3 sm:px-6 sm:py-4 border-2 border-[#CF8F73]/30 rounded-[1.5rem] flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-0 bg-white shadow-sm self-start">
       <span className="text-[11px] text-[#CF8F73]/60 font-bold uppercase tracking-widest sm:mb-1">Всего баллов</span>
       <span className="text-[36px] sm:text-[44px] font-black text-[#4A403A] leading-none tracking-tight">102</span>
      </div>
     )}
    </div>

    {/* Tabs Navigation */}
    <div className="mt-12 sm:mt-16 mb-8 sm:mb-12 -mx-4 sm:mx-0">
     <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar pb-4 px-4 sm:px-1 after:content-[''] after:w-1 after:shrink-0 sm:after:hidden">
      {TABS.map(({ label, icon: Icon }) => (
       <button
        key={label}
        onClick={() => setActiveTab(label)}
        className={`flex items-center gap-2 px-5 sm:px-8 py-3 sm:py-4 rounded-[1.5rem] text-[14px] sm:text-[16px] font-bold border-2 shrink-0 whitespace-nowrap transition-all duration-300 ${activeTab === label
         ? "bg-white text-[#CF8F73] border-[#CF8F73] shadow-lg shadow-[#CF8F73]/10"
         : "bg-white text-smusl-gray/70 border-smusl-light-gray hover:border-smusl-gray/40 hover:text-smusl-gray"
         }`}
       >
        <Icon className={`w-4.5 h-4.5 shrink-0 ${activeTab === label ? "text-[#CF8F73]" : "text-smusl-gray/40"}`} />
        {label}
       </button>
      ))}
     </div>
    </div>

    {/* Content Area */}
    <AnimatePresence mode="wait">
     <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
     >
      {/* ── История заказов ── */}
      {activeTab === "История заказов" && (
       <div className="space-y-4">
        {isLoading ? (
         <div className="space-y-4">
          {[0, 1, 2].map(i => (
           <div key={i} className="h-32 bg-white rounded-[2rem] animate-pulse shadow-sm" />
          ))}
         </div>
        ) : orderHistory.length > 0 ? (
         orderHistory.map((order, i) => {
          const firstItem = order.items[0] as CartItem
          const firstProduct = products.find((p: any) => p.id === firstItem?.id)
          const extraCount = order.items.length - 1
          return (
           <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-500 overflow-hidden group"
           >
            {/* Mobile layout */}
            <div className="sm:hidden p-6 flex flex-col gap-5">
             <div className="flex gap-5">
              <div className="relative w-24 h-24 rounded-[1.6rem] overflow-hidden bg-[#FDFBF9] shrink-0 shadow-sm">
               {firstProduct?.image
                ? <Image src={firstProduct.image} alt={firstProduct.name} fill sizes="96px" className="object-cover" />
                : <div className="w-full h-full bg-smusl-beige/60" />
               }
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
               <p className="text-[18px] font-bold text-[#5B5047] leading-tight">{firstItem?.name}</p>
               {extraCount > 0 && <p className="text-[13px] text-[#CF8F73] font-black uppercase tracking-tighter">+{extraCount} товаров</p>}
               <p className="text-[20px] font-black text-[#5B5047]">{order.total} ₽</p>
              </div>
             </div>
             <div className="space-y-3 pt-4 border-t border-smusl-brown/[0.05]">
              <p className="text-[13px] text-smusl-gray/60 font-medium leading-relaxed">{order.address}</p>
              <button
               onClick={() => handleRepeatOrder(order)}
               className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#CD8B70] text-white rounded-[1.4rem] text-[15px] font-black uppercase tracking-widest shadow-lg shadow-[#CD8B70]/20 active:scale-95"
              >
               <RotateCcw className="w-4 h-4" />
               Повторить заказ
              </button>
             </div>
            </div>

            {/* Desktop layout */}
            <div className="hidden sm:flex items-center gap-10 p-8 lg:p-10">
             <div className="relative w-28 h-28 rounded-[2rem] overflow-hidden bg-[#FDFBF9] shrink-0 shadow-sm">
              {firstProduct?.image
               ? <Image src={firstProduct.image} alt={firstProduct.name} fill sizes="112px" className="object-cover" />
               : <div className="w-full h-full bg-smusl-beige/60" />
              }
             </div>
             <div className="flex-1 min-w-0">
              <p className="text-[20px] font-bold text-[#5B5047] leading-snug">{firstItem?.name}</p>
              <p className="text-[15px] text-smusl-gray/60 font-black mt-2">
               {firstProduct?.weight} × {firstItem?.quantity}
               {extraCount > 0 && <span className="ml-4 text-[#CF8F73] uppercase tracking-tighter">+{extraCount} ещё</span>}
              </p>
             </div>
             <div className="shrink-0 text-center px-4">
              <p className="text-[11px] text-smusl-gray/30 font-black uppercase tracking-[0.2em] mb-2">Дата</p>
              <p className="text-[15px] text-[#5B5047] font-bold">{order.date}</p>
             </div>
             <div className="shrink-0 max-w-[200px] px-4">
              <p className="text-[11px] text-smusl-gray/30 font-black uppercase tracking-[0.2em] mb-2">Адрес</p>
              <p className="text-[14px] text-[#5B5047]/80 font-medium leading-relaxed line-clamp-2">{order.address}</p>
             </div>
             <div className="shrink-0 text-right px-4">
              <p className="text-[11px] text-smusl-gray/30 font-black uppercase tracking-[0.2em] mb-2">Сумма</p>
              <p className="text-[26px] font-black text-[#5B5047]">{order.total} ₽</p>
             </div>
             <button
              onClick={() => handleRepeatOrder(order)}
              className="flex items-center gap-3 px-8 py-4.5 bg-[#CD8B70] text-white rounded-[1.6rem] text-[15px] font-black uppercase tracking-widest hover:brightness-105 transition-all active:scale-95 shadow-xl shadow-[#CD8B70]/20"
             >
              <RotateCcw className="w-4 h-4" />
              Повторить
             </button>
            </div>
           </motion.div>
          )
         })
        ) : (
         <EmptyState icon={Clock} text="История заказов пуста" linkText="Заказать что-нибудь вкусное" linkHref="/market" />
        )}
       </div>
      )}

      {/* ── Избранное ── */}
      {activeTab === "Избранное" && (
       <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {isLoading
         ? Array.from({ length: 4 }).map((_, i: number) => <ProductCardSkeleton key={i} />)
         : favoriteProducts.length > 0
          ? favoriteProducts.map((p: Product, i) => (
           <ProductCard key={p.id} {...p} onAdd={() => addToCart(p)} index={i} />
          ))
          : (
           <div className="col-span-full">
            <EmptyState icon={Heart} text="В избранном пока пусто" linkText="Перейти в магазин" linkHref="/market" />
           </div>
          )
        }
       </div>
      )}

      {/* ── Корзина ── */}
      {activeTab === "Корзина" && (
       cart.length > 0 ? (
        <div className="space-y-6">
         <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
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
         </div>
         <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-[#FDFBF9] px-8 sm:px-12 py-10 sm:py-12 rounded-[3rem] shadow-xl shadow-[#D9C5B2]/10 gap-8 mt-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-smusl-terracotta/5 rounded-full blur-[80px] -mr-24 -mt-24" />
          <div className="relative z-10 flex flex-col justify-center">
           <span className="block text-[11px] font-bold text-[#4A403A]/20 uppercase tracking-[0.4em] mb-2 px-1">итого к оплате</span>
           <div className="flex items-baseline gap-1 px-1">
            <span className="text-[40px] sm:text-[56px] font-black text-[#4A403A] leading-none tracking-tighter">{cartTotal.toLocaleString("ru-RU")}</span>
            <span className="text-[20px] sm:text-[28px] font-medium text-[#4A403A] ml-1">₽</span>
           </div>
          </div>
          <Link href="/market" className="relative z-10 text-center px-12 sm:px-16 py-6 sm:py-7 bg-[#CD8B70] text-white rounded-[2rem] text-[16px] sm:text-[18px] font-black uppercase tracking-[0.2em] hover:brightness-105 hover:scale-[1.02] transition-all shadow-2xl shadow-[#CD8B70]/30 active:scale-95">
           Оформить заказ
          </Link>
         </div>
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
