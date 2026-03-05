import LandingHeader from '@/components/LandingHeader';
import LandingHero from '@/components/LandingHero';
import LandingAbout from '@/components/LandingAbout';
import LandingProducts from '@/components/LandingProducts';
import LandingNews from '@/components/LandingNews';
import LandingFooter from '@/components/LandingFooter';

export default function RootPage() {
 return (
  <main className="min-h-screen">
   <LandingHeader />
   <LandingHero />
   <LandingAbout />
   <LandingProducts />
   <LandingNews />
   <LandingFooter />
  </main>
 );
}
