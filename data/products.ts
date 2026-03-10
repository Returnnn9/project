import { Product } from "@/store/types";

const commonProductData = {
 name: "Пирожное фисташка-малина",
 weight: "75 г",
 price: 399,
 category: "Десерты",
 description: "Нежное безглютеновое пирожное с ярким дуэтом фисташки и малины. Воздушный фисташковый бисквит на миндальной муке сочетается с шелковистым фисташковым кремом и насыщенной малиновой начинкой с лёгкой кислинкой.",
 composition: "Яйцо куриное, сахар, мука миндальная, фисташковая паста 100%, масло сливочное, сливки 33%, пюре малины, малина свежая, сублимированная, белый шоколад (какао-масло, сахар, сухое молоко), кукурузный крахмал, желатин, соль морская, натуральный экстракт ванили.",
 nutrition: {
  kcal: "395 / 1650",
  proteins: "7,2",
  fats: "27,8",
  carbs: "28,5"
 }
};

export const products: Product[] = [
 {
  id: 1,
  ...commonProductData,
  image: "/photo/Rectangle 22.png",
 },
 {
  id: 2,
  ...commonProductData,
  image: "/photo/Rectangle 22-1.png",
 },
 {
  id: 3,
  ...commonProductData,
  image: "/photo/Rectangle 22-2.png",
 },
 {
  id: 4,
  ...commonProductData,
  image: "/photo/Rectangle 22-3.png",
 },
 {
  id: 5,
  ...commonProductData,
  image: "/photo/Rectangle 22-4.png",
 },
 {
  id: 6,
  ...commonProductData,
  image: "/photo/Rectangle 22-5.png",
 },
 // Filler items for other categories
 {
  id: 7,
  name: "Хлеб Бородинский",
  weight: "400 г",
  price: 85,
  category: "Хлеб",
  image: "/photo/bread1.jpg"
 } as any,
 {
  id: 8,
  name: "Кекс фисташковый",
  weight: "120 г",
  price: 180,
  category: "Снеки",
  image: "/photo/snack1.jpg"
 } as any,
 {
  id: 9,
  name: "Слойка с малиной",
  weight: "90 г",
  price: 120,
  category: "Выпечка",
  image: "/photo/snack1.jpg"
 } as any
];

export const categories = [
 { id: 'desserts', label: 'Десерты' },
 { id: 'bread', label: 'Хлеб' },
 { id: 'snacks', label: 'Снеки' },
 { id: 'pastries', label: 'Выпечка' },
];
