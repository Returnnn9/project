"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { User, MapPin, Search, ChevronDown } from "lucide-react"
import { useApp } from "@/store/AppContext"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = ["Десерты", "Хлеб", "Снеки", "Выпечка"] as const

// ─── Component ───────────────────────────────────────────────────────────────

interface HeaderProps {
 showCategories?: boolean
}

const Header: React.FC<HeaderProps> = ({ showCategories = true }) => {
 const {
  setAddressModalOpen,
  address,
  deliveryType,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
 } = useApp()

 const { status } = useSession()
 const isAuthenticated = status === "authenticated"

 return (
  <header className="w-full z-[100] font-montserrat bg-[#F5E6DA]/50 pb-3 sm:pb-5 border-b border-[#4A403A]/5">
   <div className="w-full px-4 sm:px-8 lg:px-10">

    {/* Top row: Logo · Address · Profile */}
    <div className="flex items-center justify-between py-3 sm:py-4">
     {/* Logo */}
     <Link href="/" className="flex items-center cursor-pointer shrink-0 select-none">
      <Image src="/photo/logo.png" alt="СМЫСЛ ЕСТЬ" width={180} height={46} priority className="h-[30px] xs:h-[35px] sm:h-[40px] md:h-[46px] w-auto object-contain" />
     </Link>

     {/* Right: Address + Profile */}
     <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
      {/* Address Button (Custom Mockup Style) */}
      <button
       onClick={() => setAddressModalOpen(true)}
       className="flex flex-col items-start text-left group transition-opacity hover:opacity-80"
      >
       <span className="text-[13px] sm:text-[14px] font-[800] text-[#3A332E] leading-tight mb-0.5 sm:mb-1 uppercase tracking-tight">
        {deliveryType === "pickup" ? "Самовывоз" : (deliveryType === "delivery" ? "Доставка на дом" : "Способ получения")}
       </span>
       <div className="flex items-center gap-1 sm:gap-1.5">
        <span className="text-[14px] sm:text-[15px] font-[500] text-[#3A332E]/70 max-w-[140px] xs:max-w-[180px] sm:max-w-[240px] md:max-w-[320px] truncate">
         {address || "Нажмите, чтобы выбрать"}
        </span>
        <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#3A332E]/40 group-hover:text-smusl-terracotta transition-colors" />
       </div>
      </button>

      {/* Profile Button */}
      <Link
       href="/profile"
       className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D8CEC8] rounded-full text-[14px] text-[#5B5047]/80 hover:border-[#CF8F73]/60 hover:text-[#5B5047] transition-all shrink-0"
      >
       <User className={cn("w-4 h-4 shrink-0", isAuthenticated ? "text-[#CF8F73]" : "text-[#5B5047]/50")} />
       <span className="hidden sm:inline">
        {isAuthenticated ? "Личный кабинет" : "Личный кабинет"}
       </span>
      </Link>
     </div>
    </div>

    {/* Bottom row: Categories · Search */}
    {showCategories && (
     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-8 pt-1">
      {/* Categories */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar smooth-scroll shrink-0 w-[calc(100%+2rem)] -mx-4 px-4 sm:w-auto sm:mx-0 sm:px-0">
       {CATEGORIES.map((cat) => (
        <button
         key={cat}
         onClick={() => setActiveCategory(cat)}
         className={cn(
          "px-5 sm:px-6 py-2 sm:py-2.5 rounded-[1rem] text-[15px] sm:text-[16px] font-medium border-[1.5px] transition-all duration-200 whitespace-nowrap",
          activeCategory === cat
           ? "bg-white border-[#CF8F73] text-[#CF8F73]"
           : "bg-white text-[#5B5047]/70 border-[#D8CEC8]/60 hover:border-[#CF8F73]/50 hover:text-[#5B5047]"
         )}
        >
         {cat}
        </button>
       ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-[300px] md:max-w-[380px] lg:max-w-[440px] group mb-1 sm:mb-0">
       <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B5047]/30 group-focus-within:text-[#CF8F73] transition-colors" />
       <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Кекс фисташковый"
        className="w-full bg-white border border-[#D8CEC8]/80 rounded-full py-2.5 sm:py-3 pl-11 pr-5 text-[15px] sm:text-[16px] font-medium text-[#5B5047] focus:outline-none focus:border-[#CF8F73]/50 transition-all placeholder:text-[#5B5047]/30"
       />
      </div>
     </div>
    )}

   </div>
  </header>
 )
}

export default Header
