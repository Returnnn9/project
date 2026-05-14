export interface SiteSettings {
  social_instagram?: string;
  social_telegram?: string;
  social_vk?: string;
  business_phone?: string;
  business_email?: string;
  business_address?: string;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return {
    social_instagram: 'https://instagram.com/smyslest',
    social_telegram: 'https://t.me/smyslest',
    social_vk: 'https://vk.com/smislest',
    business_phone: '+7-999-123-45-67',
    business_email: 'info@smysl-est.ru',
    business_address: '111675, Россия, г. Москва, ул. Святоозерская, дом 8',
  };
}
