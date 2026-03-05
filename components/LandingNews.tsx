"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const news = [
 {
  id: 1,
  date: '12.03.2025',
  title: 'Секреты нашей пекарни: как мы делаем хлеб без глютена идеальным',
  image: '/images/Desert.png'
 },
 {
  id: 2,
  date: '10.03.2025',
  title: 'Новинка в меню: десерты, которые тают во рту',
  image: '/images/pistachio-nut.png'
 },
 {
  id: 3,
  date: '08.03.2025',
  title: 'Ингредиенты высшего качества: почему это важно для нас',
  image: '/images/pistachio-raspberry.png'
 },
 {
  id: 4,
  date: '05.03.2025',
  title: 'Здоровое питание с удовольствием: мифы и реальность',
  image: '/images/yellow-peanut.png'
 },
];

const LandingNews = () => {
 return (
  <section className="py-24 bg-[#FDF8ED]">
   <div className="container mx-auto px-4">
    {/* Section Header */}
    <div className="flex items-center justify-center gap-6 mb-20">
     <div className="w-12 h-12 rounded-full border border-smusl-red/20 flex items-center justify-center text-smusl-red font-script text-2xl lowercase">
      (
     </div>
     <h2 className="font-script text-6xl text-smusl-red lowercase">Новости</h2>
     <div className="w-12 h-12 rounded-full border border-smusl-red/20 flex items-center justify-center text-smusl-red font-script text-2xl lowercase">
      )
     </div>
    </div>

    {/* News Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
     {news.map((item, idx) => (
      <motion.div
       key={item.id}
       whileInView={{ opacity: 1, y: 0 }}
       initial={{ opacity: 0, y: 40 }}
       viewport={{ once: true }}
       transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
       className="group cursor-pointer"
      >
       <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow"
       >
        <Image
         src={item.image}
         alt={item.title}
         fill
         className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
       </motion.div>
       <div className="space-y-2">
        <p className="text-[10px] font-bold text-smusl-brown/40 uppercase tracking-widest">{item.date}</p>
        <h4 className="text-[12px] font-bold uppercase leading-tight text-smusl-brown group-hover:text-smusl-red transition-colors">
         {item.title}
        </h4>
       </div>
      </motion.div>
     ))}
    </div>
   </div>
  </section>
 );
};

export default LandingNews;
