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
 const { setSelectedProduct } = useApp()

 const handleOpenModal = () => {
  setSelectedProduct(product)
 }

 return (
  <motion.div
   initial={{ opacity: 0, y: 15 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ duration: 0.5, delay: index * 0.05 }}
   onClick={handleOpenModal}
   className="bg-[#FAF7F5] rounded-[2rem] border border-[#F2F2F2] h-full transition-all duration-500 cursor-pointer group flex flex-col p-2.5 font-montserrat shadow-sm hover:shadow-xl hover:shadow-[#CF8F73]/5"
  >
   {/* Image Container */}
   <div className="relative aspect-[4/3] w-full rounded-[1.5rem] bg-[#F3ECE4] overflow-hidden mb-2.5 flex items-center justify-center">
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
     }}
     className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center text-[#D8D8D8] hover:text-[#CF8F73] transition-colors"
    >
     <Heart className="w-5 h-5 fill-current" />
    </motion.button>
   </div>

   {/* Info Container */}
   <div className="flex-1 flex flex-col gap-3 px-1.5 pb-1">
    <div>
     <div className="flex items-start justify-between gap-2 mb-1">
      <motion.h3 layoutId={`title-${id}`} className="text-[13px] font-bold text-[#5B5047] leading-[1.2] w-[65%]">
       {name}
      </motion.h3>
      <div className="text-[14px] font-black text-[#5B5047] shrink-0">
       {price} ₽<span className="text-[12px] font-medium">/шт</span>
      </div>
     </div>
     <div className="flex items-center justify-between">
      <p className="text-[11px] font-medium text-[#5B5047]/50 uppercase">
       {weight}
      </p>
      <p className="text-[11px] font-medium text-[#5B5047]/50 uppercase">
       в наличии 10 шт
      </p>
     </div>
    </div>

    <button
     onClick={(e) => {
      e.stopPropagation()
      onAdd()
     }}
     className="w-full h-[54px] mt-auto bg-[#CD8B70] rounded-[1rem] flex items-center justify-center gap-3 text-white hover:bg-[#b87a60] transition-all active:scale-[0.96] shadow-md shadow-[#CD8B70]/20"
    >
     <ShoppingBag className="w-5 h-5" />
     <span className="text-[14px] font-bold uppercase tracking-wide">Добавить в корзину</span>
    </button>
   </div>
  </motion.div>
 )
}

export default ProductCard
