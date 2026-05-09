"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { verifySitePassword } from "@/app/actions/site-access"

export default function LockPage() {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!password.trim() || isLoading) return

    setIsLoading(true)
    setError("")

    try {
      const result = await verifySitePassword(password)
      if (result.success) {
        setIsSuccess(true)
        setTimeout(() => {
          window.location.href = "/market"
        }, 800)
      } else {
        setError(result.error || "Неверный пароль")
      }
    } catch {
      setError("Произошла системная ошибка")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#FDF8ED] touch-none">
      {/* Cinematic Background */}
      <div className="absolute inset-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#CF8F73]/20 blur-[120px] rounded-full animate-pulse-slow" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4A403A]/10 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence>
        {!isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-[440px] px-6"
          >
            {/* Glass Card */}
            <div className="relative overflow-hidden bg-white/40 backdrop-blur-3xl rounded-[3rem] p-10 sm:p-12 border border-white/50 shadow-[0_32px_64px_-16px_rgba(74,64,58,0.15)]">
              {/* Internal Glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ rotate: -15, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-gradient-to-br from-[#CF8B70] to-[#B3684B] rounded-[1.8rem] flex items-center justify-center mb-8 shadow-lg shadow-[#CF8B70]/30"
                >
                  <Lock className="w-9 h-9 text-white drop-shadow-md" />
                </motion.div>

                <h1 className="text-[32px] sm:text-[40px] font-black text-[#4A403A] mb-3 tracking-tighter leading-none">
                  СМЫСЛ ЕСТЬ
                </h1>
                <p className="text-[#4A403A]/50 text-[15px] font-medium mb-10 leading-relaxed px-4 text-balanced">
                  Введите пароль, чтобы войти в закрытый раздел нашего магазина
                </p>

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                  <div className="relative group">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoFocus
                      className="w-full h-[68px] bg-white/60 border-2 border-transparent focus:border-[#CF8B70]/30 rounded-[1.5rem] px-8 text-center text-[22px] font-black tracking-[0.3em] outline-none transition-all duration-300 placeholder:tracking-normal placeholder:font-medium placeholder:text-[#4A403A]/20"
                    />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-2 text-red-500 font-bold text-[14px] pt-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-[68px] sm:h-[72px] mt-4 bg-gradient-to-br from-[#DF997E] to-[#CD8B70] text-white rounded-[1.5rem] font-black text-[17px] flex items-center justify-center gap-3 shadow-[0_20px_40px_-12px_rgba(223,153,126,0.25)] hover:shadow-[0_25px_50px_-12px_rgba(223,153,126,0.4)] transition-all duration-500 select-none touch-manipulation transform-gpu"
                  >
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <span className="tracking-widest uppercase">Войти на сайт</span>
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </div>

            <p className="text-center mt-8 text-[#4A403A]/30 text-[13px] font-medium tracking-wide flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CF8B70]/20 animate-pulse" />
              Smusl Dev Experience
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Reveal Overlay */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[1100] bg-[#FDF8ED] flex items-center justify-center"
          >
             <motion.div
               animate={{ scale: [1, 25], rotate: [0, 90] }}
               transition={{ duration: 1.5, ease: "easeInOut" }}
               className="w-20 h-20 bg-[#CF8B70] rounded-full blur-3xl opacity-20"
             />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
