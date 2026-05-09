import { NextRequest, NextResponse } from 'next/server';
import type { CartItem, Order } from '@/store/types';

import { sendSms, buildOrderSms } from '@/lib/sms';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dbOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const orders: Order[] = dbOrders.map(dbOrder => ({
      ...dbOrder,
      userName: dbOrder.userName ?? undefined,
      userPhone: dbOrder.userPhone ?? undefined,
      items: dbOrder.items as unknown as CartItem[],
      status: dbOrder.status as Order['status'],
      createdAt: dbOrder.createdAt.toISOString(),
    }));

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error reading orders from DB:', error);
    return NextResponse.json({ error: 'Failed to read orders' }, { status: 500 });
  }
}

const orderRateLimit = new Map<string, { count: number; firstAt: number }>();
const ORDER_RATE_WINDOW_MS = 60_000;
const ORDER_RATE_MAX = 5;

function checkOrderRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = orderRateLimit.get(ip);
  if (!entry || now - entry.firstAt > ORDER_RATE_WINDOW_MS) {
    orderRateLimit.set(ip, { count: 1, firstAt: now });
    return true;
  }
  entry.count += 1;
  return entry.count <= ORDER_RATE_MAX;
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin') || req.headers.get('referer') || '';
  const allowedOrigins = [
    process.env.NEXTAUTH_URL,
    process.env.AUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ].filter(Boolean) as string[];
  const isTrustedOrigin = allowedOrigins.some(o => origin.startsWith(o));
  if (!isTrustedOrigin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (!checkOrderRateLimit(ip)) {
    return NextResponse.json({ error: 'Слишком много запросов. Подождите минуту.' }, { status: 429 });
  }

  try {
    const newOrder: Order = await req.json();

    if (!newOrder.items || !Array.isArray(newOrder.items) || newOrder.items.length === 0) {
      return NextResponse.json({ error: 'Missing required field: items' }, { status: 400 });
    }
    if (!newOrder.total || typeof newOrder.total !== 'number' || newOrder.total <= 0) {
      return NextResponse.json({ error: 'Missing required field: total' }, { status: 400 });
    }
    const MAX_ORDER_TOTAL = 50_000;
    if (newOrder.total > MAX_ORDER_TOTAL) {
      return NextResponse.json({ error: 'Order total exceeds allowed limit' }, { status: 400 });
    }

    const savedOrder = await prisma.order.create({
      data: {
        total: newOrder.total,
        address: newOrder.address || '',
        status: newOrder.status || 'new',
        userName: newOrder.userName,
        userPhone: newOrder.userPhone,
        items: JSON.parse(JSON.stringify(newOrder.items)),
      }
    });

    const parsedOrder: Order = {
      ...savedOrder,
      userName: savedOrder.userName ?? undefined,
      userPhone: savedOrder.userPhone ?? undefined,
      items: savedOrder.items as unknown as CartItem[],
      status: savedOrder.status as Order['status'],
      createdAt: savedOrder.createdAt.toISOString(),
    };

    if (parsedOrder.userPhone) {
      const smsText = buildOrderSms({
        orderId: parsedOrder.id,
        userName: parsedOrder.userName || 'Клиент',
        total: parsedOrder.total,
        address: parsedOrder.address || '',
        itemCount: (parsedOrder.items as CartItem[]).length,
      });

      sendSms(parsedOrder.userPhone, smsText).catch(err => {
        console.error('[SMSRU] Unhandled SMS error:', err);
      });
    }

    return NextResponse.json(parsedOrder, { status: 201 });
  } catch (error) {
    console.error('Error saving order to DB:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status } = await req.json() as { id: number; status: Order['status'] };

    const validStatuses: Order['status'][] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!id || !status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid id or status' }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      ...updated,
      userName: updated.userName ?? undefined,
      userPhone: updated.userPhone ?? undefined,
      items: updated.items as unknown as CartItem[],
      status: updated.status as Order['status'],
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

