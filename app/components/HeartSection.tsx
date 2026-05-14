"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function HeartSection() {
 const [scale, setScale] = useState(1);
 const [isClient, setIsClient] = useState(false);
 const sectionRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
  setIsClient(true);
  const isMobile = () => window.innerWidth <= 768;
  if (isMobile()) {
   setScale(1);
   return;
  }
  let lastFrame = 0;
  const handleScroll = () => {
   const now = Date.now();
   if (now - lastFrame < 50) return; // ~20fps is enough for subtle scale
   lastFrame = now;
   if (!sectionRef.current) return;
   const rect = sectionRef.current.getBoundingClientRect();
   const windowHeight = window.innerHeight;
   const elementCenter = rect.top + rect.height / 2;
   const distance = windowHeight / 2 - elementCenter;
   const newScale = 1 + (Math.abs(distance) / windowHeight) * 0.15;
   setScale(Math.min(newScale, 1.15));
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  const handleResize = () => {
   if (isMobile()) {
    setScale(1);
    window.removeEventListener("scroll", handleScroll);
   } else {
    window.addEventListener("scroll", handleScroll, { passive: true });
   }
  };
  window.addEventListener("resize", handleResize, { passive: true });
  return () => {
   window.removeEventListener("scroll", handleScroll);
   window.removeEventListener("resize", handleResize);
  };
 }, []);

 // Гарантируем отсутствие анимации на мобильных при любом рендере
 let isMobile = false;
 let appliedScale = 1;
 let appliedTransition = 'none';
 if (isClient) {
  isMobile = window.innerWidth <= 768;
  appliedScale = isMobile ? 1 : scale;
  appliedTransition = isMobile ? 'none' : 'transform 0.3s ease-out';
 }

 return (
  <section ref={sectionRef} className="w-full py-20 relative overflow-hidden" style={{ backgroundColor: '#675b53' }}>
   <div className="max-w-7xl mx-auto px-4">
    <div className="grid md:grid-cols-2 gap-12 items-center">
     {/* Левая колонка - текст */}
     <div className="space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
      <h2 className="text-7xl md:text-9xl great-vibes italic" style={{ color: '#fdebc1', lineHeight: '1.1' }}>
       <style jsx>{`
                @media (min-width: 768px) {
                  h2 {
                    line-height: 0.95;
                  }
                }
              `}</style>
       В ритме <br />
       миллионов сердец
      </h2>
      <p className="text-lg leading-relaxed text-white">
       Наша выпечка — это любимый вкус, который объединяет миллионы
       сердец, живущих по всей стране. Миллионы завтраков, пропитанных
       заботой и миллионы чаепитий, которые делают нас чуточку ближе.
       Встречайте!
      </p>
     </div>

     {/* Правая колонка - изображение в форме сердца */}
     <div className="relative flex items-center justify-center">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl -translate-x-[10%] md:translate-x-0" style={{ transform: `scale(${appliedScale * 1.3})`, transition: appliedTransition, willChange: 'transform' }}>
       <Image
        src="/lending/rythm1.png"
        alt="Ритм"
        width={650}
        height={780}
        className="w-full h-auto object-cover"
        priority
       />
      </div>
     </div>
    </div>
   </div>

   {/* Декоративные элементы фона */}

  </section>
 );
}
