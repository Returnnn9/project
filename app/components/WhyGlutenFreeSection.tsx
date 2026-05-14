"use client";

import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

interface Benefit {
  id?: string | number;
  title: string;
  description: string;
  icon: string;
}

export default function WhyGlutenFreeSection() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Map icon names to SVG components
  const iconMap: Record<string, ReactElement> = {
    heart: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    "check-circle": (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    smile: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    users: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  };

  // Статичный список причин (используется ниже в рендере)
  const reasons: string[] = [
    'Снижение воспаления и улучшение самочувствия',
    'Подходит людям с целиакией и непереносимостью глютена',
    'Контроль качества сырья и отсутствие консервантов',
    'Осознанное питание и поддержка здорового образа жизни',
  ];

  useEffect(() => {
    const fetchBenefits = async () => {
      try {
        const response = await fetch('/api/why-gluten-free');
        if (response.ok) {
          const data = await response.json();
          setBenefits(Array.isArray(data) ? data : []);
        } else {
          // Fallback to hardcoded data
          setBenefits([
            {
              icon: "heart",
              title: "Для здоровья",
              description: "Безглютеновое питание помогает улучшить пищеварение, снизить воспаление и повысить уровень энергии"
            },
            {
              icon: "check-circle",
              title: "100% натурально",
              description: "Используем только качественные натуральные ингредиенты без искусственных добавок и консервантов"
            },
            {
              icon: "smile",
              title: "Вкусно",
              description: "Доказываем, что безглютеновая выпечка может быть не только полезной, но и невероятно вкусной"
            },
            {
              icon: "users",
              title: "Для всех",
              description: "Наша выпечка подходит людям с целиакией, непереносимостью глютена и тем, кто выбирает осознанное питание"
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching benefits:', error);
        setBenefits([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBenefits();
  }, []);

  return (
    <section id="why-gluten-free" className="w-full py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        {/* Заголовок */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-[var(--smusl-sage)] mb-6">
            Почему безглютеновая выпечка?
          </h2>
          <p className="text-xl text-[var(--smusl-cream)] max-w-3xl mx-auto">
            Мы создаём полезную и вкусную выпечку для тех, кто заботится о своём здоровье и выбирает осознанное питание
          </p>
        </div>

               {/* Преимущества - карочки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.length > 0 ? (
            benefits.map((benefit, index) => (
              <div
                key={benefit.id || index}
                className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-white/10"
              >
                <div className="text-[var(--smusl-cream)] mb-4">
                  {iconMap[benefit.icon as keyof typeof iconMap] || iconMap.heart}
                </div>
                <h3 className="text-xl font-bold text-[var(--smusl-sage)] mb-3">
                  {benefit.title}
                </h3>
                <p className="text-[var(--smusl-cream)] leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-[var(--smusl-cream)]">
              {isLoading ? 'Загрузка...' : 'Данные недоступны'}
            </div>
          )}
        </div>
        {/* Код продолжается дальше... */}

        {/* Причины - список */}
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-white/10">
          <h3 className="text-2xl md:text-3xl font-bold text-[var(--smusl-sage)] mb-8 text-center">
            Польза безглютенового питания
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {reasons.map((reason, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-[var(--smusl-cream)] rounded-full flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-[var(--smusl-espresso)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[var(--smusl-cream)] leading-relaxed flex-1">
                  {reason}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/10">
            <h3 className="text-2xl font-bold text-[var(--smusl-sage)] mb-4">
              Качество и контроль
            </h3>
            <p className="text-[var(--smusl-cream)] leading-relaxed mb-6">
              Мы тщательно контролируем качество на всех этапах производства. Используем только 
              сертифицированное безглютеновое сырьё и следим за тем, чтобы наша выпечка была 
              безопасной для людей с целиакией и непереносимостью глютена.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-[var(--smusl-cream)]">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--smusl-sage)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Без глютена</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--smusl-sage)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Без консервантов</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--smusl-sage)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Натуральные ингредиенты</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 flex justify-center">
          <a
            href="/#products"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[var(--smusl-cream)] text-[var(--smusl-espresso)] font-semibold shadow-lg hover:opacity-90 transition-colors"
          >
            В каталог
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
