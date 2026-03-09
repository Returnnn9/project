"use client"

import React, { useState, useEffect } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ProductCard from "@/components/ProductCard"
import CartSidebar from "@/components/CartSidebar"
import dynamic from "next/dynamic"
const CheckoutModal = dynamic(() => import("@/components/CheckoutModal"), { ssr: false })
const ProductDetailsModal = dynamic(() => import("@/components/ProductDetailsModal"), { ssr: false })
const AddressModal = dynamic(() => import("@/components/AddressModal"), { ssr: false })
import { Search, ShoppingCart, X } from "lucide-react"
import { products } from "@/components/data"
import { useApp } from "@/store/AppContext"
import { ProductCardSkeleton } from "@/components/Skeleton"
import { motion, AnimatePresence } from "framer-motion"

export default function Home() {
 const {
  addToCart,
  isCartOpen,
  setCartOpen,
  cart,
  activeCategory,
  setActiveCategory,
  searchQuery,
  selectedProduct
 } = useApp();
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
  setIsLoading(true);
  const timer = setTimeout(() => setIsLoading(false), 800);
  return () => clearTimeout(timer);
 }, [activeCategory]);

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
  <div className="min-h-screen bg-[#F5E6DA]/40 font-montserrat flex flex-col">
   <Header />

   <main className="flex-1 w-full px-8 sm:px-6 lg:px-10 pb-20 pt-2 lg:pt-6">

    <div className="mb-8">
     <p className="text-[14px] sm:text-[16px] font-medium text-[#4A403A]/60">
      всего товаров в этой категории {filteredProducts.length}
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
        className="grid grid-cols-2 gap-1.5 sm:gap-3"
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
     {cart.length > 0 && !selectedProduct && (
      <motion.div
       initial={{ y: 100 }}
       animate={{ y: 0 }}
       exit={{ y: 100 }}
       className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[400px] sm:hidden"
      >
       <button
        onClick={() => setCartOpen(true)}
        className="w-full bg-[#CD8B70] text-white px-5 py-3.5 rounded-full shadow-[0_8px_30px_rgb(205,139,112,0.4)] flex relative items-center justify-between active:scale-[0.98] transition-transform"
       >
        <div className="flex items-center gap-3">
         <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          <div className="absolute -top-1.5 -right-2 bg-white text-[#CD8B70] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
           {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </div>
         </div>
         <span className="font-bold text-[17px]">В корзину</span>
        </div>
        <span className="font-black text-[18px]">
         {cart.reduce((sum, item) => sum + item.price * item.quantity, 0)} ₽
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
