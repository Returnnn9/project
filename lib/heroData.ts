export interface HeroData {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  image?: string;
  imageAlt?: string;
}

export async function getHeroData(): Promise<HeroData | null> {
  return {
    title: "Безглютеновый хлеб и десерты в Москве!",
    subtitle:
      "Мы стремимся к тому, чтобы питание стало осознанным, понятным и по-настоящему вкусным — без компромиссов между пользой и удовольствием.",
    ctaText: "Посмотреть каталог",
    ctaLink: "/market",
    image: "/lending/heart.png",
    imageAlt: "Хлеб в форме сердца",
  };
}
