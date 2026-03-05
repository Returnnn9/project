"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const LandingHeader = () => {
 const [isScrolled, setIsScrolled] = useState(false);

 useEffect(() => {
  const handleScroll = () => {
   setIsScrolled(window.scrollY > 20);
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
 }, []);

 return (
  <header
   className={cn(
    "fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-out",
    isScrolled
     ? "bg-[#FDF8ED]/95 backdrop-blur-xl py-3 border-b border-[#EAE5D8]/50 shadow-sm"
     : "bg-transparent py-6"
   )}
  >
   <div className="container mx-auto px-4 flex items-center justify-between relative">
    {/* Left Nav */}
    <nav className="hidden lg:flex items-center gap-10 text-[15px] font-[800] tracking-tight text-[#936746]">
     {[
      { label: 'меню', href: '/menu', size: '107 × 24' },
      { label: 'доставка', href: '/delivery', size: '154 × 24' },
      { label: 'новости', href: '/news', size: '136 × 24' },
      { label: 'контакты', href: '/contacts', size: '162 × 24' },
      { label: 'FAQ', href: '/faq', size: '48 × 24' },
     ].map((link) => (
      <Link
       key={link.label}
       href={link.href}
       className="nav-dashed-border group transition-colors hover:text-blue-500"
      >
       <span className="relative z-10">{link.label}</span>
       <span className="nav-dashed-label">{link.size}</span>
      </Link>
     ))}
    </nav>

    {/* Center Logo */}
    <div className="absolute left-1/2 -translate-x-1/2">
     <Link href="/" className="hover:scale-110 transition-transform duration-500 ease-out block">
      <Image
       src="/images/Logoo.png"
       alt="СМЫСЛ ЕСТЬ"
       width={isScrolled ? 56 : 72}
       height={isScrolled ? 56 : 72}
       className="transition-all duration-500"
       priority
      />
     </Link>
    </div>

    {/* Right Nav */}
    <div className="flex items-center gap-10 text-[16px] font-[800] text-[#936746]">
     <a href="tel:+79262104565" className="hidden lg:block nav-dashed-border group transition-colors hover:text-blue-500">
      <span className="relative z-10">+7 926 210-45-65</span>
      <span className="nav-dashed-label">162 × 24</span>
     </a>
     <a href="mailto:info@smislest.ru" className="hidden lg:block nav-dashed-border group transition-colors hover:text-blue-500">
      <span className="relative z-10">info@smislest.ru</span>
      <span className="nav-dashed-label">150 × 24</span>
     </a>
    </div>
   </div>
  </header>
 );
};

export default LandingHeader;
