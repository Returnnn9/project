import type { Metadata } from "next";
import { Manrope, Great_Vibes } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/store/AppContext";
import { Providers } from "@/components/Providers";
import LoginModal from "@/components/LoginModal";

const manrope = Manrope({
 subsets: ["latin", "cyrillic"],
 variable: "--font-manrope",
 display: "swap",
 weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const greatVibes = Great_Vibes({
 subsets: ["latin", "cyrillic"],
 variable: "--font-great-vibes",
 weight: "400",
 display: "swap",
});

export const metadata: Metadata = {
 title: "СМЫСЛ ЕСТЬ — Artisanal Bakery",
 description: "Crafted with soul. Fresh breads and pastries delivered to your door.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
  <html lang="ru" className={`${manrope.variable} ${greatVibes.variable}`}>
   <body className="antialiased font-manrope bg-[#FDF8ED]">

    <Providers>
     <AppProvider>
      {children}
      <LoginModal />
     </AppProvider>
    </Providers>
   </body>
  </html>
 );
}
