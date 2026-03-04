"use client";
import React from "react";
import Link from "next/link";
import { User, ChevronDown } from "lucide-react";
import { useApp } from "@/store/AppContext";

const Header: React.FC = () => {
 const { setAddressModalOpen, address } = useApp();

 return (
  <header className="w-full px-4 sm:px-6 lg:px-10 pt-6 pb-6 bg-transparent relative z-[60] font-montserrat">
   <div className="flex items-center justify-between gap-8">

    {/* Logo */}
    <Link href="/" className="flex items-center cursor-pointer group shrink-0 select-none">
     <img
      src="/photo/logo.png"
      alt="СМЫСЛ"
      className="h-[60px] sm:h-[80px] w-[120px] sm:w-[140px] object-contain"
     />
    </Link>

    {/* Actions Group (Address + Profile) */}
    <div className="flex items-center gap-6 sm:gap-10">
     {/* Address Block */}
     <div className="hidden md:flex flex-col items-end shrink-0">
      <span className="text-[11px] font-bold text-[#4A403A]/40 uppercase tracking-[0.1em] mb-1">
       Самовывоз
      </span>
      <button
       onClick={() => setAddressModalOpen(true)}
       className="flex items-center gap-1.5 group"
      >
       <span className="text-[13px] sm:text-[15px] font-bold text-[#4A403A] group-hover:text-smusl-terracotta transition-colors line-clamp-1">
        {address || "Россия, г. Москва, ул. Ижорская, 3"}
       </span>
       <ChevronDown className="w-4 h-4 text-[#4A403A]/30 group-hover:text-smusl-terracotta transition-colors shrink-0" />
      </button>
     </div>

     {/* Profile button */}
     <Link
      href="/profile"
      className="flex items-center gap-2.5 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white border border-[#EBEBEB] text-[13px] sm:text-[15px] font-bold text-[#4A403A] hover:shadow-xl hover:shadow-[#4A403A]/5 transition-all shrink-0 active:scale-95 shadow-sm"
     >
      <User className="w-4 h-4 text-[#4A403A]/40 shrink-0" />
      <span className="hidden sm:inline">Личный кабинет</span>
     </Link>
    </div>

   </div>
  </header>
 );
};

export default Header;
