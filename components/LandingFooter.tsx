"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const LandingFooter = () => {
 return (
  <footer className="bg-[#FDF8ED] pt-24 pb-12">
   <div className="container mx-auto px-4">
    {/* CTA Hero Section */}
    <div className="relative w-full rounded-[48px] overflow-hidden bg-[#CF8D72] mb-24 grid grid-cols-1 lg:grid-cols-2">
     <div className="relative aspect-video lg:aspect-auto h-full min-h-[400px]">
      <Image
       src="/images/Rectangle 12.svg"
       alt="Coffee and Croissant"
       fill
       className="object-cover"
      />
     </div>
     <div className="p-10 lg:p-20 flex flex-col justify-center items-start space-y-10">
      <h2 className="text-[40px] lg:text-[60px] font-bold text-white uppercase leading-[1.1] tracking-tight max-w-md">
       Мы убрали глютен - вкус трогать не стали!
      </h2>
      <div className="space-y-8">
       <p className="text-[14px] font-bold uppercase tracking-[0.15em] text-white/90 max-w-sm">
        Пекарня безглютенового хлеба с доставкой по Москве и области
       </p>
       <button className="flex items-center gap-4 group">
        <span className="text-[14px] font-bold uppercase tracking-[0.2em] text-white">Перейти в каталог</span>
        <div className="w-12 h-12 rounded-full border border-white flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#CF8D72] transition-all">
         ↗
        </div>
       </button>
      </div>
     </div>
    </div>

    {/* Info Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-t border-smusl-red/10 pt-16">
     <div className="space-y-8">
      <Link href="/">
       <Image src="/images/Logoo.png" alt="Logo" width={100} height={100} className="opacity-80 hover:opacity-100 transition-opacity" />
      </Link>
      <div className="flex gap-4">
       <Link href="#" className="w-10 h-10 rounded-full border border-smusl-red/20 flex items-center justify-center text-smusl-red hover:bg-smusl-red hover:text-white transition-all text-xs font-bold">
        VK
       </Link>
       <Link href="#" className="w-10 h-10 rounded-full border border-smusl-red/20 flex items-center justify-center text-smusl-red hover:bg-smusl-red hover:text-white transition-all text-xs font-bold">
        TG
       </Link>
      </div>
     </div>

     <div className="space-y-6">
      <div>
       <p className="text-[11px] font-bold uppercase text-smusl-red/40 tracking-[0.2em] mb-2">Время работы</p>
       <p className="text-[15px] font-bold uppercase text-smusl-red">10:00 - 19:30</p>
      </div>

      <div>
       <p className="text-[11px] font-bold uppercase text-smusl-red/40 tracking-[0.2em] mb-2">Адрес</p>
       <p className="text-[15px] font-bold uppercase text-smusl-red">Москва, Ул. Некрасова, 3</p>
      </div>
     </div>

     <div className="space-y-6">
      <div>
       <p className="text-[11px] font-bold uppercase text-smusl-red/40 tracking-[0.2em] mb-2">Email</p>
       <a href="mailto:smuslest@gmail.com" className="text-[15px] font-bold uppercase text-smusl-red hover:opacity-70 transition-opacity">smuslest@gmail.com</a>
      </div>

      <div>
       <p className="text-[11px] font-bold uppercase text-smusl-red/40 tracking-[0.2em] mb-2">Phone</p>
       <a href="tel:+79219321441" className="text-[15px] font-bold uppercase text-smusl-red hover:opacity-70 transition-opacity">+7 (921) 932-14-41</a>
      </div>
     </div>

     <div className="flex flex-col gap-4">
      <Link href="/policy" className="text-[11px] font-bold uppercase tracking-[0.2em] text-smusl-red/60 hover:text-smusl-red transition-colors">Политика безопасности</Link>
      <Link href="/faq" className="text-[11px] font-bold uppercase tracking-[0.2em] text-smusl-red/60 hover:text-smusl-red transition-colors">FAQ</Link>
      <Link href="/news" className="text-[11px] font-bold uppercase tracking-[0.2em] text-smusl-red/60 hover:text-smusl-red transition-colors">Статьи</Link>
     </div>
    </div>

    <div className="mt-16 text-center text-[10px] uppercase tracking-[0.3em] text-smusl-red/30 font-bold">
     © 2026 СМЫСЛ ЕСТЬ. ПЕКАРНЯ БЕЗ ГЛЮТЕНА В МОСКВЕ.
    </div>
   </div>
  </footer>
 );
};

export default LandingFooter;
