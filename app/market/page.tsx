"use client"

import React, { useState, useEffect } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ProductCard from "@/components/ProductCard"
import CartSidebar from "@/components/CartSidebar"
import CheckoutModal from "@/components/CheckoutModal"
import ProductDetailsModal from "../../components/ProductDetailsModal"
import AddressModal from "@/components/AddressModal"
import { Search, ShoppingCart, X } from "lucide-react"
import { products } from "@/components/data"
import { useApp } from "@/store/AppContext"
import { ProductCardSkeleton } from "@/components/Skeleton"
import { motion, AnimatePresence } from "framer-motion"

export default function Home() {
 const { addToCart, isCartOpen, setCartOpen, cart } = useApp()
 const [activeCategory, setActiveCategory] = useState("Десерты")
 const [searchQuery, setSearchQuery] = useState("")
 const [isLoading, setIsLoading] = useState(true)

 useEffect(() => {
  setIsLoading(true)
  const timer = setTimeout(() => setIsLoading(false), 800)
  return () => clearTimeout(timer)
 }, [activeCategory])

 const filteredProducts = products.filter((p) => {
  const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
  if (!matchesSearch) return false

  const cat = activeCategory.toLowerCase()
  const pCat = p.category.toLowerCase()
  if (cat === "десерты") return pCat === "пирожные" || pCat === "торты"
  if (cat === "хлеб") return pCat === "хлеб"
  if (cat === "выпечка") return pCat === "слойка" || pCat === "эклеры"
  if (cat === "снеки") return pCat === "кексы и печенье"
  return false
 })

 return (
  <div className="min-h-screen bg-smusl-beige font-montserrat flex flex-col">
   <Header />

   <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 pb-20 pt-2 lg:pt-6">

    {/* ── Filter Bar ── */}
    <motion.div
     initial={{ opacity: 0, y: -20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.6, ease: "easeOut" }}
     className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 mb-12"
    >
     {/* Categories */}
     <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide shrink-0">
      {["Десерты", "Хлеб", "Снеки", "Выпечка"].map((cat) => (
       <button
        key={cat}
        onClick={() => setActiveCategory(cat)}
        className={`
         px-6 py-3.5 rounded-2xl text-[14px] font-bold border-2 whitespace-nowrap transition-all duration-300
         ${activeCategory === cat
          ? "bg-white border-smusl-terracotta text-smusl-terracotta shadow-lg shadow-smusl-terracotta/10"
          : "bg-white/50 border-transparent text-smusl-gray hover:bg-white hover:border-smusl-light-gray"
         }
        `}
       >
        {cat}
       </button>
      ))}
     </div>

     {/* Search */}
     <div className="relative w-full md:w-[320px] lg:w-[400px] group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A403A]/20 group-focus-within:text-smusl-terracotta transition-colors" />
      <input
       type="text"
       value={searchQuery}
       onChange={(e) => setSearchQuery(e.target.value)}
       placeholder="Поиск по товарам..."
       className="w-full bg-white/70 backdrop-blur-md border border-[#E8E8E8] rounded-2xl py-3.5 pl-11 pr-5 text-[14px] font-medium focus:outline-none focus:border-smusl-terracotta focus:bg-white transition-all shadow-sm placeholder:text-[#4A403A]/20"
      />
     </div>
    </motion.div>

    <div className="flex items-center justify-between mb-8">
     <motion.h2
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="text-[20px] font-black text-[#4A403A]"
     >
      {activeCategory}
     </motion.h2>
     <p className="text-[13px] font-bold text-[#4A403A]/30 uppercase tracking-widest">
      {filteredProducts.length} товаров
     </p>
    </div>

    {/* ── Main Layout Grid ── */}
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] xl:grid-cols-[1fr_500px] gap-4 items-start">

     {/* Products Grid */}
     <section>
      <AnimatePresence mode="wait">
       <motion.div
        key={activeCategory + searchQuery}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 gap-2"
       >
        {isLoading
         ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
         : filteredProducts.length > 0 ? (
          filteredProducts.map((p, i) => (
           <ProductCard key={p.id} {...p} onAdd={() => addToCart(p)} index={i} />
          ))
         ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white/40 rounded-[3rem] border-2 border-dashed border-[#E8E8E8]">
           <Search className="w-12 h-12 text-[#4A403A]/10 mb-4" />
           <p className="text-[#4A403A]/40 font-bold">Ничего не найдено</p>
          </div>
         )
        }
       </motion.div>
      </AnimatePresence>
     </section>

     {/* Sticky Cart Sidebar */}
     <aside className="hidden lg:block lg:sticky lg:top-8">
      <CartSidebar />
     </aside>
    </div>

    {/* ── Mobile Cart Layer ── */}
    <AnimatePresence>
     {isCartOpen && (
      <div className="fixed inset-0 z-[100] lg:hidden">
       {/* Glass Backdrop */}
       <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setCartOpen(false)}
        className="absolute inset-0 bg-[#2A1F1A]/50 backdrop-blur-md"
       />
       {/* Drawer Panel */}
       <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute right-0 top-0 h-full w-[88%] max-w-[420px] bg-[#F5E6DA] p-6 flex flex-col shadow-2xl"
       >
        <div className="flex justify-between items-center mb-6">
         <h3 className="text-[20px] font-black text-[#4A403A]">Ваша корзина</h3>
         <button
          onClick={() => setCartOpen(false)}
          className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-[#4A403A]/60 hover:text-[#4A403A] transition-colors"
         >
          <X className="w-5 h-5" />
         </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide -mx-6 px-6">
         <CartSidebar />
        </div>
       </motion.div>
      </div>
     )}
    </AnimatePresence>

    {/* ── Mobile FAB ── */}
    <AnimatePresence>
     {cart.length > 0 && (
      <motion.div
       initial={{ y: 100 }}
       animate={{ y: 0 }}
       exit={{ y: 100 }}
       className="fixed bottom-8 left-0 right-0 z-[90] lg:hidden px-6"
      >
       <button
        onClick={() => setCartOpen(true)}
        className="w-full h-16 bg-[#CF8F73] rounded-2xl flex items-center justify-between px-7 text-white shadow-2xl shadow-[#CF8F73]/40 active:scale-[0.98] transition-soft"
       >
        <div className="flex items-center gap-4">
         <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-white text-[#CF8F73] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
           {cart.reduce((s, i) => s + i.quantity, 0)}
          </span>
         </div>
         <span className="text-[17px] font-bold">В корзину</span>
        </div>
        <span className="text-[18px] font-black tracking-tighter">
         {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString("ru-RU")} ₽
        </span>
       </button>
      </motion.div>
     )}
    </AnimatePresence>

    {/* Modals */}
    <CheckoutModal />
    <ProductDetailsModal />
    <AddressModal />
   </main>

   <Footer />
  </div>
 )
}
