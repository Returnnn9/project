"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";
import { getHeaderData, DEFAULT_HEADER_DATA, type HeaderData } from '../../lib/headerData';
import Open2026 from "./Open2026";

function TextBrandLogo({ compact }: { compact?: boolean }) {
  return (
    <div className={compact ? styles.textBrandCompact : styles.textBrand}>
      <span className={styles.textBrandMain}>СМЫСЛ</span>
      <span className={styles.textBrandScript}>есть</span>
    </div>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [header, setHeader] = useState<HeaderData | null>(null);
  const menuGlyphSrc = "/images/Logoo.png";
  const pathname = usePathname();
  const data = header ?? DEFAULT_HEADER_DATA;

  const defaultMenu: NonNullable<HeaderData["menu"]> = DEFAULT_HEADER_DATA.menu ?? [];

  useEffect(() => {
    getHeaderData().then(setHeader).catch(() => {
      setHeader(DEFAULT_HEADER_DATA);
    });
  }, []);

  const socials = [
    {
      key: "instagram",
      label: "Instagram",
      viewBox: "0 0 24 24",
      path: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z",
      stroke: false,
    },
    {
      key: "vkontakte",
      label: "VK",
      viewBox: "0 0 24 24",
      path: "M12.785 16.241s.288-.032.436-.189c.136-.144.131-.415.131-.415s-.019-1.266.57-1.453c.581-.184 1.327 1.223 2.118 1.763.598.408 1.052.318 1.052.318l2.113-.029s1.105-.068.581-.936c-.043-.071-.307-.646-1.577-1.829-1.33-1.238-1.151-1.037.45-3.176.974-1.302 1.363-2.095 1.241-2.434-.116-.323-.833-.238-.833-.238l-2.379.015s-.177-.024-.308.054c-.128.077-.21.256-.21.256s-.376.999-.877 1.85c-1.057 1.793-1.48 1.889-1.653 1.776-.402-.262-.302-1.051-.302-1.612 0-1.753.265-2.484-.517-2.673-.26-.063-.452-.104-1.117-.111-.854-.009-1.577.003-1.986.203-.272.133-.482.43-.354.447.158.022.516.097.706.355.245.334.236 1.083.236 1.083s.141 2.064-.329 2.32c-.323.176-.766-.183-1.717-1.821-.487-.839-.855-1.766-.855-1.766s-.071-.174-.198-.267c-.154-.113-.37-.149-.37-.149l-2.26.014s-.34.01-.465.157c-.111.131-.009.402-.009.402s1.765 4.127 3.764 6.206c1.833 1.907 3.914 1.781 3.914 1.781h.945z",
      stroke: false,
    },
    {
      key: "telegram",
      label: "Telegram",
      viewBox: "0 0 24 24",
      path: "M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z",
      stroke: false,
    },
  ];

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    
    // Если на главной странице
    if (pathname === '/') {
      // Извлекаем якорь (например, из "/#products" берём "products")
      const anchor = href.startsWith('/#') ? href.slice(2) : null;
      if (anchor) {
        const element = document.getElementById(anchor);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
    // Если на другой странице - просто переходим по ссылке (Next.js обработает)
  };

  return (
    <header className={styles.header}>
      {/* МОБИЛЬНАЯ ВЕРСИЯ */}
      <div className={styles.mobileContainer}>
        <div className={styles.mobileEllipse}>
          <div className={styles.mobileBar}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={styles.mobileMenuButton}
              aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
            >
              <span className={styles.menuIconBox}>
                <img src={menuGlyphSrc} alt="" width={32} height={32} className={styles.menuGlyphImg} />
              </span>
              <span className={styles.mobileMenuLabel}>МЕНЮ</span>
            </button>

            <Link href="/" className={styles.mobileLogoLink} aria-label="На главную">
              <TextBrandLogo compact />
            </Link>

            <div className={styles.mobileBarSpacer} aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* ДЕСКТОПНАЯ ВЕРСИЯ */}
      <div className={styles.desktopContainer}>
        {/* Floating Ribbon overlaying the top right of viewport */}
        {!isMenuOpen && (
          <div className={styles.desktopRibbonFloating}>
            <Open2026 className={styles.open2026RibbonFloatingImg} />
          </div>
        )}

        <div className={styles.desktopEllipse}>
          <div className={styles.desktopBar}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={styles.desktopMenuButton}
              aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
            >
              <span className={styles.menuIconBox}>
                {isMenuOpen ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.menuCloseGlyph}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <img src={menuGlyphSrc} alt="" width={44} height={44} className={styles.menuGlyphImg} />
                )}
              </span>
              <span className={styles.desktopMenuText}>МЕНЮ</span>
            </button>

            <Link href="/" className={styles.desktopLogoLink} aria-label="На главную">
              <TextBrandLogo />
            </Link>

            {/* Spacer to maintain grid columns without being clipped */}
            <div className={styles.desktopBarSpacer} aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* ПОЛНОЭКРАННОЕ МЕНЮ */}
      <div className={`${styles.fullscreenMenu} ${isMenuOpen ? styles.open : ''}`}>
        <div className={styles.menuPanel}>
          <div className={styles.menuContent}>
            <div className={styles.menuHeader}>
              <button
                onClick={() => setIsMenuOpen(false)}
                className={styles.menuCloseButton}
                aria-label="Закрыть меню"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className={styles.menuLogo}>
                <TextBrandLogo />
              </div>
            </div>

            <nav className={styles.menuNav}>
              {(data.menu && data.menu.length > 0 ? data.menu : defaultMenu).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={styles.menuNavLink}
                  onClick={() => handleNavClick(item.href)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className={styles.menuFooter}>
              <div className={styles.socialIcons}>
                {socials.map((s) => {
                  const socialUrl = (data[s.key as keyof HeaderData] as string) || "#";
                  return (
                    <Link key={s.key} href={socialUrl} className={styles.socialIcon} aria-label={s.label} target="_blank">
                      <svg viewBox={s.viewBox} width={36} height={36} aria-hidden="true" focusable="false" fill="currentColor">
                        <path d={s.path} />
                      </svg>
                    </Link>
                  );
                })}
              </div>

              <div className={styles.contactsRow}>
                <div className={styles.contactLine}>
                  <span className={styles.contactIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <a href={`tel:${String(data.phone || "").replace(/\s/g, "")}`} className={styles.phone}>{data.phone || "+7 926 210 45-65"}</a>
                </div>

                <div className={styles.contactLine}>
                  <span className={styles.contactIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
                    </svg>
                  </span>
                  <a href={`mailto:${data.email || ""}`} className={styles.phone}>{data.email || "info@smislest.ru"}</a>
                </div>

                {/* Адрес убран из мобильного меню по запросу */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
