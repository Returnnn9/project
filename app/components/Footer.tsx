import { FaInstagram, FaVk, FaTelegramPlane, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import Image from "./Image";
import type { SiteSettings } from '../../lib/siteSettingsData';
import footerData from "../../content/footer.json";

type FooterLink = { label: string; href: string };
type FooterData = { text: string; links?: FooterLink[] };

interface FooterProps {
  showMapOnMobile?: boolean;
  seoData?: SiteSettings | null;
}

export default function Footer({ showMapOnMobile = false, seoData }: FooterProps) {
  const footer: FooterData = footerData as FooterData;
  
  // Если SEO данные не переданы, используем fallback (не вызываем getSeoSettings повторно)
  const seo = seoData || {
    social_instagram: 'https://instagram.com/smyslest',
    social_telegram: 'https://t.me/smyslest',
    social_vk: 'https://vk.com/smislest',
    business_phone: '+7-999-123-45-67',
    business_email: 'info@smysl-est.ru',
    business_address: '111675, Россия, г. Москва, ул. Святоозерская, дом 8',
  } as SiteSettings;
  return (
    <footer id="contacts" className="w-full py-16" style={{ backgroundColor: "var(--smusl-espresso)" }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Логотип и иконки */}
          <div>
            <div className="mb-6">
              <Image src="/lending/logo.png" alt="СМЫСЛ есть" className="brightness-0 invert opacity-95" style={{ height: '64px', width: 'auto' }} width={160} height={64} />
            </div>
            <div className="flex gap-4">
              {seo.social_instagram && (
                <a
                  href={seo.social_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:bg-opacity-80 transition-all text-2xl"
                  style={{ borderColor: "var(--smusl-gold)", color: "var(--smusl-gold)" }}
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>
              )}
              {seo.social_vk && (
                <a
                  href={seo.social_vk}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:bg-opacity-80 transition-all text-2xl"
                  style={{ borderColor: "var(--smusl-gold)", color: "var(--smusl-gold)" }}
                  aria-label="VK"
                >
                  <FaVk />
                </a>
              )}
              {seo.social_telegram && (
                <a
                  href={seo.social_telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:bg-opacity-80 transition-all text-2xl"
                  style={{ borderColor: "var(--smusl-gold)", color: "var(--smusl-gold)" }}
                  aria-label="Telegram"
                >
                  <FaTelegramPlane />
                </a>
              )}
            </div>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--smusl-sage)" }}>Телефон и почта</h3>
            <div className="space-y-3 text-white">
              {seo.business_phone && (
                <a
                  href={`tel:${seo.business_phone.replace(/[^\d+]/g, "")}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-colors"
                >
                  <FaPhoneAlt className="text-lg" /> {seo.business_phone}
                </a>
              )}
              {seo.business_email && (
                <a
                  href={`mailto:${seo.business_email}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-colors"
                >
                  <FaEnvelope className="text-lg" /> {seo.business_email}
                </a>
              )}
            </div>
          </div>

          {/* Адрес */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--smusl-sage)" }}>Адрес</h3>
            <address className="not-italic space-y-2 text-white">
              <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-lg" /> {seo.business_address}</p>
            </address>
          </div>

          {/* Покупателям */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--smusl-sage)" }}>Покупателям</h3>
            <ul className="space-y-2 text-white">
              <li>
                <a
                  href="/why-gluten-free"
                  className="hover:opacity-80 transition-colors"
                >
                  Почему без глютена
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className="hover:opacity-80 transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="hover:opacity-80 transition-colors"
                >
                  Статьи
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Карта Яндекса */}
        <div className={`rounded-2xl overflow-hidden mt-8 ${showMapOnMobile ? '' : 'hidden md:block'}`} style={{ height: '400px' }}>
          <iframe
            src="https://yandex.ru/map-widget/v1/?um=constructor%3Aa1b0899bfd294471a0bb5d91ac1e5b3c1c68111a48c26b2d2cdad140c84908ff&source=constructor"
            width="100%"
            height="400"
            style={{ border: 0, width: '100%', height: '400px', display: 'block' }}
            allowFullScreen={true}
            title="Карта Яндекса"
          ></iframe>
        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white opacity-70 pt-8 border-t text-xs md:text-sm" style={{ borderColor: 'rgba(255, 236, 198, 0.2)' }}>
          <div>
            {footer.text}
          </div>
          <div className="flex gap-4">
            {(footer.links || []).map((link) => (
              <a key={link.href} href={link.href} className="underline hover:opacity-80 transition-colors">{link.label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
