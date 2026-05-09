"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Home, ShoppingBag } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDF8ED] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      {/* Cinematic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#CF8F73]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#4A423D]/5 blur-[120px] rounded-full" />

      <div className="relative z-10 flex flex-col items-center max-w-[1000px] w-full mt-[-5vh]">
        {/* Massive Error Code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6 sm:mb-10"
        >
          <div className="text-[180px] sm:text-[240px] lg:text-[320px] font-black leading-none text-[#4A423D] tracking-tighter opacity-[0.04]">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ rotate: -15, opacity: 0, scale: 0.5 }}
              animate={{ rotate: -6, opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 1, type: "spring" }}
              className="text-[#CF8B70] font-script text-[70px] sm:text-[110px] lg:text-[150px] drop-shadow-2xl translate-y-4 animate-float-script"
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
          <div className="inline-block px-5 py-2 rounded-full border border-[#4A423D]/10 text-[#4A423D]/40 text-[12px] font-bold uppercase tracking-[0.3em] mb-8">
            lost in thought
          </div>

          <h1 className="text-[32px] sm:text-[48px] lg:text-[60px] font-black text-[#4A423D] leading-tight tracking-tight mb-8 max-w-[850px] px-4 text-balanced">
            Кажется, поиск завел вас в тупик, <span className="text-[#CF8B70] underline decoration-[#CF8B70]/20 underline-offset-8">но смысл есть</span> везде.
          </h1>

          <p className="text-[17px] sm:text-[19px] text-[#4A423D]/60 font-medium mb-12 max-w-[540px] leading-relaxed px-6 text-balanced">
            Мы не нашли того, за чем вы пришли. Возможно, стоит заглянуть в наш каталог за чем-то вкусненьким?
          </p>

          {/* WOW Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto px-6">
            <motion.div whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Link
                href="/"
                className="flex items-center justify-center gap-3 px-12 h-[72px] bg-[#4A423D] text-white rounded-[1.5rem] font-black text-[18px] transition-all duration-300 shadow-[0_20px_40px_rgba(74,66,61,0.15)] hover:bg-[#3A322D]"
              >
                <Home className="w-5 h-5" />
                <span>На главную</span>
              </Link>
            </motion.div>

            <motion.div whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Link
                href="/market"
                className="flex items-center justify-center gap-3 px-12 h-[72px] bg-gradient-to-br from-[#DF997E] to-[#CD8B70] text-white rounded-[1.5rem] font-black text-[18px] relative overflow-hidden group shadow-[0_20px_40px_rgba(223,153,126,0.25)] transition-all duration-500"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>В магазин</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Signature Branding */}
      <div className="fixed bottom-12 left-0 right-0 pointer-events-none px-12 hidden lg:flex justify-between items-end opacity-[0.03]">
        <div className="text-[120px] font-black leading-none text-[#4A423D]">СМЫСЛ</div>
        <div className="text-[120px] font-black leading-none text-[#4A423D]">ЕСТЬ</div>
      </div>
    </div>
  )
}
