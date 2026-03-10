import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Product } from '@/store/types';

const dataFile = path.join(process.cwd(), 'data/products.json');

export async function GET() {
 try {
  const data = await fs.readFile(dataFile, 'utf-8');
  const products: Product[] = JSON.parse(data);
  return NextResponse.json(products);
 } catch (error) {
  console.error('Error reading products:', error);
  return NextResponse.json({ error: 'Failed to read products' }, { status: 500 });
 }
}

export async function POST(req: Request) {
 try {
  const formData = await req.formData();
  const file = formData.get('image') as File | null;
  let imagePath = '';

  if (file && file.size > 0) {
   const bytes = await file.arrayBuffer();
   const buffer = Buffer.from(bytes);

   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
   const ext = path.extname(file.name) || '.png';
   const filename = `${uniqueSuffix}${ext}`;
   const uploadDir = path.join(process.cwd(), 'public/uploads');

   // Ensure directory exists
   try {
    await fs.access(uploadDir);
   } catch {
    await fs.mkdir(uploadDir, { recursive: true });
   }

   await fs.writeFile(path.join(uploadDir, filename), buffer);
   imagePath = `/uploads/${filename}`;
  }

  const newProduct: Product = {
   id: Date.now(),
   name: formData.get('name') as string,
   weight: formData.get('weight') as string,
   price: Number(formData.get('price')),
   category: formData.get('category') as string,
   image: imagePath,
   description: formData.get('description') as string || undefined,
   composition: formData.get('composition') as string || undefined,
   quantity: formData.has('quantity') ? Number(formData.get('quantity')) : 0,
  };

  const kcal = formData.get('kcal') as string;
  const proteins = formData.get('proteins') as string;
  const fats = formData.get('fats') as string;
  const carbs = formData.get('carbs') as string;

  if (kcal || proteins || fats || carbs) {
   newProduct.nutrition = {
    kcal: kcal || '',
    proteins: proteins || '',
    fats: fats || '',
    carbs: carbs || ''
   };
  }

  const oldPrice = formData.get('oldPrice');
  if (oldPrice) newProduct.oldPrice = Number(oldPrice);

  const data = await fs.readFile(dataFile, 'utf-8');
  const products: Product[] = JSON.parse(data);

  products.push(newProduct);

  await fs.writeFile(dataFile, JSON.stringify(products, null, 2));

  return NextResponse.json(newProduct, { status: 201 });
 } catch (error) {
  console.error('Error creating product:', error);
  return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
 }
}
