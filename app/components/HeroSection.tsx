"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./HeroSection.module.css";
import { useEffect, useState } from "react";
import type { HeroData } from '../../lib/heroData';

interface HeroSectionProps {
 initialData?: HeroData | null;
}

export default function HeroSection({ initialData = null }: HeroSectionProps) {
 const [waveScrolled, setWaveScrolled] = useState(false);
 const [hero, setHero] = useState<HeroData | null>(initialData);

 useEffect(() => {
  setHero(initialData);
 }, [initialData]);

 useEffect(() => {
  let ticking = false;
  const onScroll = () => {
   if (ticking) return;
   ticking = true;
   requestAnimationFrame(() => {
    setWaveScrolled(window.scrollY > 60);
    ticking = false;
   });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
 }, []);

 // Если данные не загрузились, рендерим пустую секцию
 const data = hero;

 if (!data) {
  return null;
 }

 return (
  <section
   className={styles.hero}
   id="hero"
   style={{
    backgroundColor: "#93a88f",
    ...(data.backgroundImage
     ? { backgroundImage: `url(${data.backgroundImage})` }
     : {}),
   }}
  >
   {/* Фоновая волна - десктоп */}
   <div className={styles.waveBg} aria-hidden="true">
    <img
     src="/svg/muka_wave.svg"
     alt=""
     className={`${styles.waveSvg} ${waveScrolled ? styles.waveScrolled : ''}`}
    />
   </div>

   {/* Фоновая волна - мобильная */}
   <div className={styles.waveBgMobile} aria-hidden="true">
    <img
     src="/svg/muka_mob.svg"
     alt=""
     className={styles.waveSvgMobile}
     loading="lazy"
    />
   </div>

   {/* Декоративные хлеба */}
   <div className={styles.breadsBg} aria-hidden="true">
    <picture>
     <source srcSet="/lending/bread_.avif" type="image/avif" />
     <img src="/lending/bread_.png" alt="" className={`${styles.bread} ${styles.breadMain}`} loading="lazy" width={520} height={480} />
    </picture>
    <picture>
     <source srcSet="/lending/bread_1.avif" type="image/avif" />
     <img src="/lending/bread_1.png" alt="" className={`${styles.bread} ${styles.bread1}`} loading="lazy" width={260} height={240} />
    </picture>
    <picture>
     <source srcSet="/lending/bread_min.avif" type="image/avif" />
     <img src="/lending/bread_min.png" alt="" className={`${styles.bread} ${styles.breadMin}`} loading="lazy" width={180} height={165} />
    </picture>
    <picture>
     <source srcSet="/lending/bread_micro.avif" type="image/avif" />
     <img src="/lending/bread_micro.png" alt="" className={`${styles.bread} ${styles.breadMicro}`} loading="lazy" width={120} height={110} />
    </picture>
   </div>

   {/* Декоративные колосья */}
   <div className={`${styles.wheatDecor} ${styles.wheatLeft}`}>

   </div>
   <div className={`${styles.wheatDecor} ${styles.wheatRight}`}>

   </div>

   {/* Основной контент */}
   <div className={styles.content}>
    {/* МОБИЛЬНАЯ ВЕРСИЯ - КАРТИНКА СВЕРХУ */}
    <div className={styles.mobileLayout}>
     <div className={styles.mobileImageContainer}>
      <div className={styles.imageGradient} aria-hidden="true" />
      <div className={`${styles.heartImage} ${styles.heartbeat}`}>
       <Image
        src={data.image || "/lending/heart.png"}
        alt={data.imageAlt || "Хлеб в форме сердца"}
        fill
        className="object-contain"
        priority
        sizes="(max-width: 767px) 90vw, 500px"
       />
      </div>
     </div>

     <div className={styles.textContainer}>
      <h1 className={styles.title}>
       {data.title}
      </h1>

      <div className={styles.subtitle}>
       {data.subtitle}
      </div>

      {(() => {
       const ctaLink = data.ctaLink || '#';
       const ctaText = data.ctaText || 'В каталог';
       return (
        <Link href={ctaLink} className={styles.button} aria-label={ctaText}>
         {ctaText}
        </Link>
       );
      })()}
     </div>
    </div>

    {/* ДЕСКТОПНАЯ ВЕРСИЯ - ДВЕ КОЛОНКИ */}
    <div className={styles.desktopLayout}>
     <div className={styles.textContainer}>
      <h1 className={styles.title}>
       {data.title}
      </h1>

      <div className={styles.subtitle}>
       {data.subtitle}
      </div>

      {(() => {
       const ctaLink = data.ctaLink || '#';
       const ctaText = data.ctaText || 'В каталог';
       return (
        <Link href={ctaLink} className={styles.button} aria-label={ctaText}>
         {ctaText}
        </Link>
       );
      })()}
     </div>

     <div className={styles.imageContainer}>
      <div className={styles.imageGradient} aria-hidden="true" />
      <div className={`${styles.heartImage} ${styles.heartbeat}`}>
       <Image
        src={data.image || "/lending/heart.png"}
        alt={data.imageAlt || "Хлеб в форме сердца"}
        fill
        className="object-contain"
        priority
        sizes="(min-width: 768px) 50vw, (min-width: 1024px) 40vw, 600px"
       />
      </div>
     </div>
    </div>
   </div>
  </section>
 );
}