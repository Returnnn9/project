import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Product } from '@/store/types';

const dataFile = path.join(process.cwd(), 'data/products.json');

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
 try {
  const { id: idParam } = await params;
  const id = Number(idParam);
  const data = await fs.readFile(dataFile, 'utf-8');
  const products: Product[] = JSON.parse(data);

  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex === -1) {
   return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const product = products[productIndex];

  // Delete image if it's in uploads directory
  if (product.image && product.image.startsWith('/uploads/')) {
   try {
    const imagePath = path.join(process.cwd(), 'public', product.image);
    await fs.unlink(imagePath);
   } catch (err) {
    console.error('Failed to delete image:', err);
    // Continue even if image deletion fails
   }
  }

  products.splice(productIndex, 1);
  await fs.writeFile(dataFile, JSON.stringify(products, null, 2));

  return NextResponse.json({ success: true });
 } catch (error) {
  console.error('Error deleting product:', error);
  return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
 }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
 try {
  const { id: idParam } = await params;
  const id = Number(idParam);
  const formData = await req.formData();

  const data = await fs.readFile(dataFile, 'utf-8');
  const products: Product[] = JSON.parse(data);

  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex === -1) {
   return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const existingProduct = products[productIndex];
  let imagePath = existingProduct.image;

  // Check if new image was uploaded
  const file = formData.get('image') as File | null;
  if (file && file.size > 0 && typeof file !== 'string') {
   const bytes = await file.arrayBuffer();
   const buffer = Buffer.from(bytes);

   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
   const ext = path.extname(file.name) || '.png';
   const filename = `${uniqueSuffix}${ext}`;
   const uploadDir = path.join(process.cwd(), 'public/uploads');

   try {
    await fs.access(uploadDir);
   } catch {
    await fs.mkdir(uploadDir, { recursive: true });
   }

   await fs.writeFile(path.join(uploadDir, filename), buffer);

   // Delete old image
   if (existingProduct.image && existingProduct.image.startsWith('/uploads/')) {
    try {
     await fs.unlink(path.join(process.cwd(), 'public', existingProduct.image));
    } catch (e) {
     console.error('Could not delete old image', e);
    }
   }

   imagePath = `/uploads/${filename}`;
  }

  const updatedProduct: Product = {
   ...existingProduct,
   name: formData.get('name') as string || existingProduct.name,
   weight: formData.get('weight') as string || existingProduct.weight,
   price: Number(formData.get('price')) || existingProduct.price,
   category: formData.get('category') as string || existingProduct.category,
   image: imagePath,
   description: formData.get('description') as string || existingProduct.description,
   composition: formData.get('composition') as string || existingProduct.composition,
   quantity: formData.has('quantity') ? Number(formData.get('quantity')) : existingProduct.quantity || 0,
  };

  const kcal = formData.get('kcal') as string;
  const proteins = formData.get('proteins') as string;
  const fats = formData.get('fats') as string;
  const carbs = formData.get('carbs') as string;

  if (kcal !== null || proteins !== null || fats !== null || carbs !== null) {
   updatedProduct.nutrition = {
    kcal: kcal || existingProduct.nutrition?.kcal || '',
    proteins: proteins || existingProduct.nutrition?.proteins || '',
    fats: fats || existingProduct.nutrition?.fats || '',
    carbs: carbs || existingProduct.nutrition?.carbs || ''
   };
  }

  const oldPrice = formData.get('oldPrice');
  if (oldPrice) {
   updatedProduct.oldPrice = Number(oldPrice);
  } else if (formData.has('oldPrice') && !oldPrice) {
   delete updatedProduct.oldPrice; // remove if cleared
  }

  products[productIndex] = updatedProduct;

  await fs.writeFile(dataFile, JSON.stringify(products, null, 2));

  return NextResponse.json(updatedProduct);
 } catch (error) {
  console.error('Error updating product:', error);
  return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
 }
}
