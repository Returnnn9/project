"use client"

import React, { useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { stepVariants } from "@/lib/motion-variants"
import { normalizePhone } from "@/lib/phone"

interface Props {
  userName: string
  userPhone: string
  acceptNews: boolean
  status: string
  setUserName: (v: string) => void
  setUserPhone: (v: string) => void
  setAcceptNews: (v: boolean) => void
  onNext: () => void
  onLoginClick: () => void
}

export default function CheckoutStep1Contact({
  userName,
  userPhone,
  acceptNews,
  status,
  setUserName,
  setUserPhone,
  setAcceptNews,
  onNext,
  onLoginClick,
}: Props) {
  const phoneInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTimeout(() => phoneInputRef.current?.focus(), 400)
  }, [])

  return (
    <motion.div
      key="step1-guest"
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex h-full w-full"
    >
      <div className="flex-1 p-6 sm:p-12 flex flex-col justify-center max-w-xl mx-auto">
        <h2 className="text-[24px] sm:text-[28px] font-extrabold text-[#3A332E] mb-8 tracking-tight">
          Как к вам обращаться?
        </h2>
        <div className="space-y-4">
          <div className="bg-[#F8F8F8] rounded-[1.2rem] px-6 py-4 border border-transparent focus-within:border-gray-300 transition-colors">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Телефон</span>
            <input
              ref={phoneInputRef}
              type="tel"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              placeholder="+7 (999) 000-00-00"
              className="bg-transparent border-none outline-none text-[16px] font-bold text-[#3A332E] placeholder:text-gray-300 w-full"
            />
          </div>
          <div className="bg-[#F8F8F8] rounded-[1.2rem] px-6 py-4 border border-transparent focus-within:border-gray-300 transition-colors">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Имя</span>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Иван"
              className="bg-transparent border-none outline-none text-[16px] font-bold text-[#3A332E] placeholder:text-gray-300 w-full"
            />
          </div>
        </div>

        <div className="flex items-start gap-3 mt-4 mb-8">
          <button
            type="button"
            onClick={() => setAcceptNews(!acceptNews)}
            className={`w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-all ${
              acceptNews ? "bg-[#CF8F73] border-[#CF8F73] shadow-sm shadow-[#CF8F73]/20" : "bg-white border-gray-200"
            }`}
          >
            {acceptNews && (
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <p className="text-[13px] font-medium text-[#3A332E]/60 leading-snug">
            Соглашаюсь получать новости и специальные предложения
          </p>
        </div>

        {status !== "authenticated" && (
          <div className="mb-3 text-center w-full">
            <span className="text-[14px] font-[500] text-[#A19C98]">Уже есть аккаунт? </span>
            <button
              onClick={onLoginClick}
              className="text-[14px] font-[800] text-[#CF8F73] hover:text-[#b87a60] transition-colors"
            >
              Войти
            </button>
          </div>
        )}

        <button
          onClick={onNext}
          disabled={!userName || !normalizePhone(userPhone)}
          className="w-full h-[64px] bg-[#CF8F73] disabled:bg-[#CF8F73]/40 text-white rounded-[1.2rem] font-[800] text-[18px] hover:bg-[#b87a60] transition-all active:scale-95 shadow-xl shadow-[#CF8F73]/20"
        >
          Далее
        </button>

        <p className="mt-6 text-[12px] font-medium text-[#3A332E]/30 leading-relaxed text-center px-4">
          Нажимая «Далее», принимаю{" "}
          <a href="/offer" className="text-[#CF8F73] underline underline-offset-2 hover:text-[#b87a60] transition-colors">оферту</a>
          {" "}и{" "}
          <a href="/terms" className="text-[#CF8F73] underline underline-offset-2 hover:text-[#b87a60] transition-colors">пользовательское соглашение</a>
          , соглашаюсь на обработку персональных данных на условиях{" "}
          <a href="/privacy" className="text-[#CF8F73] underline underline-offset-2 hover:text-[#b87a60] transition-colors">политики конфиденциальности</a>
        </p>
      </div>
    </motion.div>
  )
}
