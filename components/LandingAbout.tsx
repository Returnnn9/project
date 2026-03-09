"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

const LandingAbout = () => {
 return (
  <section className="py-20 md:py-32 lg:py-40 bg-[#F4EEE9] overflow-hidden relative">
   <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-40">

    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 xl:gap-24 2xl:gap-32">

     {/* Left Side: Large Hero Image */}
     <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="w-full lg:w-[48%] xl:w-[45%] 2xl:w-[42%]"
     >
      <div className="relative aspect-[1.1/1] w-full rounded-[40px] overflow-hidden shadow-2xl shadow-smusl-brown/10 border border-white/20">
       <Image
        src="/images/croissant_promo.png"
        alt="СМЫСЛ ЕСТЬ — Безглютеновая выпечка"
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
        priority
       />
      </div>
     </motion.div>

     {/* Right Side: Content */}
     <div className="w-full lg:w-[50%] xl:w-[50%] 2xl:w-[55%] flex flex-col items-start text-left">
      <motion.div
       initial={{ opacity: 0, y: 30 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true }}
       transition={{ duration: 0.8, delay: 0.2 }}
       className="w-full"
      >
       <h2 className="text-[52px] md:text-[80px] lg:text-[95px] xl:text-[115px] 2xl:text-[140px] leading-[0.9] font-bold text-[#B54442] uppercase tracking-[-0.02em] mb-12 w-full select-none">
        МЫ УБРАЛИ <br />
        ГЛЮТЕН <br />
        — ВКУС <br />
        ТРОГАТЬ НЕ <br />
        СТАЛИ!
       </h2>
      </motion.div>

      <motion.div
       initial={{ opacity: 0, y: 20 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true }}
       transition={{ duration: 0.8, delay: 0.4 }}
       className="max-w-[480px] xl:max-w-[550px] mb-16"
      >
       <p className="text-[17px] md:text-[20px] lg:text-[22px] xl:text-[24px] font-medium leading-[1.4] text-[#B54442]/80">
        Оставили сочность, хруст, тягучие начинки, насыщенный шоколад и тот самый аромат свежей выпечки, от которого невозможно пройти мимо
       </p>
      </motion.div>

      <motion.div
       initial={{ opacity: 0, y: 20 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true }}
       transition={{ duration: 0.8, delay: 0.6 }}
       className="w-full flex justify-end lg:justify-start xl:justify-end pr-0 lg:pr-10 xl:pr-0"
      >
       <Link href="/market" className="group flex items-center gap-4 text-[18px] md:text-[20px] xl:text-[24px] 2xl:text-[28px] font-bold tracking-widest text-[#B54442] hover:opacity-70 transition-all uppercase">
        СМОТРЕТЬ КАТАЛОГ
        <svg
         width="32"
         height="32"
         viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         strokeWidth="2.5"
         strokeLinecap="round"
         strokeLinejoin="round"
         className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform w-[28px] h-[28px] xl:w-[32px] xl:h-[32px]"
        >
         <line x1="7" y1="17" x2="17" y2="7"></line>
         <polyline points="7 7 17 7 17 17"></polyline>
        </svg>
       </Link>
      </motion.div>
     </div>

    </div>
   </div>
  </section>
 );
};

export default LandingAbout;
