import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Order } from '@/store/types';

const dataFile = path.join(process.cwd(), 'data/orders.json');

// Ensure the file exists
async function ensureFile() {
 try {
  await fs.access(dataFile);
 } catch {
  await fs.writeFile(dataFile, JSON.stringify([]));
 }
}

export async function GET() {
 try {
  await ensureFile();
  const data = await fs.readFile(dataFile, 'utf-8');
  const orders: Order[] = JSON.parse(data);
  return NextResponse.json(orders);
 } catch (error) {
  console.error('Error reading orders:', error);
  return NextResponse.json({ error: 'Failed to read orders' }, { status: 500 });
 }
}

export async function POST(req: Request) {
  try {
    await ensureFile();
    const newOrder: Order = await req.json();

    // Basic validation
    if (!newOrder.items || !newOrder.address || !newOrder.total) {
      return NextResponse.json({ error: 'Missing required fields: items, address, or total' }, { status: 400 });
    }

    const data = await fs.readFile(dataFile, 'utf-8');
    const orders: Order[] = JSON.parse(data);

    // Add order to the beginning
    orders.unshift(newOrder);

    await fs.writeFile(dataFile, JSON.stringify(orders, null, 2));

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error saving order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
