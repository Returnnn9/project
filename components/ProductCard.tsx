"use client"

import React from "react"
import { motion } from "framer-motion"
import { Heart, ShoppingBag } from "lucide-react"
import { useApp, Product } from "@/store/AppContext"

// ─── Props ───────────────────────────────────────────────────────────────────

interface ProductCardProps extends Product {
 onAdd: () => void
 index?: number
}

// ─── Component ───────────────────────────────────────────────────────────────

const ProductCard: React.FC<ProductCardProps> = ({ onAdd, index = 0, ...product }) => {
 const { id, name, weight, price, image } = product
 const { setSelectedProduct, favorites, toggleFavorite } = useApp()
 const isFavorite = favorites.includes(id)

 return (
  <motion.div
   initial={{ opacity: 0, y: 15 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ duration: 0.5, delay: index * 0.05 }}
   onClick={() => setSelectedProduct(product)}
   className="bg-[#FAF7F5] rounded-[0.9rem] sm:rounded-[1.5rem] border border-[#F2F2F2] h-full transition-all duration-500 cursor-pointer group flex flex-col p-1 sm:p-2 font-montserrat shadow-sm hover:shadow-xl hover:shadow-[#CF8F73]/5"
  >
   {/* Image */}
   <div className="relative aspect-[3/2] w-full rounded-[0.6rem] sm:rounded-[1.1rem] bg-[#F3ECE4] overflow-hidden mb-1 sm:mb-2">
    <motion.img
     layoutId={`img-${id}`}
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
     className={`absolute top-1.5 right-1.5 xs:top-2 xs:right-2 h-7 w-7 xs:h-8 xs:w-8 sm:h-10 sm:w-10 rounded-full backdrop-blur-md shadow-md flex items-center justify-center transition-all ${isFavorite ? "bg-[#CD8B70] text-white" : "bg-white/95 text-[#D8D8D8] hover:text-[#CF8F73]"
      }`}
    >
     <Heart className={`w-3 xs:w-3.5 sm:w-5 h-3 xs:h-3.5 sm:h-5 ${isFavorite ? "fill-white" : "fill-none"}`} />
    </motion.button>
   </div>

   {/* Info */}
   <div className="flex-1 flex flex-col gap-3 sm:gap-4 px-2 sm:px-3 pb-2 sm:pb-3">
    <div className="space-y-1.5 sm:space-y-2">
     {/* Title & Price Row */}
     <div className="flex flex-col xl:flex-row xl:items-baseline justify-between gap-1 xl:gap-3">
      <motion.h3
       layoutId={`title-${id}`}
       className="text-[13px] xs:text-[14px] sm:text-[16px] xl:text-[20px] font-bold text-[#4A403A] leading-tight"
      >
       {name}
      </motion.h3>
      <div className="text-[14px] xs:text-[15px] sm:text-[17px] xl:text-[22px] font-[900] text-[#4A403A] whitespace-nowrap xl:text-right">
       {price} ₽/шт
      </div>
     </div>

     {/* Row 2: Weight & Stock */}
     <div className="flex items-center justify-between text-[#8E8278] mt-0.5">
      <p className="text-[11px] xs:text-[12px] sm:text-[13px] xl:text-[15px] font-medium">{weight}</p>
      <p className="text-[10px] xs:text-[11px] sm:text-[12px] xl:text-[15px] font-medium text-right text-[#8E8278]/70">в наличии 10 шт</p>
     </div>
    </div>

    <button
     onClick={(e) => { e.stopPropagation(); onAdd() }}
     className="w-full h-9 xs:h-10 sm:h-12 xl:h-14 mt-auto bg-[#CD8B70] rounded-[0.7rem] sm:rounded-[0.9rem] flex items-center justify-center gap-1.5 sm:gap-2.5 text-white hover:bg-[#b87a60] transition-all active:scale-[0.96] shadow-[0_6px_15px_-4px_rgba(205,139,112,0.3)]"
    >
     <ShoppingBag className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 xl:w-5 xl:h-5 shrink-0" />
     <span className="text-[11px] xs:text-[12px] sm:text-[13px] xl:text-[15px] font-bold">Добавить в корзину</span>
    </button>
   </div>
  </motion.div>
 )
}

export default ProductCard
