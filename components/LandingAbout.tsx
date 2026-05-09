"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

const LandingAbout = () => {
 return (
  <section className="py-20 md:py-32 lg:py-40 bg-[#F4EEE9] overflow-hidden relative">
   {/* Decorative background accent */}
   <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[800px] h-[800px] bg-smusl-terracotta/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

   <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-40">
    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 xl:gap-24 2xl:gap-32">

     {/* Left Side: Large Hero Image with Parallax & Float */}
     <motion.div
      initial={{ opacity: 0, x: -50, scale: 0.95 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="w-full lg:w-[48%] xl:w-[45%] 2xl:w-[42%]"
     >
      <div className="relative group">
       <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="relative aspect-[1.1/1] w-full rounded-[48px] overflow-hidden shadow-[0_40px_80px_-20px_rgba(74,66,61,0.2)] border border-white/40 ring-1 ring-black/5"
       >
        <Image
         src="/images/croissant_promo.png"
         alt="СМЫСЛ ЕСТЬ — Безглютеновая выпечка"
         fill
         className="object-cover transition-transform duration-1000 group-hover:scale-105"
         sizes="(max-width: 1024px) 100vw, 50vw"
         priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
       </motion.div>

       {/* Decorative tag */}
       <motion.div
        initial={{ rotate: -12, opacity: 0 }}
        whileInView={{ rotate: -12, opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute -bottom-6 -right-6 bg-smusl-red text-white font-script text-3xl px-8 py-3 rounded-2xl shadow-xl z-20"
       >
        вкусно!
       </motion.div>
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
       <h2 className="text-[52px] md:text-[80px] lg:text-[100px] xl:text-[120px] 2xl:text-[150px] leading-[0.85] font-extrabold text-[#B54442] uppercase tracking-[-0.05em] mb-12 w-full select-none group">
        МЫ УБРАЛИ <br />
        <span className="relative inline-block transition-all duration-700 group-hover:tracking-[0.05em]">ГЛЮТЕН</span> <br />
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
       <p className="text-[17px] md:text-[22px] lg:text-[24px] xl:text-[26px] font-bold leading-[1.35] text-[#B54442]/80 uppercase tracking-tight">
        Оставили сочность, хруст, тягучие начинки, насыщенный шоколад и тот самый аромат свежей выпечки
       </p>
      </motion.div>

      <motion.div
       initial={{ opacity: 0, scale: 0.9 }}
       whileInView={{ opacity: 1, scale: 1 }}
       viewport={{ once: true }}
       transition={{ duration: 0.8, delay: 0.6 }}
       className="w-full flex justify-end lg:justify-start"
      >
       <Link href="/market" className="group flex items-center gap-6 px-10 py-5 bg-smusl-red text-white rounded-3xl shadow-[0_20px_40px_-10px_rgba(181,68,66,0.3)] hover:bg-[#9A2D2B] transition-all active:scale-95">
        <span className="text-[16px] md:text-[20px] font-extrabold tracking-widest uppercase">СМОТРЕТЬ КАТАЛОГ</span>
        <svg
         width="24"
         height="24"
         viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         strokeWidth="3"
         strokeLinecap="round"
         strokeLinejoin="round"
         className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
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
