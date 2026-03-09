"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export default function NotFound() {
 return (
  <div className="min-h-screen bg-[#FDF8ED] flex flex-col items-center justify-center px-6 py-12 font-manrope">
   <div className="max-w-[1200px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

    {/* Text Section */}
    <motion.div
     initial={{ opacity: 0, x: -30 }}
     animate={{ opacity: 1, x: 0 }}
     transition={{ duration: 0.8, ease: "easeOut" }}
     className="order-2 lg:order-1 text-center lg:text-left"
    >
     <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="inline-block px-4 py-1.5 rounded-full bg-smusl-terracotta/10 text-smusl-terracotta text-sm font-bold uppercase tracking-widest mb-6"
     >
      Ошибка 404
     </motion.div>

     <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#4A403A] mb-6 leading-tight">
      Упс! Кажется, эта <span className="text-smusl-terracotta italic font-great-vibes text-5xl lg:text-7xl">крошка</span> завела вас не туда.
     </h1>

     <p className="text-lg text-[#4A403A]/60 mb-10 max-w-[500px] mx-auto lg:mx-0">
      Страница, которую вы ищете, была съедена или никогда не существовала. Но не расстраивайтесь — у нас много других свежих новинок!
     </p>

     <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
      <Link
       href="/"
       className="flex items-center gap-2 px-8 py-4 bg-[#4A403A] text-white rounded-2xl font-bold hover:bg-[#3D3530] transition-all transform active:scale-95 shadow-xl shadow-[#4A403A]/10 w-full sm:w-auto text-center justify-center"
      >
       <ArrowLeft className="w-5 h-5" />
       <span>На главную</span>
      </Link>

      <Link
       href="/market"
       className="flex items-center gap-2 px-8 py-4 bg-white border border-[#E8E8E8] text-[#4A403A] rounded-2xl font-bold hover:border-smusl-terracotta hover:text-smusl-terracotta transition-all transform active:scale-95 w-full sm:w-auto text-center justify-center shadow-sm"
      >
       <ShoppingBag className="w-5 h-5" />
       <span>В магазин</span>
      </Link>
     </div>
    </motion.div>

    {/* Image Section */}
    <motion.div
     initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
     animate={{ opacity: 1, scale: 1, rotate: 0 }}
     transition={{ duration: 1, ease: "easeOut" }}
     className="order-1 lg:order-2 flex justify-center"
    >
     <div className="relative w-full max-w-[500px] aspect-square rounded-[3rem] overflow-hidden shadow-2xl shadow-smusl-terracotta/5 border border-white">
      <Image
       src="/photo/404-croissant.png"
       alt="404 Croissant"
       fill
       className="object-cover"
      />
      {/* Soft Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#4A403A]/10 to-transparent pointer-events-none" />
     </div>
    </motion.div>

   </div>

   {/* Decorative Elements */}
   <motion.div
    animate={{
     y: [0, -10, 0],
     rotate: [0, 5, 0]
    }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    className="fixed bottom-10 right-10 opacity-10 pointer-events-none hidden lg:block"
   >
    <Image src="/photo/logo.png" alt="" width={128} height={32} className="w-32 h-auto grayscale" />
   </motion.div>
  </div>
 );
}
