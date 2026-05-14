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
  const [hero, setHero] = useState<HeroData | null>(initialData);

  useEffect(() => {
   setHero(initialData);
  }, [initialData]);

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