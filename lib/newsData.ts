export interface NewsImage {
  id: string;
  filename_disk: string;
  url?: string;
}

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  content: string;
  news_photo: NewsImage | null;
}

export async function getNewsData(): Promise<NewsItem[]> {
  return [
    {
      id: "1",
      slug: "teff-superfood",
      title: "Тефф — «суперфуд» из Африки: почему этот злак становится основой безглютеновой выпечки?",
      excerpt:
        "Рисовая мука, кукурузная, гречневая — привычный набор для безглютеновой выпечки. Но в последние годы в этом списке всё чаще появляется тефф — мелкий эфиопский злак, о котором в России пока мало кто слышал.",
      date: "2026-02-24",
      content: "",
      news_photo: { id: "n1", filename_disk: "news1.jpg", url: "/lending/news1.jpg" },
    },
    {
      id: "2",
      slug: "technology-psyllium",
      title: "Технология безглютеновой выпечки: зачем нужны псиллиум, ксантан и точная гидратация.",
      excerpt:
        "Как устроена технология безглютеновой выпечки изнутри: зачем нужны псиллиум и ксантановая камедь, почему гидратация решает всё и чем безглютеновое тесто принципиально отличается от пшеничного.",
      date: "2026-02-23",
      content: "",
      news_photo: { id: "n2", filename_disk: "news2.jpg", url: "/lending/news2.jpg" },
    },
    {
      id: "3",
      slug: "myths-gluten-free-bread",
      title: "Мифы о безглютеновом хлебе: почему он может быть вкусным и полезным",
      excerpt:
        "Разбираем популярные мифы о безглютеновом хлебе: невкусный, бесполезный, только для больных. Что из этого правда, а что — устаревшие стереотипы.",
      date: "2026-02-11",
      content: "",
      news_photo: { id: "n3", filename_disk: "news3.jpg", url: "/lending/news3.jpg" },
    },
    {
      id: "4",
      slug: "production-safety",
      title: "Безопасность безглютенового производства: как исключить перекрёстное загрязнение",
      excerpt:
        "Что такое перекрёстное загрязнение глютеном, почему оно опасно при целиакии и как устроено по-настоящему безопасное безглютеновое производство.",
      date: "2026-02-03",
      content: "",
      news_photo: { id: "n4", filename_disk: "news1.jpg", url: "/lending/news1.jpg" },
    },
  ];
}
