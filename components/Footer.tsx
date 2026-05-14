"use client";
import React from "react";

import Link from "next/link";
import Image from "next/image";
import { Send, Mail, Phone, Clock, MapPin } from "lucide-react";
import { CONTACT } from "@/lib/constants/contact";

const Footer: React.FC = () => {
 return (
  <footer className="bg-smusl-brown text-white py-12 px-4 sm:px-6 lg:px-10 mt-16">
   <div className="grid grid-cols-1 md:grid-cols-4 gap-12 items-start">
    {/* ── Logo ── */}
    <div className="flex flex-col gap-4">
     <Link href="/" className="block w-fit select-none hover:opacity-80 transition-opacity">
      <Image
       src="/photo/logo.png"
       alt={CONTACT.siteName}
       width={160}
       height={160}
       className="h-auto w-[140px] sm:w-[180px] brightness-0 invert opacity-90"
      />
     </Link>
    </div>

    {/* ── Contacts ── */}
    <div className="flex flex-col gap-6 pt-4">
     <div className="flex items-center gap-4">
      <Clock className="w-5 h-5 text-white/80" />
      <span className="text-[16px] font-bold">{CONTACT.hours}</span>
     </div>
     <div className="flex items-start gap-4">
      <MapPin className="w-5 h-5 text-white/80 mt-1" />
      <span className="text-[16px] font-bold leading-tight">{CONTACT.address.display}</span>
     </div>
     <div className="flex gap-4 mt-2">
      <Link href="#" className="hover:opacity-70 transition-opacity">
       <div className="w-6 h-6 flex items-center justify-center font-black text-[20px] leading-none">VK</div>
      </Link>
      <Link href="#" className="hover:opacity-70 transition-opacity">
       <Send className="w-5 h-5" />
      </Link>
     </div>
    </div>

    {/* ── Support ── */}
    <div className="flex flex-col gap-6 pt-4">
     <div className="flex items-center gap-4">
      <Mail className="w-5 h-5 text-white/80" />
      <a href={CONTACT.email.mailto} className="text-[16px] font-bold hover:opacity-80 transition-opacity">
       {CONTACT.email.display}
      </a>
     </div>
     <div className="flex items-center gap-4">
      <Phone className="w-5 h-5 text-white/80" />
      <a href={CONTACT.phone.tel} className="text-[16px] font-bold hover:opacity-80 transition-opacity">
       {CONTACT.phone.display}
      </a>
     </div>
    </div>

    {/* ── Links ── */}
    <nav className="flex flex-col gap-4 pt-4">
     <Link href="#" className="text-[16px] font-bold hover:text-smusl-terracotta transition-colors">
      Почему без глютена?
     </Link>
     <Link href="#" className="text-[16px] font-bold hover:text-smusl-terracotta transition-colors">
      FAQ
     </Link>
     <Link href="#" className="text-[16px] font-bold hover:text-smusl-terracotta transition-colors">
      Статьи
     </Link>
    </nav>
   </div>


  </footer>
 );
};

export default Footer;
