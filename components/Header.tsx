"use client";
import React from "react";
import Link from "next/link";
import { User, ChevronDown, UserPlus, MapPin, Search } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const Header: React.FC = () => {
 const {
  setAddressModalOpen,
  address,
  setAuthModalOpen,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery
 } = useApp();
 const { data: session, status } = useSession();

 const handleProfileClick = (e: React.MouseEvent) => {
  // Allow all users to access profile
 };

 const categories = ["Десерты", "Хлеб", "Снеки", "Выпечка"];

 return (
  <header className="w-full z-[100] font-manrope bg-[#FDF8ED] pb-4 border-b border-[#4A403A]/5">
   <div className="w-full px-4 sm:px-8 lg:px-12">
    {/* Top Row: Logo, Address, Profile */}
    <div className="flex items-center justify-between py-6">
     {/* Logo */}
     <Link href="/" className="flex items-center cursor-pointer group shrink-0 select-none">
      <img
       src="/photo/logo.png"
       alt="СМЫСЛ ЕСТЬ"
       className="h-[60px] sm:h-[50px] w-auto object-contain"
      />
     </Link>

     <div className="flex items-center gap-4 sm:gap-6">
      {/* Address Button */}
      <button
       onClick={() => setAddressModalOpen(true)}
       className="hidden md:flex items-center gap-3 px-6 py-3.5 bg-white/50 border border-[#4A403A]/10 rounded-full hover:bg-white hover:shadow-lg transition-all group"
      >
       <MapPin className="w-4 h-4 text-[#4A403A]/60 group-hover:text-smusl-terracotta transition-colors" />
       <span className="text-[14px] font-bold text-[#4A403A]/70 group-hover:text-smusl-terracotta transition-colors max-w-[200px] truncate">
        {address || "Выберите способ и адрес получения"}
       </span>
      </button>

      {/* Profile Button */}
      <Link
       href="/profile"
       onClick={handleProfileClick}
       className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white border border-[#F0F0F0] text-[14px] font-[800] text-[#4A403A] hover:shadow-lg transition-all shrink-0 active:scale-95 shadow-sm"
      >
       {status === "authenticated" ? (
        <>
         <User className="w-4 h-4 text-smusl-terracotta shrink-0" />
         <span className="hidden sm:inline">Личный кабинет</span>
        </>
       ) : (
        <>
         <UserPlus className="w-4 h-4 text-[#4A403A]/40 shrink-0" />
         <span className="hidden sm:inline">Войти</span>
        </>
       )}
      </Link>
     </div>
    </div>

    {/* Bottom Row: Categories and Search */}
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2">
     {/* Categories */}
     <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide shrink-0 w-full md:w-auto">
      {categories.map((cat) => (
       <button
        key={cat}
        onClick={() => setActiveCategory(cat)}
        className={cn(
         "px-8 py-3.5 rounded-2xl text-[14px] font-bold border-2 whitespace-nowrap transition-all duration-300",
         activeCategory === cat
          ? "bg-white border-smusl-terracotta text-smusl-terracotta shadow-lg shadow-smusl-terracotta/10"
          : "bg-white/50 border-transparent text-smusl-gray hover:bg-white hover:border-smusl-light-gray"
        )}
       >
        {cat}
       </button>
      ))}
     </div>

     {/* Search Bar */}
     <div className="relative w-full md:w-[320px] lg:w-[450px] group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A403A]/20 group-focus-within:text-smusl-terracotta transition-colors" />
      <input
       type="text"
       value={searchQuery}
       onChange={(e) => setSearchQuery(e.target.value)}
       placeholder="Кекс фисташковый"
       className="w-full bg-white/70 backdrop-blur-md border border-[#E8E8E8] rounded-2xl py-3.5 pl-11 pr-5 text-[14px] font-medium focus:outline-none focus:border-smusl-terracotta focus:bg-white transition-all shadow-sm placeholder:text-[#4A403A]/20"
      />
     </div>
    </div>
   </div>
  </header>
 );
};

export default Header;
