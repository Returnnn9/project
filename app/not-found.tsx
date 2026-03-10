"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export default function NotFound() {
 return (
  <div className="min-h-screen bg-[#FDF8ED] flex flex-col items-center justify-center p-6 text-center overflow-hidden selection:bg-smusl-terracotta/20 relative">

   {/* Background Abstract Geometric Shapes */}
   <div className="absolute inset-0 pointer-events-none -z-10">
    <motion.div
     animate={{
      rotate: 360,
      scale: [1, 1.1, 1]
     }}
     transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
     className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] border-[1px] border-smusl-brown/[0.03] rounded-[15vw]"
    />
    <motion.div
     animate={{
      rotate: -360,
      scale: [1, 1.2, 1]
     }}
     transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
     className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] border-[1px] border-smusl-terracotta/[0.05] rounded-full"
    />
   </div>

   <div className="relative z-10 flex flex-col items-center max-w-[1000px] w-full mt-[-10vh]">

    {/* Massive Error Code */}
    <motion.div
     initial={{ opacity: 0, scale: 0.9 }}
     animate={{ opacity: 1, scale: 1 }}
     transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
     className="relative mb-8"
    >
     <div className="text-[180px] sm:text-[240px] lg:text-[320px] font-black leading-none text-smusl-brown tracking-tighter opacity-[0.05]">
      404
     </div>
     <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
       initial={{ rotate: -5, opacity: 0 }}
       animate={{ rotate: 0, opacity: 1 }}
       transition={{ delay: 0.5, duration: 1 }}
       className="text-smusl-terracotta italic font-script text-[80px] sm:text-[120px] lg:text-[160px] drop-shadow-2xl translate-y-4"
      >
       крошка
      </motion.div>
     </div>
    </motion.div>

    {/* Text Section */}
    <motion.div
     initial={{ opacity: 0, y: 30 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
     className="flex flex-col items-center"
    >
     <div className="inline-block px-5 py-2 rounded-full border border-smusl-brown/10 text-smusl-brown/40 text-[12px] font-bold uppercase tracking-[0.3em] mb-8">
      lost in thought
     </div>

     <h1 className="text-[36px] sm:text-[48px] lg:text-[62px] font-black text-smusl-brown leading-tight tracking-tight mb-8 max-w-[800px]">
      Кажется, поиск завел вас <br className="hidden sm:block" /> в тупик, <span className="text-smusl-terracotta underline decoration-smusl-terracotta/20 underline-offset-8">но смысл есть</span> везде.
     </h1>

     <p className="text-[17px] sm:text-[19px] text-smusl-gray font-medium mb-12 max-w-[540px] leading-relaxed">
      Мы не нашли того, за чем вы пришли. Возможно, стоит начать заново?
      Наши свежие новости и новинки ждут вас в магазине.
     </p>

     {/* Magnetic Buttons (via framer-motion) */}
     <div className="flex flex-col sm:flex-row items-center gap-6">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
       <Link
        href="/"
        className="flex items-center justify-center gap-3 px-12 py-6 bg-smusl-brown text-white rounded-[24px] font-black text-[18px] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(74,66,61,0.2)]"
       >
        <ArrowLeft className="w-5 h-5" />
        <span>На главную</span>
       </Link>
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
       <Link
        href="/market"
        className="flex items-center justify-center gap-3 px-12 py-6 bg-white text-smusl-brown rounded-[24px] font-black text-[18px] border-2 border-smusl-light-gray transition-all duration-300 hover:border-smusl-terracotta hover:text-smusl-terracotta"
       >
        <ShoppingBag className="w-5 h-5" />
        <span>В магазин</span>
       </Link>
      </motion.div>
     </div>
    </motion.div>
   </div>

   {/* Decorative Rhythmic Typography */}
   <div className="fixed bottom-12 left-0 right-0 pointer-events-none px-12 hidden lg:flex justify-between items-end opacity-[0.05]">
    <div className="text-[120px] font-black leading-none">СМЫСЛ</div>
    <div className="text-[120px] font-black leading-none">ЕСТЬ</div>
   </div>

  </div>
 );
}
