"use client"

import React from "react"
import { motion } from "framer-motion"
import { stepVariants } from "@/lib/motion-variants"

interface Props {
  total: number
  onClose: () => void
}

export default function CheckoutStep6Success({ total, onClose }: Props) {
  return (
    <motion.div
      key="step6-success"
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-center justify-center h-full w-full p-12 text-center"
    >
      <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-[#CF8F73] flex items-center justify-center shadow-lg shadow-[#CF8F73]/20"
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              d="M20 6L9 17L4 12"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>

        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-[#CF8F73]/40"
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              x: (i % 2 === 0 ? 1 : -1) * (40 + i * 10),
              y: (i < 3 ? 1 : -1) * (40 + i * 5),
            }}
            transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
          />
        ))}
      </div>

      <h2
        className="text-[28px] sm:text-[32px] font-extrabold text-[#3A332E] mb-4 tracking-tight"
        style={{ fontFeatureSettings: "'pnum' on, 'lnum' on" }}
      >
        Заказ принят!
      </h2>
      <p className="text-[#3A332E]/60 text-[16px] max-w-[320px] leading-relaxed mb-4">
        Спасибо за покупку. Мы уже начали готовить ваш заказ и скоро свяжемся с вами.
      </p>
      {total > 0 && (
        <p className="text-[#CF8F73] font-extrabold text-[22px] mb-10">{total.toLocaleString('ru-RU')} ₽</p>
      )}
      <button
        onClick={onClose}
        className="w-full max-w-[280px] h-[64px] bg-[#CF8F73] text-white rounded-[1.5rem] font-[900] text-[19px] hover:bg-[#b87a60] transition-all active:scale-95 shadow-xl shadow-[#CF8F73]/20"
      >
        Отлично
      </button>
    </motion.div>
  )
}
