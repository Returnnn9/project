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
import { products } from "@/data/products"
import { useUIStore, useCartStore, useStoreData } from "@/store/hooks"
import { ProductCardSkeleton } from "@/components/Skeleton"
import { motion, AnimatePresence } from "framer-motion"

export default function Home() {
 const uiStore = useUIStore()
 const cartStore = useCartStore()

 const isCartOpen = useStoreData(uiStore, s => s.getIsCartOpen())
 const activeCategory = useStoreData(uiStore, s => s.getActiveCategory())
 const searchQuery = useStoreData(uiStore, s => s.getSearchQuery())
 const selectedProduct = useStoreData(uiStore, s => s.getSelectedProduct())

 const cart = useStoreData(cartStore, s => s.getCart())

 const setCartOpen = (o: boolean) => uiStore.setCartOpen(o)
 const setActiveCategory = (c: string) => uiStore.setActiveCategory(c)
 const addToCart = (p: any) => cartStore.addToCart(p)
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

  return pCat === cat
 })

 return (
  <div className="min-h-screen bg-[#F5E6DA]/40 font-montserrat flex flex-col">
   <Header />

   <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 pb-20 pt-4 lg:pt-6">

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
     <aside className="hidden md:block md:sticky md:top-8">
      <CartSidebar />
     </aside>
    </div>

    {/* ── Mobile Cart Layer ── */}
    <AnimatePresence>
     {isCartOpen && (
      <div className="fixed inset-0 z-[100] md:hidden">
       {/* Glass Backdrop */}
       <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setCartOpen(false)}
        className="absolute inset-0 bg-[#2A1F1A]/70"
       />
       {/* Bottom Sheet Panel */}
       <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, { offset, velocity }) => {
         if (offset.y > 150 || velocity.y > 500) {
          setCartOpen(false)
         }
        }}
        className="absolute bottom-0 w-full h-[88vh] bg-[#F5E6DA] rounded-t-[2.5rem] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden"
       >
        <div
         className="w-full pt-4 pb-2 flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing"
         onClick={() => setCartOpen(false)}
        >
         <div className="w-12 h-1.5 rounded-full bg-[#4A403A]/20" />
        </div>
        <div className="flex-1 overflow-y-auto w-full px-2 sm:px-6 pb-6 scrollbar-hide">
         <CartSidebar isMobile={true} onClose={() => setCartOpen(false)} />
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
       className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[400px] md:hidden"
      >
       <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCartOpen(true)}
        className="w-full bg-[#CD8B70] text-white px-5 py-3.5 rounded-full shadow-[0_8px_30px_rgb(205,139,112,0.4)] flex relative items-center justify-between transition-colors overflow-hidden group"
       >
        <motion.div
         className="absolute inset-0 bg-white/20"
         animate={{ opacity: [0, 0.4, 0] }}
         transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        />
        <div className="flex items-center gap-3 relative z-10">
         <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          <motion.div
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           key={cart.length}
           className="absolute -top-1.5 -right-2 bg-[#F5E6DA] text-[#CD8B70] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
          >
           {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </motion.div>
         </div>
         <span className="font-bold text-[17px]">В корзину</span>
        </div>
        <span className="font-black text-[18px] relative z-10">
         {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString("ru-RU")} ₽
        </span>
       </motion.button>
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
