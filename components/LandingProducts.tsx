"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
 { id: 'desserts', label: 'Десерты' },
 { id: 'pastries', label: 'Выпечка' },
 { id: 'bread', label: 'Хлеб' },
];

const products = [
 { id: 1, name: 'Cloud Cake', category: 'desserts', image: '/images/Desert.png' },
 { id: 2, name: 'Pistachio Cube', category: 'desserts', image: '/images/pistachio-nut.png' },
 { id: 3, name: 'Berry Delight', category: 'desserts', image: '/images/pistachio-raspberry.png' },
 { id: 4, name: 'Yellow Peanut', category: 'desserts', image: '/images/yellow-peanut.png' },
 { id: 5, name: 'Premium Pastry', category: 'pastries', image: '/images/Desert.png' },
 { id: 6, name: 'Artisan Sourdough', category: 'bread', image: '/images/Desert.png' },
];

const LandingProducts = () => {
 const [activeTab, setActiveTab] = useState('desserts');

 const filteredProducts = products.filter(p => p.category === activeTab);

 return (
  <section className="py-24 bg-[#FDF8ED]">
   <div className="container mx-auto px-4">
    {/* Section Header */}
    <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
     <div className="flex items-center gap-6">
      <div className="w-12 h-12 rounded-full border border-smusl-red/20 flex items-center justify-center text-smusl-red font-script text-2xl lowercase">
       (
      </div>
      <h2 className="font-script text-6xl text-smusl-red lowercase">Наша выпечка</h2>
      <div className="w-12 h-12 rounded-full border border-smusl-red/20 flex items-center justify-center text-smusl-red font-script text-2xl lowercase">
       )
      </div>
     </div>

     {/* Filters */}
     <div className="flex bg-[#F3EFE4] rounded-full p-1 border border-[#EAE5D8]">
      {categories.map((cat) => (
       <button
        key={cat.id}
        onClick={() => setActiveTab(cat.id)}
        className={`px-8 py-2.5 rounded-full text-[13px] font-bold uppercase tracking-widest transition-all ${activeTab === cat.id
         ? 'bg-white text-smusl-red shadow-md'
         : 'text-[#B54442] hover:text-smusl-red'
         }`}
       >
        {cat.label}
       </button>
      ))}
     </div>
    </div>

    {/* Products Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
     <AnimatePresence mode="wait">
      {filteredProducts.map((product, idx) => (
       <motion.div
        key={product.id}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="group cursor-pointer"
       >
        <div className="relative aspect-square rounded-[40px] overflow-hidden bg-white mb-6 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] group-hover:shadow-[0_40px_80px_-20px_rgba(181,68,66,0.15),0_0_1px_1px_rgba(255,255,255,0.8)_inset] transition-all duration-700 ease-[0.16,1,0.3,1] group-hover:scale-[1.02] group-hover:shadow-[0_40px_100px_-30px_rgba(0,0,0,0.2),0_10px_40px_-15px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.2),inset_0_0_0_2px_rgba(255,255,255,0.1)]">
         <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover p-4 group-hover:scale-110 transition-transform duration-700"
         />
        </div>
       </motion.div>
      ))}
     </AnimatePresence>
    </div>

    {/* Ingredient Philosophy Section */}
    <motion.div
     initial={{ opacity: 0, scale: 0.9 }}
     whileInView={{ opacity: 1, scale: 1 }}
     viewport={{ once: true }}
     transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
     className="relative max-w-5xl mx-auto text-center space-y-10 py-12"
    >
     <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] -z-10 pointer-events-none">
      <Image src="/images/Logoo.png" alt="Watermark" width={400} height={400} />
     </div>
     <h3 className="text-4xl md:text-5xl font-bold uppercase tracking-tight text-smusl-accent-red leading-tight">
      Спокойствие в каждом ингредиенте
     </h3>
     <p className="text-md md:text-lg uppercase tracking-[0.15em] leading-relaxed text-smusl-red max-w-3xl mx-auto font-medium">
      Мы знаем, как непросто найти по-настоящему вкусную и безопасную выпечку без глютена — без компромиссов во вкусе, текстуре и качестве. Поэтому каждый рецепт мы разрабатываем с вниманием к деталям: от тщательно подобранной муки до натуральных ингредиентов без скрытых добавок.
     </p>
     <div className="font-script text-5xl md:text-6xl text-smusl-red lowercase pt-6">
      Свобода наслаждаться каждым кусочком!
     </div>
    </motion.div>
   </div>
  </section>
 );
};

export default LandingProducts;
