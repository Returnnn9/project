import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function GET() {
 try {
  const products = await prisma.product.findMany({
   orderBy: { createdAt: 'asc' }
  });
  
  // Format the output to match what the frontend expects
  const formattedProducts = products.map(p => ({
   ...p,
   nutrition: (() => {
    try { return p.nutrition ? JSON.parse(p.nutrition) : undefined; }
    catch { return undefined; }
   })(),
  }));

  return NextResponse.json(formattedProducts);
 } catch (error) {
  console.error('Error reading products from DB:', error);
  return NextResponse.json({ error: 'Failed to read products' }, { status: 500 });
 }
}

export async function POST(req: NextRequest) {
 const session = await auth();
 if (!session?.user || session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 try {
  const formData = await req.formData();
  const file = formData.get('image') as File | null;
  let imagePath = '';

  if (file && file.size > 0) {
   if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' }, { status: 400 });
   }
   if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large. Max 5MB allowed' }, { status: 400 });
   }
   const bytes = await file.arrayBuffer();
   const buffer = Buffer.from(bytes);

   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
   const rawExt = path.extname(file.name).toLowerCase();
   const ext = ALLOWED_EXT.includes(rawExt) ? rawExt : '.bin';
   const filename = `${uniqueSuffix}${ext}`;
   const uploadDir = path.join(process.cwd(), 'public/uploads');

   try {
    await fs.access(uploadDir);
   } catch {
    await fs.mkdir(uploadDir, { recursive: true });
   }

   await fs.writeFile(path.join(uploadDir, filename), buffer);
   imagePath = `/uploads/${filename}`;
  }

  const kcal = formData.get('kcal') as string;
  const proteins = formData.get('proteins') as string;
  const fats = formData.get('fats') as string;
  const carbs = formData.get('carbs') as string;

  let nutritionStr: string | null = null;
  if (kcal || proteins || fats || carbs) {
   nutritionStr = JSON.stringify({
    kcal: kcal || '',
    proteins: proteins || '',
    fats: fats || '',
    carbs: carbs || ''
   });
  }

  const oldPrice = formData.get('oldPrice');

  const newProduct = await prisma.product.create({
   data: {
    name: formData.get('name') as string,
    weight: formData.get('weight') as string,
    price: Number(formData.get('price')),
    oldPrice: oldPrice ? Number(oldPrice) : null,
    category: formData.get('category') as string,
    image: imagePath,
    description: formData.get('description') as string || null,
    composition: formData.get('composition') as string || null,
    quantity: formData.has('quantity') ? Number(formData.get('quantity')) : 0,
    nutrition: nutritionStr,
   }
  });

  return NextResponse.json({
   ...newProduct,
   nutrition: newProduct.nutrition ? JSON.parse(newProduct.nutrition) : undefined
  }, { status: 201 });

 } catch (error) {
  console.error('Error creating product in DB:', error);
  return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
 }
}
