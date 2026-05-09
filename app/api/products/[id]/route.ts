import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const session = await auth();
 if (!session?.user || session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 try {
  const { id: idParam } = await params;
  const id = Number(idParam);
  
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
   return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  if (product.image && product.image.startsWith('/uploads/')) {
   try {
    const imagePath = path.join(process.cwd(), 'public', product.image);
    await fs.unlink(imagePath);
   } catch (err) {
    console.error('Failed to delete image:', err);
   }
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
 } catch (error) {
  console.error('Error deleting product from DB:', error);
  return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
 }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const session = await auth();
 if (!session?.user || session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 try {
  const { id: idParam } = await params;
  const id = Number(idParam);
  const formData = await req.formData();

  const existingProduct = await prisma.product.findUnique({ where: { id } });
  if (!existingProduct) {
   return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  let imagePath = existingProduct.image;
  const file = formData.get('image') as File | null;

  if (file && file.size > 0 && typeof file !== 'string') {
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

   if (existingProduct.image && existingProduct.image.startsWith('/uploads/')) {
    try {
     await fs.unlink(path.join(process.cwd(), 'public', existingProduct.image));
    } catch (e) {
     console.error('Could not delete old image', e);
    }
   }

   imagePath = `/uploads/${filename}`;
  }

  let existingNutrition: Record<string, string> = {};
  try {
   existingNutrition = existingProduct.nutrition ? JSON.parse(existingProduct.nutrition) : {};
  } catch {
   existingNutrition = {};
  }
  const kcal = formData.get('kcal') as string | null;
  const proteins = formData.get('proteins') as string | null;
  const fats = formData.get('fats') as string | null;
  const carbs = formData.get('carbs') as string | null;

  let newNutritionStr = existingProduct.nutrition;
  if (kcal !== null || proteins !== null || fats !== null || carbs !== null) {
   newNutritionStr = JSON.stringify({
    kcal: kcal || existingNutrition.kcal || '',
    proteins: proteins || existingNutrition.proteins || '',
    fats: fats || existingNutrition.fats || '',
    carbs: carbs || existingNutrition.carbs || ''
   });
  }

  const oldPriceRaw = formData.get('oldPrice');
  let newOldPrice = existingProduct.oldPrice;
  
  if (oldPriceRaw) {
   newOldPrice = Number(oldPriceRaw);
  } else if (formData.has('oldPrice') && !oldPriceRaw) {
   newOldPrice = null;
  }

  const updatedProduct = await prisma.product.update({
   where: { id },
   data: {
    name: formData.get('name') as string || existingProduct.name,
    weight: formData.get('weight') as string || existingProduct.weight,
    price: formData.has('price') ? Number(formData.get('price')) : existingProduct.price,
    category: formData.get('category') as string || existingProduct.category,
    image: imagePath,
    description: formData.get('description') as string || existingProduct.description,
    composition: formData.get('composition') as string || existingProduct.composition,
    quantity: formData.has('quantity') ? Number(formData.get('quantity')) : existingProduct.quantity,
    nutrition: newNutritionStr,
    oldPrice: newOldPrice,
   }
  });

  return NextResponse.json({
   ...updatedProduct,
   nutrition: updatedProduct.nutrition ? JSON.parse(updatedProduct.nutrition) : undefined
  });
 } catch (error) {
  console.error('Error updating product in DB:', error);
  return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
 }
}
