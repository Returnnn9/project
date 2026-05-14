"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getAboutData } from '../../lib/aboutData';
import type { AboutData } from '../../lib/aboutData';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.smislest.ru';

function getAssetUrl(file: string | { id: string; url?: string } | undefined, fallback: string): string {
 if (!file) return fallback;

 // Если это объект с url - используем его как есть
 if (typeof file === 'object' && file.url) {
  return file.url;
 }

 // Если это строка
 if (typeof file === 'string') {

  if (file.startsWith('http') || file.startsWith('/')) {
   return file;
  }
  // Если это ID - строим URL через DIRECTUS_URL
  return `${DIRECTUS_URL}/assets/${file}`;
 }

 // Если это объект с id
 if (file.id) {
  return `${DIRECTUS_URL}/assets/${file.id}`;
 }

 return fallback;
}

export default function AboutSection() {
 const [about, setAbout] = useState<AboutData | null>(null);

 useEffect(() => {
  // console.log("AboutSection: fetching data..."); // Закомментировано
  getAboutData()
   .then(data => {
    // console.log("AboutSection data received:", data); // Закомментировано
    setAbout(data);
   })
   .catch((error) => {
    // console.error("AboutSection error:", error); // Закомментировано
    setAbout(null);
   });
 }, []);

 const svgTitle = "/svg/logo_white.svg";
 const fallbackImages = {
  main: '/lending/staf1.png',
  topRight: '/lending/staf2.png',
  bottomLeft: '/lending/staf3.png',
  bottomRight: '/lending/staf4.png',
  extra1: '/lending/staf5.png',
 };
 const passionTitle = about?.passion_title || 'Мы...';
 const passionText = about?.passion_text || '«Смысл есть» — это пекарня в Москве, специализирующаяся на производстве безглютенового хлеба и выпечки.';
 const prideTitle = about?.pride_title || 'гордимся';
 const prideText = about?.pride_text || 'Мы первыми в России стали импортёрами тефовой муки и сегодня работаем с широким спектром альтернативных видов сырья: амарантовой, рисовой, гречневой, кукурузной, овсяной, ореховой и других мучных смесей. В ассортименте бренда «Смысл есть», более 20 видов продукции: от хлеба до десертов, созданных с заботой о здоровье и вкусе.';
 const missionTitle = about?.mission_title || 'наша миссия';
 const missionText = about?.mission_text || 'Создавать вкусную и безопасную безглютеновую продукцию с чистым составом. Мы стремимся к тому, чтобы питание стало осознанным, понятным и по-настоящему вкусным - без компромиссов между пользой и удовольствием';

 const images = {
  main: getAssetUrl(about?.image_main, fallbackImages.main),
  topRight: getAssetUrl(about?.image_top_right, fallbackImages.topRight),
  bottomLeft: getAssetUrl(about?.image_bottom_left, fallbackImages.bottomLeft),
  bottomRight: getAssetUrl(about?.image_bottom_right, fallbackImages.bottomRight),
  extra1: getAssetUrl(about?.image_extra1, fallbackImages.extra1),
 };

 return (
  <section id="about" className="w-full relative" style={{ paddingBottom: '100px', zIndex: 10 }}>
   {/* Фоновый узор с градиентом прозрачности (сверху 30%, к низу 90%) */}
   <div
    className="absolute left-0 w-full pointer-events-none"
    style={{
     top: '-400px',
     bottom: 0,
     maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.9))',
     WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.9))',
     zIndex: 5,
    }}
   >
    <Image
     src="/svg/uzr_bg.svg"
     alt=""
     width={1920}
     height={1080}
     className="w-full h-full"
     style={{ objectFit: 'fill' }}
     draggable={false}
    />
   </div>

   {/* Заголовок на зелёном фоне */}
   <div className="container mx-auto px-4 py-12 relative z-10">
    <div className="flex items-center justify-center gap-4 mb-8">
     <div className="flex-1 h-[2px]" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
     <div className="flex-shrink-0">
      <Image src={svgTitle} alt="Смысл есть" width={260} height={65} className="object-contain" />
     </div>
     <div className="flex-1 h-[2px]" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
    </div>
   </div>

   {/* Бежевый фон с изгибами - абсолютное позиционирование */}
   <div
    className="absolute left-0 w-full z-0 md:top-[280px] top-[480px] 2xl:top-[320px] lg:pt-16 xl:pt-28"
    style={{ backgroundColor: "var(--smusl-cream)", bottom: 0 }}
   >
    {/* SVG форма для верхнего изгиба - Desktop */}
    <div className="hidden md:block absolute top-0 left-0 w-full" style={{ height: '70px', transform: 'translateY(-69px)' }}>
     <svg viewBox="0 0 1920 70" preserveAspectRatio="none" className="w-full h-full">
      <path d="M0,0 C0,20 429.81,70 960,70 C1490.19,70 1920,20 1920,0 L1920,70 L0,70 Z" fill="var(--smusl-cream)" />
     </svg>
    </div>

    {/* SVG форма для верхнего изгиба - Mobile (более плавный изгиб) */}
    <div className="md:hidden absolute top-0 left-0 w-full" style={{ height: '35px', transform: 'translateY(-34px)' }}>
     <svg viewBox="0 0 1920 35" preserveAspectRatio="none" className="w-full h-full">
      <path d="M0,0 C0,10 429.81,35 960,35 C1490.19,35 1920,10 1920,0 L1920,35 L0,35 Z" fill="var(--smusl-cream)" />
     </svg>
    </div>

    {/* SVG форма для нижнего изгиба - Desktop */}
    <div className="hidden md:block absolute bottom-0 left-0 w-full" style={{ height: '70px', transform: 'translateY(69px)' }}>
     <svg viewBox="0 0 1920 70" preserveAspectRatio="none" className="w-full h-full">
      <path d="M0,70 C0,50 429.81,0 960,0 C1490.19,0 1920,50 1920,70 L1920,0 L0,0 Z" fill="var(--smusl-cream)" />
     </svg>
    </div>

    {/* SVG форма для нижнего изгиба - Mobile (более плавный изгиб) */}
    <div className="md:hidden absolute bottom-0 left-0 w-full" style={{ height: '35px', transform: 'translateY(34px)' }}>
     <svg viewBox="0 0 1920 35" preserveAspectRatio="none" className="w-full h-full">
      <path d="M0,35 C0,25 429.81,0 960,0 C1490.19,0 1920,25 1920,35 L1920,0 L0,0 Z" fill="var(--smusl-cream)" />
     </svg>
    </div>

   </div>

   {/* Контент поверх бежевого фона */}
   <div className="container mx-auto px-4 py-12 relative z-10" style={{ marginTop: '-100px' }}>

    {/* Desktop Layout */}
    <div className="hidden lg:block max-w-[1400px] mx-auto">
     <div className="grid grid-cols-12 gap-6 items-stretch">
      {/* Left Column - 2 images */}
      <div className="col-span-4 flex flex-col gap-6 lg:gap-5 h-full justify-between">
       {/* Top: horizontal image (старый пекарь) */}
       <div className="rounded-3xl overflow-hidden">
        <Image
         src={images.topRight}
         alt="Пекарь за работой"
         width={500}
         height={240}
         className="w-full h-auto object-contain"
        />
       </div>

       {/* Bottom: large vertical image */}
       <div className="rounded-3xl overflow-hidden">
        <Image
         src={images.bottomRight}
         alt="Процесс приготовления"
         width={500}
         height={480}
         className="w-full h-auto object-contain"
        />
       </div>
      </div>

      {/* Center Column - Main image + pride text + lab image */}
      <div className="col-span-4 flex flex-col gap-8 lg:gap-5 h-full justify-between">
       {/* Main image */}
       <div className="rounded-3xl overflow-hidden">
        <Image
         src={images.main}
         alt="Главное фото"
         width={450}
         height={500}
         className="w-full h-auto object-contain"
        />
       </div>

       {/* Pride text */}
       <div className="space-y-2 lg:space-y-1">
        <h3 className="great-vibes text-5xl lg:text-4xl xl:text-5xl" style={{ color: "var(--smusl-olive)" }}>{prideTitle}</h3>
        <p className="text-gray-800 text-base lg:text-sm xl:text-base lg:leading-snug xl:leading-relaxed leading-relaxed">{prideText}</p>
       </div>

       {/* Lab image */}
       <div className="rounded-3xl overflow-hidden">
        <Image
         src={images.extra1}
         alt="Лаборатория"
         width={450}
         height={180}
         className="w-full h-auto object-contain"
        />
       </div>
      </div>

      {/* Right Column - Beige text block + large image + mission text */}
      <div className="col-span-4 flex flex-col h-full self-stretch">
       {/* "Мы..." text - large white text on green background */}
       <div className="great-vibes text-7xl lg:text-6xl xl:text-7xl 2xl:text-9xl mb-6 lg:mb-5" style={{ color: "var(--smusl-cream)" }}>
        Мы...
       </div>

       {/* Text block without background - on beige section background */}
       <div className="space-y-2 lg:space-y-1 mt-auto mb-4 lg:mb-3">
        <h3 className="great-vibes text-5xl lg:text-4xl xl:text-5xl" style={{ color: "var(--smusl-olive)" }}>горим своим делом</h3>
        <p className="text-gray-800 text-base lg:text-sm xl:text-base lg:leading-snug xl:leading-relaxed leading-relaxed">{passionText}</p>
       </div>

       {/* Large image */}
       <div className="rounded-3xl overflow-hidden mb-4 lg:mb-3">
        <Image
         src={images.bottomLeft}
         alt="Работа с тестом"
         width={450}
         height={400}
         className="w-full h-auto object-contain"
        />
       </div>

       {/* Mission text */}
       <div className="space-y-2 lg:space-y-1 px-8 lg:px-6">
        <h3 className="great-vibes text-5xl lg:text-4xl xl:text-5xl" style={{ color: "var(--smusl-olive)" }}>{missionTitle}</h3>
        <p className="text-gray-800 text-base lg:text-sm xl:text-base lg:leading-snug xl:leading-relaxed leading-relaxed">{missionText}</p>
       </div>
      </div>
     </div>
    </div>

    {/* Mobile Layout */}
    <div className="lg:hidden flex flex-col gap-8 max-w-xl mx-auto">
     {/* we_are.svg над главным фото */}
     <div className="relative">
      <div className="mb-4">
       <img src="/svg/we_are.svg" alt="Мы" style={{ width: '200px', height: 'auto' }} className="mx-auto" />
      </div>
      <div className="rounded-3xl overflow-hidden">
       <Image src={images.main} alt="Главное фото" width={600} height={600} className="w-full object-cover" />
      </div>
     </div>

     <div className="space-y-3">
      <h3 className="great-vibes text-5xl" style={{ color: "var(--smusl-olive)" }}>Горим своим делом</h3>
      <p className="text-gray-800 text-base leading-relaxed">{passionText}</p>
     </div>

     <div className="rounded-3xl overflow-hidden">
      <Image src={images.topRight} alt="Процесс приготовления" width={600} height={400} className="block w-full object-cover" />
     </div>

     <div className="space-y-3">
      <h3 className="great-vibes text-5xl" style={{ color: "var(--smusl-olive)" }}>{prideTitle}</h3>
      <p className="text-gray-800 text-base leading-relaxed">{prideText}</p>
     </div>

     <div className="rounded-3xl overflow-hidden">
      <Image src={images.bottomLeft} alt="Работа с тестом" width={600} height={600} className="block w-full object-cover" />
     </div>

     <div className="space-y-3">
      <h3 className="great-vibes text-5xl" style={{ color: "var(--smusl-olive)" }}>{missionTitle}</h3>
      <p className="text-gray-800 text-base leading-relaxed">{missionText}</p>
     </div>
    </div>
   </div>
  </section>
 );
}