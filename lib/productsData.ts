export interface Product {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  ingredients?: string;
  weight?: number | string;
  product_photo?: { id: string; filename_disk: string } | { url: string } | string;
  price?: string;
}

export async function getProductsData(): Promise<Product[]> {
  return [
    {
      id: "1",
      title: "Соломка из тефовой муки",
      subtitle: "с кунжутом",
      description: "Хрустящая безглютеновая закуска.",
      ingredients: "Тефовая мука, кунжут, вода, соль, оливковое масло.",
      weight: "300",
      product_photo: { url: "/lending/1.png" },
      price: "",
    },
    {
      id: "2",
      title: "Хлеб Тартин",
      subtitle: "Из муки сорго и пшённой муки",
      description: "Плотный безглютеновый хлеб.",
      ingredients: "Мука сорго, пшённая мука, дрожжи, соль, вода.",
      weight: "500",
      product_photo: { url: "/lending/2.png" },
      price: "",
    },
    {
      id: "3",
      title: "Багет томатный",
      subtitle: "из пшенной и рисовой муки",
      description: "Безглютеновый, с лёгким вкусом томатов.",
      ingredients: "Пшённая мука, рисовая мука, томатная паста, дрожжи, соль, оливковое масло.",
      weight: "300",
      product_photo: { url: "/lending/4.png" },
      price: "",
    },
    {
      id: "4",
      title: "Бородинский хлеб",
      subtitle: "из теффовой муки",
      description: "Безглютеновый аналог с тёмным цветом и насыщенным вкусом.",
      ingredients: "Теффовая мука, гречневая мука, патока, кориандр, дрожжи, соль.",
      weight: "500",
      product_photo: { url: "/lending/5.png" },
      price: "",
    },
    {
      id: "5",
      title: "Булки для бургеров",
      subtitle: "из рисовой муки",
      description: "Пышные безглютеновые булочки.",
      ingredients: "Рисовая мука, дрожжи, соль, яйцо (или аналог), сахар.",
      weight: "150",
      product_photo: { url: "/lending/6.png" },
      price: "",
    },
    {
      id: "6",
      title: "Парбеки для пиццы",
      subtitle: "300г",
      description: "Тонкая безглютеновая основа для пиццы.",
      ingredients: "Безглютеновая мучная смесь (рисовая/кукурузная), дрожжи, соль, оливковое масло.",
      weight: "300",
      product_photo: { url: "/lending/7.png" },
      price: "",
    },
    {
      id: "7",
      title: "Рогалики из рисовой муки",
      subtitle: "с корицей",
      description: "Нежные безглютеновые рогалики с ароматом корицы.",
      ingredients: "Рисовая мука, корица, мёд (или сироп), дрожжи, соль.",
      weight: "50",
      product_photo: { url: "/lending/8.png" },
      price: "",
    },
    {
      id: "8",
      title: "Инжир-бри",
      subtitle: "",
      description: "Авторский десерт.",
      ingredients: "",
      weight: "",
      product_photo: { url: "/lending/9.png" },
      price: "",
    },
    {
      id: "9",
      title: "Кекс арахисовый",
      subtitle: "",
      description: "Безглютеновый кекс.",
      ingredients: "",
      weight: "",
      product_photo: { url: "/lending/10.png" },
      price: "",
    },
  ];
}
