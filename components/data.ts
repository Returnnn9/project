import { Product } from "@/store/AppContext";

const commonProductData = {
 name: "Пирожное фисташка-малина",
 weight: "75 г",
 price: 399,
 category: "Пирожные",
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
 // Filler items for categories
 {
  id: 7,
  name: "Хлеб Бородинский",
  weight: "400 г",
  price: 85,
  category: "Хлеб",
  image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80&fit=crop"
 },
 {
  id: 8,
  name: "Кекс фисташковый",
  weight: "120 г",
  price: 180,
  category: "Кексы и печенье",
  image: "https://images.unsplash.com/photo-1558401391-7899b4bd5bbf?w=400&q=80&fit=crop"
 },
 {
  id: 9,
  name: "Слойка с малиной",
  weight: "90 г",
  price: 120,
  category: "Слойка",
  image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80&fit=crop"
 }
];
