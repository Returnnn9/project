"use client";

import { useEffect } from 'react';

export default function SmoothScroll() {
  useEffect(() => {
    // Проверяем ширину экрана - работаем только на десктопах (>= 1024px)
    const isDesktop = () => window.innerWidth >= 1024;
    
    if (!isDesktop()) {
      return; // На мобильных и планшетах не активируем
    }

    let currentScrollY = window.scrollY;
    let targetScrollY = window.scrollY;
    let isScrolling = false;
    let animationFrameId: number;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const updateScroll = () => {
      if (Math.abs(targetScrollY - currentScrollY) < 0.1) {
        currentScrollY = targetScrollY;
        isScrolling = false;
        return;
      }

      currentScrollY = lerp(currentScrollY, targetScrollY, 0.08);
      window.scrollTo(0, currentScrollY);
      
      animationFrameId = requestAnimationFrame(updateScroll);
    };

    const handleWheel = (e: WheelEvent) => {
      // Не перехватываем события внутри элементов с анимациями
      const target = e.target as HTMLElement;
      
      // Исключаем Hero секцию целиком, карусели и другие анимированные элементы
      if (target.closest('#hero') || 
          target.closest('.scrollSnapContainer') || 
          target.closest('[data-no-smooth-scroll]') ||
          target.closest('.activeCard') ||
          target.closest('.mobileCard') ||
          target.closest('[class*="spring"]') ||
          target.closest('[class*="animated"]')) {
        return; // Пропускаем - используем нативный скролл
      }

      e.preventDefault();
      targetScrollY += e.deltaY * 0.9;
      targetScrollY = Math.max(0, Math.min(targetScrollY, document.body.scrollHeight - window.innerHeight));
      
      if (!isScrolling) {
        isScrolling = true;
        animationFrameId = requestAnimationFrame(updateScroll);
      }
    };

    // Обработка ресайза - отключаем на маленьких экранах
    const handleResize = () => {
      if (!isDesktop()) {
        window.removeEventListener('wheel', handleWheel);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return null;
}
