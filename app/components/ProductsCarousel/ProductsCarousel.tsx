"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import styles from './ProductsCarousel.module.css';

interface Product {
  id?: string | number;
  title: string;
  subtitle?: string;
  description: string;
  ingredients?: string;
  weight?: number | string;
  // Поддерживаем Directus файл (id+filename_disk), строковый id и {url}
  product_photo?: { id: string; filename_disk: string } | { url: string } | string;
}

interface ProductsCarouselProps {
  initialProducts?: Product[];
}

export default function ProductsCarousel({ initialProducts = [] }: ProductsCarouselProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.smislest.ru';

  // Обновляем products только если пришли новые initialProducts
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  const getImageUrl = (product: Product) => {
    // API возвращает поле 'image', но старые данные могут иметь 'product_photo'
    if (!product) return "/lending/placeholder.jpg";
    const photo = (product as any).image || product.product_photo;
    if (!photo) return "/lending/placeholder.jpg";
    if (typeof photo === 'object') {
      // Сначала проверяем готовый URL
      if ('url' in photo && photo.url) return photo.url;
      // Затем проверяем filename_disk
      if ('filename_disk' in photo && photo.filename_disk) {
        return `${DIRECTUS_URL}/assets/${photo.filename_disk}`;
      }
      // Проверяем id файла
      if ('id' in photo && photo.id) {
        return `${DIRECTUS_URL}/assets/${photo.id}`;
      }
    }
    if (typeof photo === 'string') {
      return `${DIRECTUS_URL}/assets/${photo}`;
    }
    return "/lending/placeholder.jpg";
  };
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1280);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const dragContainerRef = useRef<HTMLDivElement>(null);
  const mobileScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Spring для центральной карточки
  const [centerSpring, centerApi] = useSpring(() => ({ 
    scale: isHoveringCard ? 1.02 : 1,
    opacity: 1,
    config: { tension: 300, friction: 30 }
  }));

  // Плавная навигация
  const animateToIndex = useCallback((newIndex: number) => {
    if (isAnimating || !products.length || newIndex === currentIndex) return;
    
    setIsAnimating(true);
    
    // Анимация исчезновения
    centerApi.start({
      scale: 0.95,
      opacity: 0.6,
      config: { tension: 400, friction: 30 }
    });
    
    // Меняем индекс с задержкой
    setTimeout(() => {
      setCurrentIndex(newIndex);
      
      // Анимация появления
      setTimeout(() => {
        centerApi.start({
          scale: 1,
          opacity: 1,
          config: { tension: 350, friction: 25 }
        });
        setIsAnimating(false);
      }, 50);
    }, 150);
  }, [isAnimating, products.length, currentIndex, centerApi]);

  const nextProduct = useCallback(() => {
    if (!products.length) return;
    const nextIndex = (currentIndex + 1) % products.length;
    animateToIndex(nextIndex);
  }, [currentIndex, products.length, animateToIndex]);

  const prevProduct = useCallback(() => {
    if (!products.length) return;
    const prevIndex = (currentIndex - 1 + products.length) % products.length;
    animateToIndex(prevIndex);
  }, [currentIndex, products.length, animateToIndex]);

  // Drag для десктопа - ПРАВИЛЬНАЯ РЕАЛИЗАЦИЯ
  const bindDrag = useDrag(({ 
    active, 
    movement: [mx], 
    direction: [dx], 
    velocity: [vx],
    last 
  }) => {
    if (active) {
      // Визуальная обратная связь при драге
      const dragProgress = Math.min(Math.abs(mx) / 100, 1);
      centerApi.start({
        scale: 1 - dragProgress * 0.03,
        opacity: 1 - dragProgress * 0.1,
        immediate: true
      });
    }
    
    if (last) {
      const shouldSwipe = Math.abs(mx) > 120 || vx > 0.5;
      
      if (shouldSwipe) {
        if (mx > 0) {
          prevProduct();
        } else {
          nextProduct();
        }
      }
      // Возвращаем в исходное состояние
      centerApi.start({
        scale: 1,
        opacity: 1,
        config: { tension: 350, friction: 40 }
      });
    }
  }, {
    axis: 'x',
    filterTaps: true,
    rubberband: 0.15,
  });


  // Сначала scrollToMobileIndex, чтобы не было обращения до объявления
  const scrollToMobileIndex = useCallback((index: number) => {
    if (!containerRef.current || !products.length) return;
    const container = containerRef.current;
    const card = container.querySelector('.' + styles.scrollSnapCard);
    const cardWidth = card ? (card as HTMLElement).offsetWidth : container.clientWidth;
    const gap = 16;
    container.scrollTo({
      left: index * (cardWidth + gap),
      behavior: 'smooth'
    });
    setMobileActiveIndex(index);
  }, [products.length, styles.scrollSnapCard]);

  // Убрали drag для мобильной версии - используем только scroll-snap

  // Мобильная версия - трекинг текущего индекса при скролле (throttled)
  const handleMobileScroll = useCallback(() => {
    if (!containerRef.current || !products.length) return;
    if (mobileScrollTimeoutRef.current) clearTimeout(mobileScrollTimeoutRef.current);
    mobileScrollTimeoutRef.current = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;
      const scrollLeft = container.scrollLeft;
      const card = container.querySelector('.' + styles.scrollSnapCard);
      const cardWidth = card ? (card as HTMLElement).offsetWidth : container.clientWidth;
      const gap = 16;
      const newIndex = Math.round(scrollLeft / (cardWidth + gap));
      if (newIndex >= 0 && newIndex < products.length && newIndex !== mobileActiveIndex) {
        setMobileActiveIndex(newIndex);
      }
    }, 150);
  }, [products.length, mobileActiveIndex, styles.scrollSnapCard]);

  const goToIndex = (index: number) => {
    animateToIndex(index);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleMobileScroll, { passive: true });
      return () => {
        container.removeEventListener('scroll', handleMobileScroll);
        if (mobileScrollTimeoutRef.current) clearTimeout(mobileScrollTimeoutRef.current);
      };
    }
  }, [handleMobileScroll]);

  // Отслеживаем текущую ширину вьюпорта, чтобы подсветка точек была единой
  useEffect(() => {
    const updateView = () => {
      setIsMobileView(window.innerWidth < 768);
      setContainerWidth(window.innerWidth);
    };
    updateView();
    window.addEventListener('resize', updateView);
    return () => window.removeEventListener('resize', updateView);
  }, []);

  // Обработка клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevProduct();
      if (e.key === 'ArrowRight') nextProduct();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevProduct, nextProduct]);

  // Обновляем анимацию при изменении состояния hover
  useEffect(() => {
    if (isHoveringCard) {
      centerApi.start({ scale: 1.02, config: { tension: 300, friction: 30 } });
    } else {
      centerApi.start({ scale: 1, config: { tension: 300, friction: 30 } });
    }
  }, [isHoveringCard, centerApi]);

  if (loading) {
    return <div className="w-full py-12 text-center text-xl text-[var(--smusl-heading)]">Загрузка продуктов...</div>;
  }
  
  if (!products.length) {
    return <div className="w-full py-12 text-center text-xl text-[var(--smusl-heading)]">Нет доступных продуктов</div>;
  }

  // Функция для получения видимых карточек
  const getVisibleCards = () => {
    const total = products.length;
    if (total === 0) return [];
    if (total <= 5) {
      // Для малого количества показываем все карточки
      return Array.from({ length: total }, (_, i) => i - Math.floor((total - 1) / 2));
    }
    // Для большого количества - фиксированное окно из 5 карточек
    return [-2, -1, 0, 1, 2];
  };

  // Адаптивные позиции — рассчитываем на основе ширины контейнера
  const getCardPosition = (offset: number) => {
    const step1 = Math.max(260, Math.min(containerWidth * 0.27, 340));
    const step2 = Math.max(420, Math.min(containerWidth * 0.42, 520));
    const positions: Record<number, { position: number; scale: number; opacity: number; zIndex: number }> = {
      '-2': { position: -step2, scale: 0.65, opacity: 0.4, zIndex: 20 },
      '-1': { position: -step1, scale: 0.85, opacity: 0.7, zIndex: 30 },
      '0':  { position: 0,      scale: 1.0,  opacity: 1.0, zIndex: 50 },
      '1':  { position: step1,  scale: 0.85, opacity: 0.7, zIndex: 30 },
      '2':  { position: step2,  scale: 0.65, opacity: 0.4, zIndex: 20 }
    };
    return positions[offset] || positions['0'];
  };

  return (
    <section id="products" className="w-full py-12 bg-[var(--smusl-page)]">
      <div className="mx-auto relative overflow-visible" style={{ maxWidth: 'calc(100% - 0px)' }}>
        {/* Навигация */}
        <div className="hidden md:block">
          <button
            onClick={prevProduct}
            className={`${styles.navButton} ${styles.navButtonPrev}`}
            aria-label="Предыдущий"
            disabled={isAnimating}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path 
                d="M14 6L8 12L14 18" 
                className={styles.navArrow}
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
          
          <button
            onClick={nextProduct}
            className={`${styles.navButton} ${styles.navButtonNext}`}
            aria-label="Следующий"
            disabled={isAnimating}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path 
                d="M10 6L16 12L10 18" 
                className={styles.navArrow}
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Градиент под каруселью */}
        <div className={styles.carouselBackground} />

        {/* Карусель */}
        <div className={styles.carouselWithBackground} style={{ overflow: 'visible' }}>
          {/* ДЕСКТОПНАЯ ВЕРСИЯ */}
          <div className="hidden md:flex items-center justify-center w-full h-[600px] relative" style={{ overflow: 'visible' }}>
            {/* Контейнер для drag */}
            <animated.div
              {...bindDrag()}
              ref={dragContainerRef}
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                cursor: isAnimating ? 'default' : 'grab',
                touchAction: 'pan-y',
                overflow: 'visible'
              }}
              className="z-10"
            >
              {/* Рендерим все карточки */}
              {getVisibleCards().map((offset) => {
                const index = (currentIndex + offset + products.length) % products.length;
                const product = products[index];
                
                if (!product) return null;
                
                const uniqueKey = `${product.id || product.title}-${offset}`;
                
                if (offset === 0) {
                  // ЦЕНТРАЛЬНАЯ КАРТОЧКА
                  return (
                    <animated.div
                      key={uniqueKey}
                      className={`${styles.activeCard} ${styles.centeredCard} hover:shadow-2xl transition-all`}
                      style={{
                        ...centerSpring,
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 50,
                      }}
                      onMouseEnter={() => {
                        setIsHoveringCard(true);
                        centerApi.start({ scale: 1.02, config: { tension: 300, friction: 30 } });
                      }}
                      onMouseLeave={() => {
                        setIsHoveringCard(false);
                        centerApi.start({ scale: 1, config: { tension: 300, friction: 30 } });
                      }}
                    >
                      <div className={styles.activeCardInner}>
                        <div className={styles.activeImageContainer}>
                          <Image
                            src={getImageUrl(product)}
                            alt={product.title}
                            fill
                            className={styles.activeImage}
                            sizes="432px"
                            priority
                            loading="eager"
                          />
                        </div>
                        
                        <div className={styles.glutenFreeIcon}>
                          <Image
                            src="/svg/gl_free.svg"
                            alt="Gluten Free"
                            fill
                            className="object-contain"
                            loading="lazy"
                          />
                        </div>
                        
                        <div className={styles.cardContent}>
                          <div className={styles.productHeader}>
                            <h3 className={styles.productTitle}>{product.title}</h3>
                            <div className={styles.productWeight}>
                              {product.weight}г
                            </div>
                          </div>
                          
                          <p className={styles.productSubtitle}>{product.subtitle}</p>
                          <p className={styles.productDescription}>{product.description}</p>
                          
                          <div className={styles.ingredients}>
                            <h4 className={styles.ingredientsTitle}>Состав:</h4>
                            <p className={styles.ingredientsText}>{product.ingredients}</p>
                          </div>
                        </div>
                      </div>
                    </animated.div>
                  );
                } else {
                  // БОКОВЫЕ КАРТОЧКИ
                  const { position, scale, opacity, zIndex } = getCardPosition(offset);
                  
                  return (
                    <div
                      key={uniqueKey}
                      className={`${styles.desktopOnly} ${styles.sideCard}`}
                      style={{
                        position: 'absolute',
                        left: `calc(50% + ${position}px)`,
                        top: '50%',
                        transform: `translateX(-50%) translateY(-50%) scale(${scale})`,
                        transformOrigin: 'center center',
                        opacity: opacity,
                        zIndex: zIndex,
                        cursor: 'pointer',
                        willChange: 'transform, opacity'
                      }}
                      onClick={() => offset < 0 ? prevProduct() : nextProduct()}
                    >
                      <div
                        style={{
                          position: 'relative',
                          width: Math.abs(offset) === 1 ? '260px' : '180px',
                          height: Math.abs(offset) === 1 ? '220px' : '140px',
                        }}
                      >
                        <Image
                          src={getImageUrl(product)}
                          alt={product.title}
                          fill
                          className="object-contain drop-shadow-xl"
                          sizes="(max-width: 768px) 100vw, 260px"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  );
                }
              })}
            </animated.div>
          </div>
          
          {/* МОБИЛЬНАЯ ВЕРСИЯ */}
          <div
            ref={containerRef}
            className={`${styles.scrollSnapContainer} md:hidden`}
          >
            {products.map((product, index) => (
              <div key={product.id || product.title} className={`${styles.scrollSnapCard}`}>
                <div className={`${styles.mobileCard} hover:shadow-2xl transition-all`}>
                  <div className={styles.mobileImageWrapper}>
                    <Image
                      src={getImageUrl(product)}
                      alt={product.title}
                      width={308}
                      height={220}
                      className={styles.mobileImage}
                      loading={index === mobileActiveIndex ? "eager" : "lazy"}
                    />
                  </div>
                  <div className={styles.mobileIcon}>
                    <Image
                      src="/svg/gl_free.svg"
                      alt="Gluten Free"
                      width={56}
                      height={56}
                      className="object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.mobileContent}>
                    <div className={styles.mobileHeader}>
                      <h3 className={styles.mobileTitle}>{product.title}</h3>
                      <div className={styles.mobileWeight}>{product.weight}г</div>
                    </div>
                    <p className={styles.mobileSubtitle}>{product.subtitle}</p>
                    <p className={styles.mobileDescription}>{product.description}</p>
                    <div className={styles.mobileIngredients}>
                      <h4 className={styles.mobileIngredientsTitle}>Состав:</h4>
                      <p className={styles.mobileIngredientsText}>{product.ingredients}</p>
                    </div>
                  </div>
                </div> 
              </div> 
            ))}
          </div>
        </div>
        
        {/* Индикаторы */}
        <div className="flex justify-center gap-2 mt-8">
          {products.map((_, index) => {
            const activeIndex = isMobileView ? mobileActiveIndex : currentIndex;
            const isActive = activeIndex === index;
            
            return (
              <button
                key={index}
                onClick={() => {
                  if (isMobileView) {
                    scrollToMobileIndex(index);
                  } else {
                    goToIndex(index);
                  }
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-[var(--smusl-cream)] scale-110'
                    : 'bg-[var(--smusl-cream)] opacity-40 hover:opacity-70'
                }`}
                aria-label={`Продукт ${index + 1}`}
                disabled={isAnimating}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}