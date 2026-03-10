"use client"

import React from "react"
import { motion } from "framer-motion"
import { Heart, ShoppingBag } from "lucide-react"
import { Product } from "@/store/types"
import { useUIStore, useUserStore, useStoreData } from "@/store/hooks"

// ─── Props ───────────────────────────────────────────────────────────────────

interface ProductCardProps extends Product {
 onAdd: () => void
 index?: number
}

// ─── Component ───────────────────────────────────────────────────────────────

const ProductCard: React.FC<ProductCardProps> = ({ onAdd, index = 0, ...product }) => {
 const { id, name, weight, price, image } = product

 const uiStore = useUIStore()
 const userStore = useUserStore()

 const favorites = useStoreData(userStore, s => s.getFavorites())
 const isFavorite = favorites.includes(id)

 const setSelectedProduct = (p: any) => uiStore.setSelectedProduct(p)
 const toggleFavorite = (id: number) => userStore.toggleFavorite(id)

 return (
  <motion.div
   initial={{ opacity: 0, y: 15 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ duration: 0.5, delay: index * 0.05 }}
   onClick={() => setSelectedProduct(product)}
   className="bg-[#FAF7F5] rounded-[1.2rem] sm:rounded-[1.5rem] border border-[#F2F2F2] h-full transition-all duration-500 cursor-pointer group flex flex-col p-1.5 sm:p-3 font-montserrat shadow-sm hover:shadow-xl hover:shadow-[#CF8F73]/5"
  >
   {/* Image */}
   <div className="relative aspect-[4/3] w-full rounded-[0.8rem] sm:rounded-[1.1rem] bg-[#F3ECE4] overflow-hidden mb-2 sm:mb-2">
    <motion.img
     src={image}
     alt={name}
     loading="lazy"
     decoding="async"
     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
    <motion.button
     whileHover={{ scale: 1.1 }}
     whileTap={{ scale: 0.9, rotate: -10 }}
     onClick={(e) => { e.stopPropagation(); toggleFavorite(id) }}
     className={`absolute top-2 right-2 xs:top-2.5 xs:right-2.5 h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 rounded-full shadow-md flex items-center justify-center transition-all ${isFavorite ? "bg-[#CD8B70] text-white" : "bg-white text-[#D8D8D8] hover:text-[#CF8F73]"
      }`}
    >
     <Heart className={`w-3 xs:w-3.5 sm:w-5 h-3 xs:h-3.5 sm:h-5 ${isFavorite ? "fill-white" : "fill-none"}`} />
    </motion.button>
   </div>

   <div className="flex-1 flex flex-col gap-3 sm:gap-4 px-2 xs:px-3 sm:px-4 pb-3 sm:pb-4">
    <div className="flex flex-col justify-between pt-1 sm:pt-2">
     <div className="space-y-0.5 sm:space-y-1">
      {/* Title & Price Row */}
      <div className="flex items-start justify-between gap-1.5 sm:gap-4 w-full overflow-hidden">
       <motion.h3
        className="text-[15px] xs:text-[16px] sm:text-[20px] xl:text-[22px] font-bold text-[#6B5D54] leading-[1.15] tracking-tight line-clamp-2 flex-1 min-w-0 pr-1 break-words"
       >
        {name}
       </motion.h3>
       <div className="text-[17px] xs:text-[18px] sm:text-[24px] xl:text-[26px] font-[900] text-[#6B5D54] whitespace-nowrap text-right shrink-0 tracking-tight pt-0.5">
        {price} ₽/шт
       </div>
      </div>

      {/* Row 2: Weight & Stock */}
      <div className="flex items-center justify-between">
       <p className="text-[15px] sm:text-[17px] font-medium text-[#9C9188]">{weight}</p>
       <p className="text-[14px] sm:text-[16px] font-medium text-[#9C9188]/70 text-right">в наличии 10 шт</p>
      </div>
     </div>
    </div>

    <button
     onClick={(e) => { e.stopPropagation(); onAdd() }}
     className="w-full h-12 xs:h-14 sm:h-16 mt-auto bg-[#CF8F73] rounded-[1rem] flex items-center justify-center gap-2 text-white hover:bg-[#C27E63] transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.96] shadow-[0_6px_16px_rgba(207,143,115,0.25)] hover:shadow-[0_8px_24px_rgba(207,143,115,0.4)] select-none touch-manipulation transform-gpu"
    >
     <ShoppingBag className="w-4 h-4 xs:w-5 xs:h-5 shrink-0 pointer-events-none drop-shadow-sm" />
     <span className="text-[14px] xs:text-[16px] sm:text-[18px] font-bold pointer-events-none drop-shadow-sm">Добавить в корзину</span>
    </button>
   </div>
  </motion.div>
 )
}

export default ProductCard
