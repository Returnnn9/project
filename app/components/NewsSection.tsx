"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NewsItem, NewsImage } from '../../lib/newsData';

interface NewsSectionProps {
  initialNews?: NewsItem[];
}

export default function NewsSection({ initialNews = [] }: NewsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const formatDate = (value?: string) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // Клиентская загрузка для подстраховки (если серверная не сработала)
  useEffect(() => {
    async function fetchNews() {
      const cacheKey = 'news-cache-v1';
      try {
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached) as NewsItem[];
            if (Array.isArray(parsed) && parsed.length > 0 && news.length === 0) {
              setNews(parsed);
            }
          }
        }
      } catch (err) {
        // Cache read error handled silently
      }
    }
    if (news.length === 0) {
      fetchNews();
    }
  }, [news.length]);

  // Получение URL изображения через filename_disk
  const getImageUrl = (img: NewsImage | null) => {
    if (!img) return "/lending/placeholder.jpg";
    if ('url' in img && img.url) return img.url;
    if (!img.filename_disk) return "/lending/placeholder.jpg";
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.smislest.ru';
    return `${directusUrl}/assets/${img.filename_disk}`;
  };

  const nextNews = () => {
    setCurrentIndex((prev: number) => (prev + 1) % news.length);
  };

  const prevNews = () => {
    setCurrentIndex((prev: number) => (prev - 1 + news.length) % news.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  // Простая мобильная прокрутка пальцем (без сложной логики)
  const handleMobileScroll = useCallback(() => {
    if (!scrollContainerRef.current || !news.length) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const card = container.querySelector('.mobile-news-card') as HTMLElement;
    if (!card) return;
    
    const cardWidth = card.offsetWidth;
    const gap = 16;
    const newIndex = Math.round(scrollLeft / (cardWidth + gap));
    
    if (newIndex >= 0 && newIndex < news.length && newIndex !== mobileActiveIndex) {
      setMobileActiveIndex(newIndex);
    }
  }, [news.length, mobileActiveIndex]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleMobileScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleMobileScroll);
    }
  }, [handleMobileScroll]);

  // Стили для мобильного скролла
  const addMobileStyles = () => {
    if (typeof window === 'undefined') return;
    
    const styleId = 'mobile-news-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .mobile-news-scroll {
        display: flex;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        gap: 16px;
        padding: 16px 16px 20px;
        margin: 0;
        width: 100%;
        scrollbar-width: none;
      }
      
      .mobile-news-scroll::-webkit-scrollbar {
        display: none;
      }
      
      .mobile-news-card {
        flex: 0 0 auto;
        width: min(85vw, 320px);
      }
    `;
    document.head.appendChild(style);
  };

  useEffect(() => {
    addMobileStyles();
  }, []);

  return (
    <section id="news" className="w-full py-16 md:py-20 relative overflow-hidden" style={{ backgroundColor: '#716356' }}>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Стрелки управления */}
        <button
          onClick={prevNews}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 transition-all items-center justify-center cursor-pointer group"
          style={{
            borderColor: '#fdebc1',
            backgroundColor: '#fdebc1',
            zIndex: 10,
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#716356'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fdebc1'}
          aria-label="Предыдущая новость"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M14 6L8 12L14 18" stroke="#675b53" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#fdebc1]" />
          </svg>
        </button>
        
        <button
          onClick={nextNews}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 transition-all items-center justify-center cursor-pointer group"
          style={{
            borderColor: '#fdebc1',
            backgroundColor: '#fdebc1',
            zIndex: 10,
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#716356'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fdebc1'}
          aria-label="Следующая новость"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M10 6L16 12L10 18" stroke="#675b53" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#fdebc1]" />
          </svg>
        </button>

        {/* Заголовок */}
        <div className="mb-8 md:mb-12 flex flex-col items-center justify-center">
          <h2 className="text-3xl md:text-5xl font-normal text-white uppercase text-center">
            НАШИ НОВОСТИ
          </h2>
        </div>

        {/* Мобильная версия - горизонтальный скролл пальцем */}
        <div className="md:hidden">
          <div ref={scrollContainerRef} className="mobile-news-scroll">
            {news.map((item) => (
              <div key={item.slug} className="mobile-news-card">
                <Link href={`/news/${item.slug}`} className="block w-full h-full rounded-3xl overflow-hidden hover:shadow-2xl transition-all hover:scale-[1.02] cursor-pointer text-left flex flex-col min-h-[420px]" style={{ backgroundColor: '#f5f5f0' }}>
                  <div className="relative aspect-video overflow-hidden flex-shrink-0">
                    <Image
                      src={getImageUrl(item.news_photo)}
                      alt={item.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-2xl text-sm font-medium text-white bg-[#619e5a]">
                      {formatDate(item.date)}
                    </div>
                  </div>
                  <div className="flex-1 p-5 flex flex-col">
                    <div className="flex-1 space-y-3">
                      <h3 className="text-lg font-bold leading-tight line-clamp-2" style={{ color: '#716356' }}>
                        {item.title}
                      </h3>
                      <p className="text-base leading-relaxed line-clamp-4" style={{ color: '#8b7f77' }}>
                        {item.excerpt}
                      </p>
                    </div>
                    <div className="pt-6 mt-auto">
                      <span className="font-medium hover:opacity-70 transition-opacity inline-flex items-center gap-1 text-base" style={{ color: '#716356' }}>
                        Читать далее →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Десктопная версия - карусель из 3 карточек */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {(() => {
            if (news.length === 0) return null;
            const prevIndex = (currentIndex - 1 + news.length) % news.length;
            const nextIndex = (currentIndex + 1) % news.length;
            const visibleIndices = [prevIndex, currentIndex, nextIndex];
            return visibleIndices.map((index) => {
              const item = news[index];
              return (
                <Link
                  key={item.slug}
                  href={`/news/${item.slug}`}
                  className="rounded-3xl overflow-hidden hover:shadow-2xl transition-all hover:scale-[1.02] cursor-pointer text-left"
                  style={{ backgroundColor: '#f5f5f0' }}
                >
                  <div className="relative">
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-2xl text-sm font-medium z-10 text-white" style={{ backgroundColor: '#619e5a' }}>
                      {formatDate(item.date)}
                    </div>
                    <div className="relative aspect-[4/3] bg-gray-200">
                      <Image
                        src={getImageUrl(item.news_photo)}
                        alt={item.title}
                        fill
                        className="object-cover"
                        loading={index === currentIndex ? "eager" : "lazy"}
                        priority={item.id === "1"}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </div>
                  <div className="p-5 md:p-6 space-y-3">
                    <h3 className="text-base md:text-lg font-bold leading-tight line-clamp-2" style={{ color: '#716356' }}>
                      {item.title}
                    </h3>
                    <p className="text-sm md:text-base leading-relaxed line-clamp-3" style={{ color: '#8b7f77' }}>
                      {item.excerpt}
                    </p>
                    <div className="font-medium hover:opacity-70 transition-opacity inline-flex items-center gap-1" style={{ color: '#716356' }}>
                      Читать далее →
                    </div>
                  </div>
                </Link>
              );
            });
          })()}
        </div>

        {/* Индикаторы */}
        <div className="flex justify-center gap-2 mt-8">
          {news.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                index === currentIndex
                  ? "w-8"
                  : "w-2 hover:bg-opacity-70"
              }`}
              style={{
                backgroundColor: index === currentIndex ? '#ffecc6' : 'rgba(255, 236, 198, 0.5)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}