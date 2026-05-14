export type HeaderMenuItem = { label: string; href: string };

export type HeaderData = {
  menu?: HeaderMenuItem[];
  phone?: string;
  email?: string;
  address?: string;
  instagram?: string;
  vkontakte?: string;
  telegram?: string;
};

/** Статические данные по умолчанию (как на smislest.ru), пока нет CMS */
export const DEFAULT_HEADER_DATA: HeaderData = {
  phone: "+7 926 210 45-65",
  email: "info@smislest.ru",
  address: "Россия, г. Москва, ул. Ижорская 3",
  instagram: "https://www.instagram.com/smislest/",
  vkontakte: "https://vk.com/smislest",
  telegram: "https://t.me/smislest",
  menu: [
    { label: "Наша выпечка", href: "/#products" },
    { label: "О нас", href: "/#about" },
    { label: "Новости", href: "/#news" },
    { label: "Контакты", href: "/#contacts" },
    { label: "FAQ", href: "/#faq" },
  ],
};

export async function getHeaderData(): Promise<HeaderData> {
  return { ...DEFAULT_HEADER_DATA };
}
