
"use client";
/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';

type ImageProps = NextImageProps & {
  src: string;
  alt: string;
  className?: string;
};

function getMobileSrc(src: string): string {
  // Мобильные WebP: /lending/mob/<basename>_mob.webp или /img/mob/...
  const match = src.match(/\/(img|lending)\/(.+)\.(png|jpg|jpeg|webp)$/);
  if (match) {
    const folder = match[1];
    const base = match[2];
    if (folder === "lending") {
      const skipMob = new Set(["logo", "favicon", "open2026", "placeholder", "news3", "OG_img_opt", "10"]);
      if (skipMob.has(base)) return src;
    }
    return `/${folder}/mob/${base}_mob.webp`;
  }
  return src;
}

export default function Image({ src, alt, className, ...props }: ImageProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  const mobileSrc = isMobile ? getMobileSrc(src) : src;

  if (process.env.NODE_ENV === 'development') {
    return (
      <img
        src={mobileSrc}
        alt={alt}
        className={className}
        loading="lazy"
        {...props as any}
      />
    );
  }
  return (
    <NextImage
      src={mobileSrc}
      alt={alt}
      className={className}
      loading={props.loading || 'lazy'}
      {...props}
    />
  );
}
