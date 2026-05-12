/**
 * Централизованные контактные данные компании.
 * Изменяй ТОЛЬКО ЗДЕСЬ — обновится везде автоматически.
 */

export const CONTACT = {
  phone: {
    /** Отображаемый формат */
    display: "+7 (926) 210-45-65",
    /** Формат для href="tel:..." */
    tel: "tel:+79262104565",
  },
  email: {
    display: "info@smislest.ru",
    mailto: "mailto:info@smislest.ru",
  },
  address: {
    display: "Россия, г. Москва, ул. Ижорская 3",
    city: "Москва",
  },
  hours: "10:00 - 19:00",
  siteName: "СМЫСЛ ЕСТЬ",
  domain: "smislest.ru",
} as const;
