import type { Metadata } from "next";
import { Manrope, Great_Vibes, Montserrat } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/store/StoreProvider";
import { Providers } from "@/components/Providers";
import dynamic from "next/dynamic";
const LoginModal = dynamic(() => import("@/components/LoginModal"));
const AddressModal = dynamic(() => import("@/components/AddressModal"));

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
 metadataBase: new URL("https://smuslest.ru"),
 title: {
  template: "%s | СМЫСЛ ЕСТЬ",
  default: "СМЫСЛ ЕСТЬ - Доставка еды",
 },
 description: "Закажите вкусную еду с быстрой доставкой в сервисе СМЫСЛ ЕСТЬ. Огромный выбор блюд, свежие ингредиенты и превосходный сервис.",
 keywords: ["доставка еды", "заказ еды", "смысл есть", "десерты", "выпечка", "еда на дом", "быстрая доставка"],
 authors: [{ name: "СМЫСЛ ЕСТЬ Team" }],
 manifest: "/manifest.json",
 openGraph: {
  title: "СМЫСЛ ЕСТЬ - Доставка еды",
  description: "Закажите вкусную еду с быстрой доставкой в сервисе СМЫСЛ ЕСТЬ. Огромный выбор блюд и превосходный сервис.",
  url: "https://smuslest.ru",
  siteName: "СМЫСЛ ЕСТЬ",
  images: [
   {
    url: "/photo/logo.png",
    width: 800,
    height: 600,
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
  <html lang="ru" className={`${manrope.variable} ${greatVibes.variable}`}>
   <body className="antialiased font-manrope bg-[#FDF8ED]">

    <Providers>
     <StoreProvider>
      {children}
      <LoginModal />
      <AddressModal />
     </StoreProvider>
    </Providers>
   </body>
  </html>
 );
}
