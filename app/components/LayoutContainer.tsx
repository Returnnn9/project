"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Header from "./Header";

export default function LayoutContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isNewsPage = pathname?.startsWith('/news');
  const isPrivacyPage = pathname?.startsWith('/privacy');
  const isContactsPage = pathname?.startsWith('/contacts');
  const isWhyGlutenFreePage = pathname?.startsWith('/why-gluten-free');
  const isBlogPage = pathname?.startsWith('/blog');
  const isFAQPage = pathname?.startsWith('/faq');
  const isPresentationPage = pathname?.startsWith('/presentation');
  // Новости теперь используют тёмный фон, как FAQ/Contacts
  const hasWhiteBackground = false;

  const backgroundClass = hasWhiteBackground
    ? 'bg-white'
    : (isContactsPage || isWhyGlutenFreePage || isBlogPage || isFAQPage || isPrivacyPage || isNewsPage || isPresentationPage)
      ? ''
      : "bg-gradient-to-b from-smusl-sage via-smusl-sage-deep to-smusl-taupe";

  // Обработка якоря при загрузке страницы
  useEffect(() => {
    // Получаем якорь из URL (например, из "/#products" или "?anchor=products")
    const hash = window.location.hash;
    const anchor = hash ? hash.substring(1) : null;

    if (anchor) {
      // Небольшая задержка, чтобы DOM полностью загрузился
      setTimeout(() => {
        const element = document.getElementById(anchor);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [pathname]);

  return (
    <div
      className={`min-h-screen overflow-x-hidden ${backgroundClass}`}
      style={(isContactsPage || isWhyGlutenFreePage || isBlogPage || isFAQPage || isPrivacyPage || isNewsPage || isPresentationPage) ? { backgroundColor: "var(--smusl-espresso)" } : undefined}
    >
      <Header />
      <main
        className="w-full mx-auto"
        style={{
          paddingTop: 'clamp(80px, 10vw, 140px)',
          paddingInline: 0,
          maxWidth: 'var(--page-max-width, 100%)',
        }}
      >
        {children}
      </main>
    </div>
  );
}