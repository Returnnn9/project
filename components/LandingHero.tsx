"use client";

import React from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

const LandingHero = () => {
 const { scrollY } = useScroll();
 const y1 = useTransform(scrollY, [0, 500], [0, -100]);
 const y2 = useTransform(scrollY, [0, 500], [0, 100]);
 const opacity = useTransform(scrollY, [0, 300], [1, 0]);

 return (
  <section className="relative pt-24 pb-32 bg-[#FDF8ED] overflow-hidden">
   <div className="w-full px-4 md:px-10 lg:px-16">
    <motion.div
     initial={{ opacity: 0, y: 30 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
     className="relative w-full aspect-[16/6] rounded-[48px] overflow-hidden shadow-[0_40px_100px_-30px_rgba(0,0,0,0.2),0_10px_40px_-15px_rgba(0,0,0,0.1)] ring-1 ring-white/10"
    >
     <Image
      src="/images/Desert.png"
      alt="Exclusive Pastries"
      fill
      className="object-cover scale-105"
      priority
     />
     <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/10" />
    </motion.div>

    {/* Headline */}
    <div className="mt-12 w-full">
     <div className="flex flex-col space-y-4 md:space-y-6">
      {/* Row 1 */}
      <motion.div
       style={{ y: y1, opacity }}
       initial={{ opacity: 0, x: -50 }}
       whileInView={{ opacity: 1, x: 0 }}
       transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
       className="flex items-baseline justify-between w-full"
      >
       <h1 className="text-[30px] md:text-[60px] lg:text-[100px] xl:text-[120px] font-bold text-smusl-red uppercase tracking-tighter leading-none">
        БЕЗГЛЮТЕНОВЫЙ
       </h1>
       <div className="flex items-baseline group">
        <span className="font-script text-[70px] md:text-[140px] lg:text-[200px] xl:text-[240px] text-smusl-red leading-none translate-y-2 md:translate-y-6 lg:translate-y-10 select-none pointer-events-none transition-transform duration-700 group-hover:scale-105">
         Х
        </span>
        <h1 className="text-[30px] md:text-[60px] lg:text-[100px] xl:text-[120px] font-bold text-smusl-red uppercase tracking-tighter leading-none -ml-3 md:-ml-8 lg:-ml-12">
         ЛЕБ
        </h1>
       </div>
      </motion.div>

      {/* Row 2 */}
      <motion.div
       style={{ y: y2, opacity }}
       initial={{ opacity: 0, x: 50 }}
       whileInView={{ opacity: 1, x: 0 }}
       transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
       className="flex items-baseline justify-between w-full"
      >
       <h1 className="text-[30px] md:text-[60px] lg:text-[100px] xl:text-[120px] font-bold text-smusl-red uppercase tracking-tighter leading-none">
        И
       </h1>
       <div className="flex items-baseline group">
        <span className="font-script text-[90px] md:text-[180px] lg:text-[260px] xl:text-[300px] text-smusl-red leading-none translate-y-4 md:translate-y-10 lg:translate-y-16 select-none pointer-events-none transition-transform duration-700 group-hover:scale-105">
         Д
        </span>
        <h1 className="text-[30px] md:text-[60px] lg:text-[100px] xl:text-[120px] font-bold text-smusl-red uppercase tracking-tighter leading-none -ml-5 md:-ml-12 lg:-ml-16">
         ЕСЕРТЫ В МОСКВЕ
        </h1>
       </div>
      </motion.div>
     </div>
    </div>
   </div>
  </section>
 );
};

export default LandingHero;
