"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const newsItems = [
 {
  id: 1,
  date: '03.02.2026',
  title: 'Безопасность безглютенового производства',
  image: '/images/Rectangle 19.svg',
  aspectRatio: 'aspect-[4/5] sm:aspect-square md:aspect-[4/5]'
 },
 {
  id: 2,
  date: '23.02.2026',
  title: 'Технология безглютеновой выпечки: зачем нужны псиллиум, ксантан и точная гидратация',
  image: '/images/Rectangle 17.svg',
  aspectRatio: 'aspect-video sm:aspect-[3/2]'
 },
 {
  id: 3,
  date: '11.02.2026',
  title: 'Мифы о безглютеновом хлебе: почему он может быть вкусным и полезным',
  image: '/images/Rectangle15.svg',
  aspectRatio: 'aspect-[4/5] sm:aspect-square md:aspect-[4/5]'
 },
 {
  id: 4,
  date: '11.02.2026',
  title: 'Мифы о безглютеновом хлебе: почему он может быть вкусным и полезным',
  image: '/images/Rectangle 16.svg',
  aspectRatio: 'aspect-video sm:aspect-[3/2]'
 },
];

const LandingNews = () => {
 return (
  <section id="news" className="py-24 bg-[#FAF8F5]">
   <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12">
    {/* Section Header */}
    <div className="flex items-center justify-center gap-4 md:gap-8 mb-16 lg:mb-20">
     <span className="font-manrope text-[40px] md:text-[64px] font-thin text-smusl-red/40 select-none translate-y-2">(</span>
     <h2 className="font-script text-5xl md:text-7xl lg:text-8xl text-smusl-red lowercase">Новости</h2>
     <span className="font-manrope text-[40px] md:text-[64px] font-thin text-smusl-red/40 select-none translate-y-2">)</span>
    </div>

    {/* News Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14 mb-16 items-start">
     {newsItems.map((item, idx) => (
      <motion.div
       key={item.id}
       whileInView={{ opacity: 1, y: 0 }}
       initial={{ opacity: 0, y: 40 }}
       viewport={{ once: true }}
       transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
       className="flex flex-col group cursor-pointer"
      >
       <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`relative ${item.aspectRatio} rounded-[16px] md:rounded-[24px] overflow-hidden mb-6 lg:mb-8 shadow-sm group-hover:shadow-md transition-shadow w-full`}
       >
        <Image
         src={item.image}
         alt={item.title}
         fill
         className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
       </motion.div>

       <div className="flex flex-col space-y-4 lg:space-y-5 px-1">
        <h4 className="text-[17px] sm:text-[19px] lg:text-[21px] xl:text-[23px] font-normal uppercase leading-[1.25] text-[#B56D56] group-hover:opacity-80 transition-opacity tracking-[0.02em] max-w-[100%]">
         {item.title}
        </h4>
        <p className="text-[14px] sm:text-[15px] lg:text-[16px] xl:text-[17px] font-light text-[#C29787] uppercase tracking-wide">
         {item.date}
        </p>
       </div>
      </motion.div>
     ))}
    </div>

    {/* Scroll Arrows */}
    <div className="flex items-center justify-center gap-6 lg:gap-8 pt-4">
     <button className="text-[#B56D56] hover:opacity-60 transition-opacity p-2">
      {/* Custom thin arrow left */}
      <svg width="32" height="12" viewBox="0 0 32 12" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M0.46967 5.46967C0.176777 5.76256 0.176777 6.23744 0.46967 6.53033L5.24264 11.3033C5.53553 11.5962 6.01041 11.5962 6.3033 11.3033C6.59619 11.0104 6.59619 10.5355 6.3033 10.2426L2.06066 6L6.3033 1.75736C6.59619 1.46447 6.59619 0.989593 6.3033 0.696699C6.01041 0.403806 5.53553 0.403806 5.24264 0.696699L0.46967 5.46967ZM32 5.25L1 5.25V6.75L32 6.75V5.25Z" fill="currentColor" />
      </svg>
     </button>

     <button className="text-[#B56D56] hover:opacity-60 transition-opacity p-2">
      {/* Custom thin arrow right */}
      <svg width="32" height="12" viewBox="0 0 32 12" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M31.5303 6.53033C31.8232 6.23744 31.8232 5.76256 31.5303 5.46967L26.7574 0.696699C26.4645 0.403806 25.9896 0.403806 25.6967 0.696699C25.4038 0.989593 25.4038 1.46447 25.6967 1.75736L29.9393 6L25.6967 10.2426C25.4038 10.5355 25.4038 11.0104 25.6967 11.3033C25.9896 11.5962 26.4645 11.5962 26.7574 11.3033L31.5303 6.53033ZM0 6.75H31V5.25H0V6.75Z" fill="currentColor" />
      </svg>
     </button>
    </div>
   </div>
  </section>
 );
};

export default LandingNews;
