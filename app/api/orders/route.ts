import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Order } from '@/store/types';
import { sendSms, buildOrderSms } from '@/lib/alfasms';

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
    if (!newOrder.items || !newOrder.total) {
      return NextResponse.json({ error: 'Missing required fields: items or total' }, { status: 400 });
    }

    const data = await fs.readFile(dataFile, 'utf-8');
    const orders: Order[] = JSON.parse(data);

    // Add order to the beginning
    orders.unshift(newOrder);

    await fs.writeFile(dataFile, JSON.stringify(orders, null, 2));

    // Send SMS confirmation to customer (fire-and-forget — order save is never blocked)
    if (newOrder.userPhone) {
      const smsText = buildOrderSms({
        orderId: newOrder.id,
        userName: newOrder.userName || 'Клиент',
        total: newOrder.total,
        address: newOrder.address || '',
        itemCount: newOrder.items.length,
      });
      sendSms(newOrder.userPhone, smsText).catch(err =>
        console.error('[AlfaSMS] Unhandled SMS error:', err)
      );
    }

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error saving order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
