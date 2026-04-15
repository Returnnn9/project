import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Данные товаров из data/products.json
const PRODUCTS = [
  {
    name: "Кекс фисташковый",
    weight: "75 г",
    price: 900,
    oldPrice: 400,
    category: "desserts",
    image: "/photo/Rectangle 22.png",
    description: "Нежное безглютеновое пирожное с ярким дуэтом фисташки и малины.",
    composition: "Яйцо куриное, сахар, мука миндальная, фисташковая паста 100%, масло сливочное, сливки 33%.",
    quantity: 49,
    nutrition: { kcal: "395", proteins: "7,2", fats: "27,8", carbs: "28,5" },
  },
  {
    name: "Мусс «Облако»",
    weight: "75 г",
    price: 399,
    category: "desserts",
    image: "/photo/Rectangle 22-1.png",
    description: "Воздушный мусс с нежной текстурой.",
    composition: "Яйцо куриное, сахар, мука миндальная, фисташковая паста 100%, масло сливочное, сливки 33%.",
    quantity: 8,
  },
  {
    name: "Шоколадный шедевр",
    weight: "75 г",
    price: 399,
    category: "desserts",
    image: "/photo/Rectangle 22-2.png",
    description: "Нежное безглютеновое пирожное с ярким дуэтом фисташки и малины.",
    composition: "Яйцо куриное, сахар, мука миндальная, фисташковая паста 100%, масло сливочное, сливки 33%.",
    quantity: 10,
  },
  {
    name: "Пирожное Лайм",
    weight: "75 г",
    price: 399,
    category: "desserts",
    image: "/photo/Rectangle 22-3.png",
    description: "Нежное безглютеновое пирожное с ярким дуэтом фисташки и малины.",
    composition: "Яйцо куриное, сахар, мука миндальная, фисташковая паста 100%, масло сливочное, сливки 33%.",
    quantity: 10,
  },
  {
    name: "Макарон малина",
    weight: "75 г",
    price: 399,
    category: "desserts",
    image: "/photo/Rectangle 22-4.png",
    description: "Нежное безглютеновое пирожное с ярким дуэтом фисташки и малины.",
    composition: "Яйцо куриное, сахар, мука миндальная, фисташковая паста 100%, масло сливочное, сливки 33%.",
    quantity: 10,
  },
  {
    name: "Эклер фисташка",
    weight: "75 г",
    price: 399,
    category: "desserts",
    image: "/photo/Rectangle 22-5.png",
    description: "Нежное безглютеновое пирожное с ярким дуэтом фисташки и малины.",
    composition: "Яйцо куриное, сахар, мука миндальная, фисташковая паста 100%, масло сливочное, сливки 33%.",
    quantity: 10,
  },
  {
    name: "Хлеб Бородинский",
    weight: "400 г",
    price: 85,
    category: "bread",
    image: "/photo/bread1.jpg",
    description: "Классический Бородинский хлеб с неповторимым ароматом.",
    composition: "Мука ржаная, вода, соль, солод, тмин.",
    quantity: 20,
  },
  {
    name: "Кекс фисташковый",
    weight: "120 г",
    price: 180,
    category: "snacks",
    image: "/photo/snack1.jpg",
    description: "Нежный кекс с насыщенным фисташковым вкусом.",
    composition: "Яйцо куриное, сахар, мука миндальная, фисташковая паста 100%, масло сливочное.",
    quantity: 15,
  },
  {
    name: "Слойка с малиной",
    weight: "90 г",
    price: 120,
    category: "pastries",
    image: "/photo/snack1.jpg",
    description: "Воздушная слойка с ароматной малиновой начинкой.",
    composition: "Мука пшеничная, масло сливочное, яйцо куриное, малина, сахар.",
    quantity: 12,
  },
];

export const runtime = "nodejs";

export async function GET() {
  try {
    const existing = await prisma.product.count();
    if (existing > 0) {
      return NextResponse.json({
        message: `В БД уже есть ${existing} товаров. Seed пропущен.`,
        count: existing,
      });
    }

    const created = [];
    for (const p of PRODUCTS) {
      const product = await prisma.product.create({
        data: {
          name: p.name,
          weight: p.weight,
          price: p.price,
          oldPrice: p.oldPrice ?? null,
          category: p.category,
          image: p.image,
          description: p.description ?? null,
          composition: p.composition ?? null,
          quantity: p.quantity ?? 0,
          nutrition: p.nutrition ? JSON.stringify(p.nutrition) : null,
        },
      });
      created.push(product.name);
    }

    return NextResponse.json({
      ok: true,
      message: `✅ Добавлено ${created.length} товаров`,
      products: created,
    });
  } catch (err) {
    console.error('[SEED] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
