"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Clock, Heart, ShoppingBag } from "lucide-react"
import { useApp, Product } from "@/store/AppContext"
import { products } from "@/components/data"
import ProductCard from "@/components/ProductCard"
import { OrderSkeleton, ProductCardSkeleton } from "@/components/Skeleton"

const ORDERS = [
 {
  id: 1,
  name: "Пирожное фисташка-малина",
  info: "75 г х 2",
  date: "12 февраля, 2026",
  address: "Россия, г. Москва, ул. Ижорская, 3",
  price: 798,
 },
 {
  id: 2,
  name: "Пирожное фисташка-малина",
  info: "75 г х 2",
  date: "12 февраля, 2026",
  address: "Россия, г. Москва, ул. Ижорская, 3",
  price: 798,
 },
 {
  id: 3,
  name: "Пирожное фисташка-малина",
  info: "75 г х 2",
  date: "12 февраля, 2026",
  address: "Россия, г. Москва, ул. Ижорская, 3",
  price: 798,
 },
 {
  id: 4,
  name: "Пирожное фисташка-малина",
  info: "75 г х 2",
  date: "12 февраля, 2026",
  address: "Россия, г. Москва, ул. Ижорская, 3",
  price: 798,
 },
]

export default function ProfilePage() {
 const { addToCart } = useApp()
 const [activeTab, setActiveTab] = useState("Избранное")
 const [isLoading, setIsLoading] = useState(true)

 useEffect(() => {
  setIsLoading(true)
  const timer = setTimeout(() => setIsLoading(false), 1000)
  return () => clearTimeout(timer)
 }, [activeTab])

 // Mock favorites
 const favoriteProducts = products.slice(0, 3)

 return (
  <div className="min-h-screen bg-smusl-beige font-montserrat flex flex-col">
   <Header />

   <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 pb-20 mt-10">
    {/* ── Back Link ── */}
    <Link href="/market" className="flex items-center gap-2 text-smusl-brown/60 hover:text-smusl-brown transition-colors mb-12 group font-bold">
     <ArrowLeft className="w-5 h-5 text-smusl-brown group-hover:-translate-x-1 transition-transform" />
     <span className="text-[15px]">Назад на главную</span>
    </Link>

    <div className="flex flex-col lg:flex-row justify-between items-start mb-12 sm:mb-16 gap-8">
     <div className="space-y-2">
      <h1 className="text-[28px] sm:text-[38px] lg:text-[48px] font-bold text-[#CF8F73]/50 leading-tight tracking-tight">
       Добро пожаловать,
      </h1>
      <h1 className="text-[38px] sm:text-[50px] lg:text-[58px] font-black text-[#CF8F73] leading-[0.9] tracking-tighter">
       Иван!
      </h1>
     </div>

     {/* ── Points Block ── */}
     <div className="w-full sm:w-auto p-6 sm:p-8 border-2 border-[#CF8F73]/20 rounded-[1.8rem] sm:rounded-[2rem] flex flex-col items-end sm:min-w-[240px] bg-white shadow-sm self-end lg:self-start group hover:border-[#CF8F73]/40 transition-colors">
      <span className="text-[11px] sm:text-[13px] text-[#CF8F73]/60 font-bold uppercase tracking-widest mb-1 sm:mb-2">Всего баллов</span>
      <span className="text-[32px] sm:text-[48px] font-black text-[#4A403A] leading-none tracking-tight">1,102</span>
     </div>
    </div>

    {/* ── Tabs ── */}
    <div className="flex gap-4 mb-12 overflow-x-auto smooth-scroll py-2">
     {[
      { label: "История заказов", icon: Clock },
      { label: "Избранное", icon: Heart },
      { label: "Корзина", icon: ShoppingBag },
     ].map((tab) => (
      <button
       key={tab.label}
       onClick={() => setActiveTab(tab.label)}
       className={`flex items-center gap-3 px-8 py-4 rounded-[1.2rem] text-[15px] font-bold transition-all border-2 whitespace-nowrap ${activeTab === tab.label
        ? "bg-white text-[#CF8F73] border-[#CF8F73] shadow-lg shadow-[#CF8F73]/10"
        : "bg-white text-smusl-gray border-transparent hover:border-smusl-light-gray"
        }`}
      >
       <tab.icon className={`w-5 h-5 ${activeTab === tab.label ? "fill-[#CF8F73]" : ""}`} />
       {tab.label}
      </button>
     ))}
    </div>

    {/* ── Content ── */}
    {activeTab === "Избранное" ? (
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {isLoading ? (
       Array.from({ length: 3 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
       ))
      ) : (
       favoriteProducts.map((p: Product, i) => (
        <ProductCard key={p.id} {...p} onAdd={() => addToCart(p)} index={i} />
       ))
      )}
     </div>
    ) : activeTab === "История заказов" ? (
     <div className="space-y-4">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-[2fr_1.5fr_2fr_1fr_1fr] px-6 text-[14px] font-bold text-smusl-gray uppercase tracking-wider mb-2">
       <div>Название</div>
       <div>Дата</div>
       <div>Адрес</div>
       <div>Цена</div>
       <div />
      </div>

      {/* Order Items */}
      {isLoading ? (
       Array.from({ length: 4 }).map((_, i) => (
        <OrderSkeleton key={i} />
       ))
      ) : (
       ORDERS.map((order, i) => (
        <motion.div
         key={order.id}
         initial={{ opacity: 0, x: -20 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ duration: 0.4, delay: i * 0.1 }}
         className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_2fr_1fr_1fr] items-center px-6 py-6 bg-white border border-smusl-light-gray rounded-[2rem] shadow-sm hover:border-smusl-terracotta transition-all group gap-4"
        >
         <div className="flex flex-col">
          <span className="text-[16px] font-bold text-smusl-brown group-hover:text-smusl-terracotta transition-colors">
           {order.name}
          </span>
          <span className="text-[13px] text-smusl-gray">{order.info}</span>
         </div>
         <div className="text-[14px] text-smusl-brown font-medium">
          {order.date}
         </div>
         <div className="text-[14px] text-smusl-brown font-medium max-w-[250px]">
          {order.address}
         </div>
         <div className="text-[20px] font-bold text-smusl-brown">
          {order.price} ₽
         </div>
         <div className="flex justify-start md:justify-end">
          <button className="px-6 py-3 bg-smusl-terracotta text-white rounded-xl text-[14px] font-bold hover:bg-[#b87a60] transition-all whitespace-nowrap">
           Повторить заказ
          </button>
         </div>
        </motion.div>
       ))
      )}
     </div>
    ) : (
     <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-smusl-light-gray">
      <ShoppingBag className="w-16 h-16 text-smusl-light-gray mb-4" />
      <p className="text-smusl-gray font-bold">Корзина пуста</p>
     </div>
    )}
   </main>

   <Footer />
  </div>
 )
}
