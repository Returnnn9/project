import dynamic from "next/dynamic";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import FooterClient from "./components/FooterClient";
import { getNewsData } from '../lib/newsData';
import { getProductsData } from '../lib/productsData';
import { getHeroData } from '../lib/heroData';
import { getSiteSettings } from '../lib/siteSettingsData';
import ScrollingIcons from "./components/ScrollingIcons";

const ProductsSection = dynamic(() => import("./components/ProductsSection").then(m => m.default), {
 loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
 ssr: true,
});

const AboutSectionClient = dynamic(() => import("./components/AboutSectionClient"), {
 loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
 ssr: true,
});

const NewsSection = dynamic(() => import("./components/NewsSection"), {
 loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
 ssr: true,
});

const HeartSection = dynamic(() => import("./components/HeartSection").then(m => m.default), {
 loading: () => <div className="h-64 bg-gray-100 animate-pulse" />,
 ssr: true,
});

export default async function Home() {
 const [newsData, productsData, heroData, seoData] = await Promise.all([
  getNewsData().catch(() => []),
  getProductsData().catch(() => []),
  getHeroData().catch(() => null),
  getSiteSettings(),
 ]);

 return (
  <>
   <Header />
   <main style={{ backgroundColor: '#93a88f', overflowX: 'hidden', width: '100%' }}>
    <HeroSection initialData={heroData} />
    <ScrollingIcons />
    <ProductsSection initialProducts={productsData} />
    <AboutSectionClient />
    <NewsSection initialNews={newsData} />
    <HeartSection />
   </main>
   <FooterClient showMapOnMobile={true} seoData={seoData as any} />
  </>
 );
}
