"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const LandingFooter = () => {
 return (
  <footer className="w-full">
   {/* CTA Section (Light Background) */}
   <div id="delivery" className="bg-[#FAF8F5] pt-20 pb-20">
    <div className="container mx-auto px-4 md:px-8 lg:px-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

     {/* Image Left */}
     <motion.div
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full lg:w-1/2 relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-sm"
     >
      <Image
       src="/images/Rectangle 14.svg"
       alt="Baguettes"
       fill
       className="object-cover"
      />
     </motion.div>

     {/* Text Right */}
     <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="w-full lg:w-1/2 flex flex-col items-start gap-10 lg:gap-16"
     >
      <h2 className="text-[40px] md:text-[64px] lg:text-[80px] xl:text-[96px] font-extrabold text-[#B54442] leading-[0.95] tracking-[-0.02em] uppercase break-words">
       МЫ УБРАЛИ ГЛЮТЕН<br />— ВКУС ТРОГАТЬ НЕ СТАЛИ!
      </h2>

      <div className="flex flex-col md:flex-row items-start lg:items-end justify-between w-full gap-8">
       <p className="text-[14px] sm:text-[15px] md:text-[16px] text-[#B54442] leading-[1.4] max-w-[300px] tracking-wide font-normal">
        Оставили сочность, хруст, тягучие<br />
        начинки, насыщенный шоколад и тот<br />
        самый аромат свежей выпечки, от<br />
        которого невозможно пройти мимо
       </p>

       <Link href="/catalog" className="flex items-center gap-3 group mb-1 mr-4">
        <span className="text-[18px] md:text-[20px] lg:text-[22px] font-normal uppercase tracking-[0.06em] text-[#B54442] group-hover:opacity-70 transition-opacity whitespace-nowrap">СМОТРЕТЬ КАТАЛОГ</span>
        <span className="text-2xl lg:text-3xl text-[#B54442] font-light group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">↗</span>
       </Link>
      </div>
     </motion.div>
    </div>
   </div>

   {/* Footer Grid Section */}
   <div id="contacts" className="bg-smusl-brown text-white py-10 px-4 sm:px-6 lg:px-10">
    <div className="container mx-auto px-4 md:px-8 lg:px-12">
     <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">

      {/* ── Logo ── */}
      <div className="flex flex-col">
       <Link href="/" className="block w-fit select-none hover:opacity-80 transition-opacity">
        <span
         className="block font-extrabold uppercase text-white leading-none"
         style={{ fontFamily: 'var(--font-manrope)', fontSize: '28px', letterSpacing: '0.12em' }}
        >
         СМЫСЛ
        </span>
        <span
         className="block text-white leading-none"
         style={{
          fontFamily: 'var(--font-great-vibes)',
          fontStyle: 'italic',
          fontSize: '30px',
          display: 'inline-block',
          transform: 'scaleX(1.35)',
          transformOrigin: 'left',
          marginTop: '0px',
         }}
        >
         есть
        </span>
       </Link>
      </div>

      {/* ── Contacts (hours + address + social) ── */}
      <div className="flex flex-col gap-5 pt-1">
       {/* Hours */}
       <div className="flex items-center gap-3">
        <svg className="w-4 h-4 text-white/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-[15px] font-normal">10:00 - 19:00</span>
       </div>
       {/* Address */}
       <div className="flex items-start gap-3">
        <svg className="w-4 h-4 text-white/70 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-[15px] font-normal leading-snug">Россия, г. Москва,<br />ул. Ижорская 3</span>
       </div>
       {/* Social icons — ВК / Telegram / Instagram */}
       <div className="flex items-center gap-4 mt-1">
        {/* VK */}
        <Link href="#" aria-label="ВКонтакте" className="hover:opacity-70 transition-opacity">
         <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
          <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14C20.67 22 22 20.67 22 15.07V8.93C22 3.33 20.67 2 15.07 2zm3.08 13.57h-1.6c-.6 0-.79-.48-1.87-1.57-1-.96-1.39-1.08-1.62-1.08-.32 0-.42.09-.42.53v1.43c0 .38-.12.6-1.12.6-1.65 0-3.48-1-4.76-2.86C5.97 10.7 5.5 8.97 5.5 8.6c0-.23.09-.45.53-.45h1.6c.4 0 .55.18.71.6.78 2.26 2.09 4.24 2.63 4.24.2 0 .3-.09.3-.6V10.2c-.06-1.08-.63-1.17-.63-1.55 0-.18.15-.36.39-.36h2.52c.33 0 .45.18.45.57v3.07c0 .33.15.45.24.45.2 0 .36-.12.72-.48 1.1-1.24 1.9-3.15 1.9-3.15.1-.24.3-.45.7-.45h1.6c.48 0 .58.24.48.57-.2.93-2.13 3.66-2.13 3.66-.17.27-.23.39 0 .69.17.23.72.72 1.09 1.15.67.77 1.19 1.41 1.32 1.86.13.43-.09.64-.53.64z" />
         </svg>
        </Link>
        {/* Telegram */}
        <Link href="#" aria-label="Telegram" className="hover:opacity-70 transition-opacity">
         <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
         </svg>
        </Link>
        {/* Instagram */}
        <Link href="#" aria-label="Instagram" className="hover:opacity-70 transition-opacity">
         <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
         </svg>
        </Link>
       </div>
      </div>

      {/* ── Support (email + phone) ── */}
      <div className="flex flex-col gap-5 pt-1">
       <div className="flex items-center gap-3">
        <svg className="w-4 h-4 text-white/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <a href="mailto:info@smislest.ru" className="text-[15px] font-normal hover:opacity-70 transition-opacity">info@smislest.ru</a>
       </div>
       <div className="flex items-center gap-3">
        <svg className="w-4 h-4 text-white/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <a href="tel:+79262104565" className="text-[15px] font-normal hover:opacity-70 transition-opacity">+7 (926) 210-45-65</a>
       </div>
      </div>

      {/* ── Links ── */}
      <nav id="faq" className="flex flex-col gap-4 pt-1">
       <Link href="/policy" className="text-[15px] font-normal hover:opacity-70 transition-opacity">Почему без глютена?</Link>
       <Link href="/faq" className="text-[15px] font-normal hover:opacity-70 transition-opacity">FAQ</Link>
       <Link href="/news" className="text-[15px] font-normal hover:opacity-70 transition-opacity">Статьи</Link>
      </nav>
     </div>
    </div>
   </div>
  </footer>
 );
};

export default LandingFooter;
