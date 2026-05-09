"use client"

import React from "react"
import { motion } from "framer-motion"
import { stepVariants } from "@/lib/motion-variants"
import { X, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  paymentMethod: 'sbp' | 'card' | null
  cardNumber: string
  cardExpiry: string
  cardCVC: string
  isCardValid: boolean
  setPaymentMethod: (v: 'sbp' | 'card') => void
  setCardNumber: (v: string) => void
  setCardExpiry: (v: string) => void
  setCardCVC: (v: string) => void
  onCheckout: () => void
  onClose: () => void
}

function formatCardNumber(val: string) {
  const digits = val.replace(/\D/g, '').substring(0, 16)
  return (digits.match(/.{1,4}/g) || []).join(' ')
}

function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, '').substring(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`
}

export default function CheckoutStep5Payment({
  paymentMethod, cardNumber, cardExpiry, cardCVC, isCardValid,
  setPaymentMethod, setCardNumber, setCardExpiry, setCardCVC,
  onCheckout, onClose,
}: Props) {
  const radioBtn = (active: boolean) => cn(
    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors px-0.5",
    active ? "border-[#CF8F73]" : "border-gray-200"
  )
  const radioDot = (active: boolean) => cn(
    "w-2.5 h-2.5 rounded-full bg-[#CF8F73] transition-all",
    active ? "scale-100 opacity-100" : "scale-0 opacity-0"
  )

  return (
    <motion.div
      key="step5-pay"
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex h-full w-full"
    >
      <div className="flex-1 p-6 sm:p-12 flex flex-col justify-center max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[24px] sm:text-[28px] font-extrabold text-[#3A332E] tracking-tight">
            Оплата заказа
          </h2>
          <button onClick={onClose} className="hidden sm:block p-2 text-gray-400 hover:text-[#3A332E] transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPaymentMethod('sbp')}
            className={cn(
              "w-full p-6 rounded-[1.8rem] border-2 transition-all flex items-center justify-between",
              paymentMethod === 'sbp' ? "border-[#CF8F73] bg-[#CF8F73]/5" : "border-gray-100 hover:border-gray-200"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 rounded-md bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 flex items-center justify-center shadow-sm">
                <span className="text-white font-extrabold text-[12px] tracking-wider">СБП</span>
              </div>
              <span className="font-extrabold text-[#3A332E] text-[17px]">Оплата через СБП</span>
            </div>
            <div className={radioBtn(paymentMethod === 'sbp')}><div className={radioDot(paymentMethod === 'sbp')} /></div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPaymentMethod('card')}
            className={cn(
              "w-full p-6 rounded-[1.8rem] border-2 transition-all flex items-center justify-between",
              paymentMethod === 'card' ? "border-[#CF8F73] bg-[#CF8F73]/5" : "border-gray-100 hover:border-gray-200"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 rounded-md bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center shadow-sm">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-[#3A332E] text-[17px]">Банковской картой</span>
            </div>
            <div className={radioBtn(paymentMethod === 'card')}><div className={radioDot(paymentMethod === 'card')} /></div>
          </motion.button>
        </div>

        {paymentMethod === 'card' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
            <div className="bg-[#F8F8F8] rounded-[1.2rem] px-5 py-3.5 border border-transparent focus-within:border-gray-300 transition-colors">
              <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Номер карты</span>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="0000 0000 0000 0000"
                className="bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F8F8F8] rounded-[1.2rem] px-5 py-3.5 border border-transparent focus-within:border-gray-300 transition-colors">
                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Срок</span>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                  placeholder="ММ/ГГ"
                  className="bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] w-full"
                />
              </div>
              <div className="bg-[#F8F8F8] rounded-[1.2rem] px-5 py-3.5 border border-transparent focus-within:border-gray-300 transition-colors">
                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">CVC</span>
                <input
                  type="password"
                  value={cardCVC}
                  onChange={(e) => setCardCVC(e.target.value.substring(0, 3))}
                  placeholder="•••"
                  className="bg-transparent border-none outline-none text-[16px] font-extrabold text-[#3A332E] w-full"
                />
              </div>
            </div>
          </motion.div>
        )}

        <button
          onClick={onCheckout}
          disabled={!paymentMethod || (paymentMethod === 'card' && !isCardValid)}
          className="mt-8 w-full h-[68px] bg-[#CF8F73] disabled:bg-[#CF8F73]/40 text-white rounded-[1.5rem] font-[900] text-[19px] hover:bg-[#b87a60] transition-all active:scale-95 shadow-xl shadow-[#CF8F73]/20"
        >
          Оплатить
        </button>
      </div>
    </motion.div>
  )
}
