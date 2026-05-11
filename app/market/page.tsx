"use client"

import React, { useEffect } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ProductCard from "@/components/ProductCard"
import CartSidebar from "@/components/CartSidebar"

import { Search, ShoppingCart } from "lucide-react"
import { useUIStore, useCartStore, useProductStore } from "@/store/hooks"
import { Product } from "@/store/types"
import { ProductCardSkeleton } from "@/components/Skeleton"
import { motion, AnimatePresence } from "framer-motion"

export default function MarketPage() {
  const isCartOpen = useUIStore(s => s.isCartOpen)
  const setCartOpen = useUIStore(s => s.setCartOpen)
  const activeCategory = useUIStore(s => s.activeCategory)
  const searchQuery = useUIStore(s => s.searchQuery)
  const selectedProduct = useUIStore(s => s.selectedProduct)

  const cart = useCartStore(s => s.cart)
  const addToCart = useCartStore(s => s.addToCart)

  const products = useProductStore(s => s.products) || []
  const isLoading = useProductStore(s => s.isLoading)
  const fetchProducts = useProductStore(s => s.fetchProducts)

  const [hasFetched, setHasFetched] = React.useState(false)
  const isInitialMount = React.useRef(true)

  useEffect(() => {
    const init = async () => {
      if (products.length === 0) {
        await fetchProducts()
      }
      setHasFetched(true)
      isInitialMount.current = false
    }
    init()
  }, [fetchProducts, products.length])

  const filteredProducts = products.filter((p: Product) => {
    const tokens = searchQuery.toLowerCase().split(' ').filter(Boolean)
    const matchesSearch = tokens.length === 0 || tokens.every(t =>
      p.name.toLowerCase().includes(t) ||
      (p.description && p.description.toLowerCase().includes(t))
    )
    const matchesCategory = !searchQuery.trim()
      ? p.category.toLowerCase() === activeCategory.toLowerCase()
      : true
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-smusl-beige font-montserrat flex flex-col">
      <Header />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 pb-32 pt-4 lg:pt-6">

        <div className="mb-8">
          <p className="text-[16px] font-medium text-[#4A403A]/60">
            всего товаров в этой категории {filteredProducts.length}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_500px] gap-4 items-start">
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
                {(isLoading || (!hasFetched && products.length === 0))
                  ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
                  : filteredProducts.length > 0 ? (
                  filteredProducts.map((p: Product, i: number) => (
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

          <aside className="hidden md:block md:sticky md:top-8">
            <CartSidebar />
          </aside>
        </div>

        <AnimatePresence>
          {isCartOpen && (
            <div className="fixed inset-0 z-[100] md:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCartOpen(false)}
                className="absolute inset-0 bg-[#2A1F1A]/70"
              />
              <motion.div
                initial={{ y: "100%", opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0.5 }}
                transition={{ type: "spring", damping: 32, stiffness: 300 }}
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
                  className="w-full pt-5 pb-3 flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing group relative z-10"
                  onClick={() => setCartOpen(false)}
                >
                  {/* Soft glow behind the handle */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-20 h-6 bg-[#CF8F73]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* The handle */}
                  <div className="w-14 h-[5px] rounded-full bg-[#4A403A]/15 border border-[#4A403A]/5 shadow-[0_1px_2px_rgba(255,255,255,0.8)_inset,0_1px_3px_rgba(0,0,0,0.05)] relative overflow-hidden transition-all duration-300 group-active:scale-95 group-active:bg-[#4A403A]/25">
                    <motion.div
                      className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full"
                      animate={{ translateX: ["-100%", "200%"] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", repeatDelay: 0.5 }}
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-hidden w-full px-2 sm:px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                  <CartSidebar isMobile={true} onClose={() => setCartOpen(false)} />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {cart.length > 0 && !selectedProduct && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[400px] md:hidden"
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
                <div className="flex items-center gap-2 sm:gap-3 relative z-10 min-w-0">
                  <div className="relative shrink-0">
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      key={cart.length}
                      className="absolute -top-1.5 -right-2 bg-white text-[#CA8A70] text-[10px] font-[900] w-4 h-4 rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
                    >
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </motion.div>
                  </div>
                  <span className="font-bold text-[14px] sm:text-[17px] truncate uppercase tracking-wide">В корзину</span>
                </div>
                <span className="font-black text-[15px] sm:text-[18px] relative z-10 shrink-0 ml-2">
                  {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString("ru-RU")} ₽
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <Footer />
    </div>
  )
}
