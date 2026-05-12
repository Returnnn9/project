"use client";

import React from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

const LandingHero = () => {
 const { scrollY } = useScroll();
 const y1 = useTransform(scrollY, [0, 500], [0, -100]);
 const y2 = useTransform(scrollY, [0, 500], [0, 100]);

 return (
  <section className="relative pt-24 pb-32 bg-[#FAF8F5] overflow-hidden" aria-label="Главный баннер">
   {/* Decorative breathing elements */}
   <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-smusl-terracotta/20 rounded-full blur-[120px] animate-pulse-slow" />
    <div className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] bg-smusl-red/10 rounded-full blur-[140px] animate-pulse-slower" />
   </div>

   <div className="w-full px-4 md:px-10 lg:px-16 relative z-10">
    <motion.div
     initial={{ opacity: 0, y: 30 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
     className="relative w-full aspect-[16/6] rounded-[48px] overflow-hidden shadow-[0_40px_100px_-30px_rgba(0,0,0,0.2),0_10px_40px_-15px_rgba(0,0,0,0.1)] ring-1 ring-white/10"
    >
     <Image
      src="/images/Desert.png"
      alt="Авторская выпечка и десерты СМЫСЛ ЕСТЬ"
      fill
      className="object-cover scale-105"
      priority
     />
     <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/5" />
    </motion.div>

    {/* Headline Container */}
    <div className="mt-16 md:mt-24 w-full flex flex-col items-center text-center lg:items-start lg:text-left h-auto relative">

     {/* Single h1 for SEO — split visually via aria-hidden spans */}
     <h1 className="sr-only">Безглютеновый хлеб и десерты в Москве</h1>

     <div className="flex flex-col space-y-2 md:space-y-4 lg:space-y-6 w-full" aria-hidden="true">
      {/* Row 1 */}
      <motion.div
       style={{ y: y1 }}
       initial={{ opacity: 0, x: -30 }}
       whileInView={{ opacity: 1, x: 0 }}
       transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
       className="flex flex-col lg:flex-row items-center lg:items-baseline justify-between w-full"
      >
       <div className="relative group">
        <span className="text-[36px] md:text-[70px] lg:text-[110px] xl:text-[150px] font-extrabold text-smusl-red uppercase tracking-[-0.04em] leading-[0.9] relative z-10 block">
         БЕЗГЛЮТЕНОВЫЙ
        </span>
        {/* Subtle glow behind text */}
        <div className="absolute inset-0 bg-smusl-red/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
       </div>

       <div className="flex items-center relative mt-4 lg:mt-0 lg:ml-8 translate-y-2">
        <span className="font-script text-[60px] md:text-[110px] lg:text-[150px] xl:text-[170px] text-smusl-red leading-none select-none pointer-events-none drop-shadow-sm origin-bottom translate-y-4 animate-float-script">
         Х
        </span>
        <span className="text-[36px] md:text-[70px] lg:text-[110px] xl:text-[150px] font-extrabold text-smusl-red uppercase tracking-[-0.04em] leading-[0.9] -ml-2 lg:-ml-4 relative z-10 block">
         ЛЕБ
        </span>
       </div>
      </motion.div>

      {/* Row 2 */}
      <motion.div
       style={{ y: y2 }}
       initial={{ opacity: 0, x: 30 }}
       whileInView={{ opacity: 1, x: 0 }}
       transition={{ duration: 1.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
       className="flex flex-col lg:flex-row items-center lg:items-baseline justify-between w-full"
      >
       <span className="text-[36px] md:text-[70px] lg:text-[110px] xl:text-[150px] font-extrabold text-smusl-red uppercase tracking-[-0.04em] leading-[0.9] hidden lg:block">
        И
       </span>
       <div className="flex items-center mt-4 lg:mt-0 lg:translate-y-2">
        <span className="text-[36px] md:text-[70px] lg:text-[110px] xl:text-[150px] font-extrabold text-smusl-red uppercase tracking-[-0.04em] leading-[0.9] lg:hidden mr-4 block">
         И
        </span>
        <div className="relative isolate translate-y-4 pr-2 md:pr-6">
         <span className="font-script text-[70px] md:text-[120px] lg:text-[160px] xl:text-[190px] text-smusl-red leading-none select-none pointer-events-none drop-shadow-sm inline-block translate-y-4 animate-float-script-delayed">
          Д
         </span>
        </div>
        <span className="text-[36px] md:text-[70px] lg:text-[110px] xl:text-[150px] font-extrabold text-smusl-red uppercase tracking-[-0.04em] leading-[0.9] -ml-2 lg:-ml-4 relative z-10 block">
         ЕСЕРТЫ В МОСКВЕ
        </span>
       </div>
      </motion.div>
     </div>

     {/* Floating glass call to action hint */}
     <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="mt-12 hidden lg:flex items-center gap-4 text-smusl-red/40 font-bold tracking-widest text-[11px] uppercase"
     >
      <div className="w-12 h-[1px] bg-smusl-red/20" />
      Scroll to discover
     </motion.div>
    </div>
   </div>
  </section>
 );
};

export default LandingHero;
