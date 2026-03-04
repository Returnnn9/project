import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/store/AppContext";

const montserrat = Montserrat({
 subsets: ["latin", "cyrillic"],
 variable: "--font-montserrat",
 display: "swap",
 weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
 title: "СМЫСЛ ЕСТЬ — Artisanal Bakery",
 description: "Crafted with soul. Fresh breads and pastries delivered to your door.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
  <html lang="ru" className={`${montserrat.variable}`}>
   <body className="antialiased font-montserrat bg-[#FDF8ED]">
    <AppProvider>
     {children}
    </AppProvider>
   </body>
  </html>
 );
}
