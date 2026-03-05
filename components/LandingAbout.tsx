"use client";

import React from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

const LandingAbout = () => {
 const { scrollYProgress } = useScroll();
 const y = useTransform(scrollYProgress, [0, 1], [0, -150]);
 const yReverse = useTransform(scrollYProgress, [0, 1], [0, 150]);
 return (
  <section className="py-24 bg-[#FDF8ED]">
   <div className="container mx-auto px-4">
    {/* Section Header */}
    <div className="flex items-center justify-center gap-4 mb-24">
     <span className="font-manrope text-[32px] text-smusl-red/30 -mt-2">(</span>
     <div className="flex items-baseline gap-2">
      <span className="font-script text-3xl text-smusl-red lowercase">o</span>
      <h2 className="font-script text-[64px] text-smusl-red lowercase">Nas</h2>
     </div>
     <span className="font-manrope text-[32px] text-smusl-red/30 -mt-2">)</span>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
     {/* Left Column (4 cols) */}
     <div className="lg:col-span-4 space-y-6">
      <motion.div
       style={{ y }}
       whileInView={{ opacity: 1, y: 0 }}
       initial={{ opacity: 0, y: 50 }}
       transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
       viewport={{ once: true }}
       className="relative aspect-[16/11] rounded-[32px] overflow-hidden shadow-xl"
      >
       <Image
        src="/images/Rectangle 19.svg"
        alt="Chef at work"
        fill
        className="object-cover"
       />
      </motion.div>
      <p className="text-[12px] leading-snug text-smusl-red font-bold max-w-[280px]">
       «Смысл есть» — это пекарня в Москве, специализирующаяся на производстве безглютенового хлеба и выпечки
      </p>
     </div>

     {/* Right Column (8 cols) */}
     <div className="lg:col-span-8 space-y-20">
      {/* Description */}
      <motion.div
       whileInView={{ opacity: 1, x: 0 }}
       initial={{ opacity: 0, x: 50 }}
       transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
       viewport={{ once: true }}
       className="flex flex-col items-end text-right"
      >
       <div className="flex items-baseline justify-end w-full mb-0">
        <span className="font-script text-[120px] text-smusl-red leading-[0.5] mr-4 select-none">
         Мы
        </span>
        <div className="max-w-xl">
         <p className="text-[14px] md:text-[16px] lg:text-[18px] uppercase tracking-[0.05em] leading-[1.3] text-smusl-red font-bold">
          ПЕРВЫМИ В РОССИИ НАЧАЛИ ИМПОРТ ТЕФОВОЙ МУКИ И РАБОТАЕМ С ШИРОКИМ СПЕКТРОМ АЛЬТЕРНАТИВНОГО СЫРЬЯ:
         </p>
        </div>
       </div>
       <div className="max-w-2xl mt-1">
        <p className="text-[14px] md:text-[16px] lg:text-[18px] uppercase tracking-[0.05em] leading-[1.3] text-smusl-red font-bold">
         АМАРАНТОВОЙ, РИСОВОЙ, ГРЕЧНЕВОЙ, КУКУРУЗНОЙ, ОВСЯНОЙ И ОРЕХОВОЙ МУКОЙ. В АССОРТИМЕНТЕ БРЕНДА «СМЫСЛ ЕСТЬ» — БОЛЕЕ 20 ВИДОВ ПРОДУКЦИИ: ОТ ХЛЕБА ДО ДЕСЕРТОВ
        </p>
       </div>
      </motion.div>

      {/* Images Grid */}
      <div className="grid grid-cols-12 gap-8 items-start">
       <div className="col-span-9 space-y-6">
        <motion.div
         style={{ y: yReverse }}
         transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
         className="relative aspect-[16/10] rounded-[32px] overflow-hidden shadow-lg"
        >
         <Image
          src="/images/Rectangle 14.svg"
          alt="Artisanal Bread"
          fill
          className="object-cover"
         />
        </motion.div>
        <button className="flex items-center gap-3 text-[16px] font-bold uppercase tracking-widest text-smusl-red hover:translate-x-2 transition-all">
         СМОТРЕТЬ КАТАЛОГ
         <span className="text-2xl">↗</span>
        </button>
       </div>
       <div className="col-span-3">
        <div className="relative aspect-[2/5] rounded-[24px] overflow-hidden shadow-lg">
         <Image
          src="/images/Rectangle 13.svg"
          alt="Packaging"
          fill
          className="object-cover"
         />
        </div>
       </div>
      </div>
     </div>
    </div>
   </div>
  </section>
 );
};

export default LandingAbout;
