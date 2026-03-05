"use client";
import React from "react"
import { motion } from "framer-motion"
import { Heart, ShoppingBag } from "lucide-react"
import { useApp, Product } from "@/store/AppContext"

interface ProductCardProps extends Product {
 onAdd: () => void
 index?: number
}

const ProductCard: React.FC<ProductCardProps> = (props) => {
 const { onAdd, index = 0, ...product } = props
 const { id, name, weight, price, image } = product
 const { setSelectedProduct, favorites, toggleFavorite } = useApp()
 const isFavorite = favorites.includes(id)

 const handleOpenModal = () => {
  setSelectedProduct(product)
 }

 return (
  <motion.div
   initial={{ opacity: 0, y: 15 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ duration: 0.5, delay: index * 0.05 }}
   onClick={handleOpenModal}
   className="bg-[#FAF7F5] rounded-[1.5rem] border border-[#F2F2F2] h-full transition-all duration-500 cursor-pointer group flex flex-col p-2 font-montserrat shadow-sm hover:shadow-xl hover:shadow-[#CF8F73]/5"
  >
   {/* Image */}
   <div className="relative aspect-[4/3] w-full rounded-[1.1rem] bg-[#F3ECE4] overflow-hidden mb-2 flex items-center justify-center">
    <motion.img
     layoutId={`img-${id}`}
     src={image}
     alt={name}
     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
    <motion.button
     whileHover={{ scale: 1.15 }}
     whileTap={{ scale: 0.85, rotate: -10 }}
     onClick={(e) => {
      e.stopPropagation()
      toggleFavorite(id)
     }}
     className={`absolute top-2.5 right-2.5 h-8 w-8 rounded-full backdrop-blur-md shadow-md flex items-center justify-center transition-all ${isFavorite ? "bg-[#CD8B70] text-white" : "bg-white/90 text-[#D8D8D8] hover:text-[#CF8F73]"}`}
    >
     <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-white" : "fill-none"}`} />
    </motion.button>
   </div>

   {/* Info */}
   <div className="flex-1 flex flex-col gap-2 px-1 pb-0.5">
    <div>
     <div className="flex items-start justify-between gap-1 mb-0.5">
      <motion.h3 layoutId={`title-${id}`} className="text-[11px] sm:text-[12px] font-bold text-[#5B5047] leading-[1.3] flex-1">
       {name}
      </motion.h3>
      <div className="text-[12px] sm:text-[13px] font-black text-[#5B5047] shrink-0 leading-tight">
       {price} ₽<span className="text-[10px] font-medium">/шт</span>
      </div>
     </div>
     <div className="flex items-center justify-between">
      <p className="text-[9px] sm:text-[10px] font-medium text-[#5B5047]/50 uppercase tracking-wide">
       {weight}
      </p>
      <p className="text-[9px] sm:text-[10px] font-medium text-[#5B5047]/40 uppercase">
       10 шт
      </p>
     </div>
    </div>

    <button
     onClick={(e) => {
      e.stopPropagation()
      onAdd()
     }}
     className="w-full h-11 mt-auto bg-[#CD8B70] rounded-[0.75rem] flex items-center justify-center gap-2 text-white hover:bg-[#b87a60] transition-all active:scale-[0.96] shadow-sm shadow-[#CD8B70]/20"
    >
     <ShoppingBag className="w-4 h-4 shrink-0" />
     <span className="text-[12px] font-bold uppercase tracking-wide">В корзину</span>
    </button>
   </div>
  </motion.div>
 )
}

export default ProductCard
