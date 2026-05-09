import type { Metadata } from "next";
import { Manrope, Great_Vibes, Montserrat } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/store/StoreProvider";
import { Providers } from "@/components/Providers";
import GlobalModals from "@/components/GlobalModals";

const manrope = Manrope({
 subsets: ["latin", "cyrillic"],
 variable: "--font-manrope",
 display: "swap",
 weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const montserrat = Montserrat({
 subsets: ["latin", "cyrillic"],
 variable: "--font-montserrat",
 weight: ["300", "400", "500", "600", "700", "800", "900"],
 display: "swap",
});

const greatVibes = Great_Vibes({
 subsets: ["latin", "cyrillic"],
 variable: "--font-great-vibes",
 weight: "400",
 display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://smislest.ru"),
  title: {
    template: "%s | СМЫСЛ ЕСТЬ",
    default: "СМЫСЛ ЕСТЬ — Доставка настоящих десертов и выпечки",
  },
  description: "Почувствуйте истинный вкус в каждом кусочке. Авторские десерты, свежая выпечка и хлеб с быстрой доставкой от сервиса СМЫСЛ ЕСТЬ. Натуральные ингредиенты и премиальный сервис.",
  keywords: ["доставка еды", "авторские десерты", "смысл есть", "выпечка москва", "купить торт", "свежий хлеб", "премиальная доставка"],
  authors: [{ name: "Smusl Team" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-512x512.png",
    apple: "/icons/icon-512x512.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "СМЫСЛ ЕСТЬ — Искусство вкуса в доставке",
    description: "Авторская выпечка и десерты, которые меняют представление о доставке. Почувствуйте разницу вместе с СМЫСЛ ЕСТЬ.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://smislest.ru",
    siteName: "СМЫСЛ ЕСТЬ",
    images: [
      {
        url: "/photo/logo.png",
        width: 1200,
        height: 630,
        alt: "СМЫСЛ ЕСТЬ — Логотип",
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
};

import { Viewport } from 'next';
export const viewport: Viewport = {
 themeColor: "#FDF8ED",
 width: "device-width",
 initialScale: 1,
 maximumScale: 1,
 viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
  <html lang="ru" className={`${manrope.variable} ${greatVibes.variable} ${montserrat.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
   <body className="antialiased font-manrope bg-[#FDF8ED]">

    <Providers>
     <StoreProvider>
      {children}
      <GlobalModals />
     </StoreProvider>
    </Providers>
   </body>
  </html>
 );
}
