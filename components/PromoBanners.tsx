"use client";
import React from "react";

const PromoBanners = () => (
 <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">

  {/* ── Story 1: Handwork (Bottom Curve) ── */}
  <div className="group anim-slide-up relative flex h-[240px] flex-col overflow-hidden rounded-[2rem] bg-[#111] p-7 transition-all duration-300 hover:shadow-wow hover:scale-[1.01] border border-white/[0.05]">
   <div className="relative z-10">
    <p className="mb-2 text-[10px] font-black tracking-[0.2em] text-white/20 uppercase">
     эксклюзив
    </p>
    <h2 className="max-w-[200px] text-[22px] font-[1000] leading-[1.1] text-white tracking-tight uppercase">
     РУЧНАЯ РАБОТА И КАЧЕСТВО
    </h2>
   </div>

   {/* Bottom Curve Image */}
   <div className="absolute inset-0 top-[40%] flex justify-center pointer-events-none">
    <div
     className="w-[120%] h-[150%] transition-all duration-500 ease-premium group-hover:scale-110"
     style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80')",
      backgroundPosition: "center 60%",
      backgroundSize: "cover",
      clipPath: "ellipse(50% 45% at 50% 50%)",
      filter: "brightness(0.7) contrast(1.1) saturate(1.2)"
     }}
    />
   </div>

   <button className="absolute bottom-5 right-5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md transition-all duration-200 hover:bg-white hover:text-[#111] cursor-pointer active:scale-90">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
     <path d="M7 17L17 7M17 7H7M17 7V17" />
    </svg>
   </button>
  </div>

  {/* ── Story 2: Promo (Centered Ellipse Window) ── */}
  <div className="group anim-slide-up anim-delay-1 relative flex h-[240px] flex-col overflow-hidden rounded-[2rem] bg-[#111] p-7 transition-all duration-300 hover:shadow-wow hover:scale-[1.01] border border-white/[0.05]">
   <div className="relative z-10 text-center">
    <p className="mb-2 text-[10px] font-black tracking-[0.2em] text-white/20 uppercase text-center">
     акция
    </p>
    <h2 className="text-[24px] font-[1000] tracking-tight leading-[1.1] text-white uppercase whitespace-nowrap">
     СЕГОДНЯ СКИДКА -20%
    </h2>
   </div>

   {/* Centered Ellipse "Window" */}
   <div className="absolute inset-0 flex items-center justify-center top-[15%] pointer-events-none">
    <div
     className="w-[90%] h-[120%] transition-all duration-500 ease-premium group-hover:scale-110"
     style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=800&q=80')",
      backgroundPosition: "center",
      backgroundSize: "cover",
      clipPath: "ellipse(50% 30% at 50% 50%)",
      filter: "brightness(0.8) contrast(1.1)"
     }}
    />
   </div>

   <button className="absolute bottom-5 right-5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md transition-all duration-200 hover:bg-white hover:text-[#111] cursor-pointer active:scale-90">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
     <path d="M7 17L17 7M17 7H7M17 7V17" />
    </svg>
   </button>
  </div>

  {/* ── Story 3: New Menu (Bottom Curve) ── */}
  <div className="group anim-slide-up anim-delay-2 relative flex h-[240px] flex-col overflow-hidden rounded-[2rem] bg-[#111] p-7 transition-all duration-300 hover:shadow-wow hover:scale-[1.01] border border-white/[0.05]">
   <div className="relative z-10">
    <p className="mb-2 text-[10px] font-black tracking-[0.2em] text-white/20 uppercase">
     новинка меню
    </p>
    <h2 className="max-w-[200px] text-[22px] font-[1000] leading-[1.1] text-white tracking-tight uppercase">
     ДЕГУСТАЦИИ И ДЕСЕРТОВ
    </h2>
   </div>

   {/* Bottom Curve Image */}
   <div className="absolute inset-0 top-[40%] flex justify-center pointer-events-none">
    <div
     className="w-[120%] h-[150%] transition-all duration-500 ease-premium group-hover:scale-110"
     style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1519340333755-9620575d2726?w=800&q=80')",
      backgroundPosition: "center",
      backgroundSize: "cover",
      clipPath: "ellipse(50% 45% at 50% 50%)",
      filter: "brightness(0.7) contrast(1.1) saturate(1.2)"
     }}
    />
   </div>

   <button className="absolute bottom-5 right-5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md transition-all duration-200 hover:bg-white hover:text-[#111] cursor-pointer active:scale-90">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
     <path d="M7 17L17 7M17 7H7M17 7V17" />
    </svg>
   </button>
  </div>

 </div>
);

export default PromoBanners;
