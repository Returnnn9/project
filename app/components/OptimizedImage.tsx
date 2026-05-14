"use client";

import { useEffect, useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  desktopSrc?: string;
  mobileSrc?: string;
  width?: number;
  height?: number;
}

export default function OptimizedImage({
  src,
  alt,
  className,
  desktopSrc,
  mobileSrc,
  width,
  height
}: OptimizedImageProps) {
  const [supportsWebP, setSupportsWebP] = useState(true);


  // Выбираем правильный источник изображения
  useEffect(() => {
    // Проверяем поддержку WebP
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      if (canvas.getContext && canvas.getContext('2d')) {
        setSupportsWebP(canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0);
      }
    };
    checkWebPSupport();
  }, []);

  // Выбираем источник изображения только по пропсам
  const imageSource = mobileSrc || desktopSrc || src;
  
  // Если нет поддержки WebP, заменяем на .jpg/.png
  const finalSource = !supportsWebP && imageSource.endsWith('.webp') 
    ? imageSource.replace('.webp', '.jpg') 
    : imageSource;

  return (
    <img
      src={finalSource}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading="lazy"
    />
  );
}
