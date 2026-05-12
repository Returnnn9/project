"use client"

import React, { useState } from "react"
import { User, Key, ArrowRight, Lock, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminLoginPage() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: username,
        password: password,
      })

      if (res?.error) {
        throw new Error(res.error === "CredentialsSignin" ? "Неверный логин или пароль" : res.error)
      }

      router.push("/admin")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Неверный логин или пароль')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF8ED] flex flex-col items-center justify-center p-6 relative overflow-hidden font-manrope">
      {/* Cinematic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#CF8F73]/15 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4A403A]/10 blur-[120px] rounded-full" />

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Logo Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-6 border border-[#4A403A]/5">
            <Lock className="w-9 h-9 text-[#CF8B70] drop-shadow-sm" />
          </div>
          <h1 className="text-[36px] font-black text-[#4A403A] tracking-tighter leading-none">Админ</h1>
          <p className="text-[#4A403A]/50 font-medium mt-3 text-center text-sm px-8">Гармония управления и эстетики Smusl 2026</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-3xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(74,64,58,0.15)] border border-white/50 overflow-hidden relative p-10"
        >
          <form onSubmit={handleCredentialsSubmit} className="space-y-7">
            <div className="space-y-3">
              <label className="block text-[12px] font-black text-[#4A403A]/40 uppercase tracking-[0.25em] ml-1">Логин</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A403A]/30 group-focus-within:text-[#CF8B70] transition-colors" />
                <input
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/80 border-2 border-transparent focus:border-[#CF8B70]/30 rounded-[1.4rem] py-5 pl-14 pr-6 font-bold text-[#4A403A] outline-none transition-all placeholder:font-medium placeholder:text-gray-300 shadow-sm"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[12px] font-black text-[#4A403A]/40 uppercase tracking-[0.25em] ml-1">Пароль</label>
              <div className="relative group">
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A403A]/30 group-focus-within:text-[#CF8B70] transition-colors" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/80 border-2 border-transparent focus:border-[#CF8B70]/30 rounded-[1.4rem] py-5 pl-14 pr-6 font-bold text-[#4A403A] outline-none transition-all placeholder:font-medium placeholder:text-gray-300 shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-red-500 text-[14px] font-bold text-center bg-red-50/80 backdrop-blur-md py-3 rounded-2xl border border-red-100"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className="w-full h-[72px] bg-gradient-to-br from-[#DF997E] to-[#CD8B70] text-white rounded-[1.50rem] font-black text-[18px] shadow-[0_20px_40px_-12px_rgba(223,153,126,0.25)] transition-all duration-500 relative overflow-hidden group transform-gpu"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <span className="tracking-widest uppercase text-[16px]">Войти</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </motion.button>
          </form>
        </motion.div>

        <p className="text-center mt-12 text-[11px] text-[#4A403A]/20 font-black uppercase tracking-[0.3em] opacity-40">
          Smusl © 2026 Cloud Infrastructure
        </p>
      </div>
    </div>
  )
}
