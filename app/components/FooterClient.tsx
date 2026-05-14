"use client";
import Footer from "./Footer";
import type { SiteSettings } from '../../lib/siteSettingsData';

interface FooterClientProps {
  showMapOnMobile?: boolean;
  seoData?: SiteSettings | null;
}

export default function FooterClient({ showMapOnMobile = false, seoData }: FooterClientProps) {
  return <Footer showMapOnMobile={showMapOnMobile} seoData={seoData} />;
}
