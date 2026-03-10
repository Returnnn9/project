"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

import { categories } from '@/data/products';
import { useProductStore, useStoreData } from '@/store/hooks';

const LandingProducts = () => {
 const [activeTab, setActiveTab] = useState('desserts');
 const productStore = useProductStore();
 const products = useStoreData(productStore, s => s.getProducts()) || [];

 useEffect(() => {
  if (products.length === 0) {
   productStore.fetchProducts();
  }
 }, []);

 const filteredProducts = products.filter(p => p.category === activeTab);

 return (
  <section id="menu" className="pt-32 pb-24 bg-[#FAF8F5]">
   <div className="w-full max-w-[1700px] mx-auto px-4 md:px-8 lg:px-12">

    {/* Section Header */}
    <div className="flex flex-col xl:flex-row items-center justify-between mb-24 lg:mb-32 gap-12 relative w-full">
     {/* Title with decorative elements */}
     <div className="flex items-center gap-4 md:gap-8 mx-auto xl:mx-0 xl:absolute xl:left-1/2 xl:-translate-x-1/2 group">
      <motion.span
       animate={{ x: [-5, 0, -5] }}
       transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
       className="font-manrope text-[40px] md:text-[64px] lg:text-[90px] font-thin text-[#B54442]/30 select-none translate-y-2"
      >
       (
      </motion.span>
      <h2 className="font-script text-[60px] md:text-[90px] lg:text-[130px] font-bold text-[#B54442] lowercase leading-none drop-shadow-sm pt-4 tracking-[0.08em] transition-all duration-700 group-hover:tracking-[0.12em]" style={{ display: 'inline-block', transform: 'scaleX(1.15)', transformOrigin: 'center' }}>
       наша выпечка
      </h2>
      <motion.span
       animate={{ x: [5, 0, 5] }}
       transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
       className="font-manrope text-[40px] md:text-[64px] lg:text-[90px] font-thin text-[#B54442]/30 select-none translate-y-2"
      >
       )
      </motion.span>
     </div>

     {/* Filters - Glassmorphism Style */}
     <div className="flex gap-4 md:gap-6 xl:ml-auto z-10 w-full xl:w-auto justify-center xl:justify-end flex-wrap pt-8 xl:pt-0">
      {categories.map((cat) => (
       <button
        key={cat.id}
        onClick={() => setActiveTab(cat.id)}
        className={`px-8 md:px-12 py-2.5 rounded-full text-[14px] md:text-[16px] xl:text-[18px] font-bold transition-all duration-500 border-2 active:scale-95 ${activeTab === cat.id
         ? 'bg-[#B54442] text-white border-[#B54442] shadow-[0_10px_25px_-5px_rgba(181,68,66,0.3)]'
         : 'bg-white/50 backdrop-blur-sm text-[#A68064] border-[#A68064]/20 hover:border-[#B54442]/40'
         }`}
       >
        {cat.label}
       </button>
      ))}
     </div>
    </div>

    {/* Products Grid - Exact Match Array Mapping */}
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 xl:gap-14 mb-32 items-start max-w-[1600px] mx-auto`}>
     <AnimatePresence mode="popLayout">
      {filteredProducts.map((product, idx) => {
       if (product.type === 'empty') {
        return <div key={product.id} className={product.gridArea}></div>;
       }
       return (
        <motion.div
         key={product.id}
         initial={{ opacity: 0, scale: 0.9, y: 20 }}
         whileInView={{ opacity: 1, scale: 1, y: 0 }}
         viewport={{ once: true }}
         exit={{ opacity: 0, scale: 0.9 }}
         transition={{ duration: 0.8, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
         className={`group cursor-pointer ${product.gridArea}`}
        >
         <div className={`relative rounded-[24px] overflow-hidden bg-white shadow-sm group-hover:shadow-2xl transition-all duration-700 ease-[0.16,1,0.3,1] aspect-square w-full ring-1 ring-[#4A403A]/5`}>
          <Image
           src={product.image || ''}
           alt={product.name}
           fill
           priority={idx < 4}
           sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
           className="object-cover group-hover:scale-[1.1] transition-transform duration-1000"
          />
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
         </div>
         <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-4 text-center"
         >
          <span className="text-[12px] font-bold text-smusl-red/40 uppercase tracking-widest">{product.name}</span>
         </motion.div>
        </motion.div>
       );
      })}
     </AnimatePresence>
    </div>

    {/* Ingredient Philosophy Section */}
    <motion.div
     initial="hidden"
     whileInView="visible"
     viewport={{ once: true, margin: "-100px" }}
     variants={{
      hidden: { opacity: 0 },
      visible: {
       opacity: 1,
       transition: { staggerChildren: 0.2 }
      }
     }}
     className="relative max-w-4xl mx-auto text-center space-y-8 md:space-y-12 py-12 md:py-20"
    >
     <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] -z-10 pointer-events-none">
      <Image src="/images/Logoo.png" alt="Watermark" width={400} height={400} />
     </div>

     <motion.h3
      variants={{
       hidden: { opacity: 0, y: 30, scale: 0.95 },
       visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
      }}
      className="text-[32px] md:text-5xl lg:text-[54px] font-medium uppercase tracking-[0.02em] text-smusl-red leading-[1.2]"
     >
      Спокойствие в каждом<br className="hidden md:block" /> ингредиенте
     </motion.h3>

     <motion.p
      variants={{
       hidden: { opacity: 0, y: 20 },
       visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
      }}
      className="text-[14px] md:text-[16px] lg:text-[17px] font-bold leading-[1.6] text-smusl-red uppercase max-w-3xl mx-auto tracking-[0.05em]"
     >
      Мы знаем, как непросто найти по-настоящему вкусную и <br className="hidden md:block" />
      безопасную выпечку без глютена — без компромиссов во вкусе,<br className="hidden md:block" />
      текстуре и качестве.<br className="hidden md:block" />
      Поэтому каждый рецепт мы разрабатываем с вниманием к<br className="hidden md:block" />
      деталям: от тщательно подобранной муки до натуральных<br className="hidden md:block" />
      ингредиентов без скрытых добавок.
     </motion.p>

     <motion.div
      variants={{
       hidden: { opacity: 0, y: 20, scale: 0.9 },
       visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
      }}
      className="font-script text-[48px] md:text-[70px] lg:text-[90px] text-smusl-red lowercase pt-8 drop-shadow-sm"
     >
      Свобода наслаждаться каждым кусочком!
     </motion.div>
    </motion.div>
   </div>
  </section>
 );
};

export default LandingProducts;
