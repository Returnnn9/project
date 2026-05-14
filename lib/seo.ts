export interface SeoSettings {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

export async function getSeoSettings(): Promise<SeoSettings> {
  return {
    title: "Смысл есть - Безглютеновая пекарня в Москве",
    description: "Свежий хлеб и изысканные десерты без глютена.",
    keywords: "пекарня, без глютена, хлеб, десерты, москва",
  };
}
