"use client";

import Image from "next/image";

interface OptimizedNewsImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  quality?: number;
}

export default function OptimizedNewsImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 70
}: OptimizedNewsImageProps) {
  
  // Добавляем параметры оптимизации к URL Directus
  const getOptimizedUrl = (baseUrl: string) => {
    // Если это не Directus URL или уже есть параметры, оставляем как есть
    if (!baseUrl.includes('/assets/') || baseUrl.includes('?width=')) {
      return baseUrl;
    }
    
    // Добавляем параметры
    const params = new URLSearchParams({
      width: width.toString(),
      height: height.toString(),
      quality: quality.toString(),
      format: 'webp',
      fit: 'cover'
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  const optimizedSrc = getOptimizedUrl(src);

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1280px"
    />
  );
}