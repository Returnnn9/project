import { NextRequest, NextResponse } from 'next/server';
import type { CartItem, Order } from '@/store/types';
import { Prisma } from '@prisma/client';
import { sendSms, buildOrderSms } from '@/lib/alfasms';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Only admins can list all orders
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dbOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Map Prisma models to the expected frontend Order type.
    // items is native Json — no JSON.parse needed.
    const orders: Order[] = dbOrders.map(dbOrder => ({
      ...dbOrder,
      userName: dbOrder.userName ?? undefined,
      userPhone: dbOrder.userPhone ?? undefined,
      items: dbOrder.items as unknown as CartItem[],
      status: dbOrder.status as Order['status'],
    }));

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error reading orders from DB:', error);
    return NextResponse.json({ error: 'Failed to read orders' }, { status: 500 });
  }
}

// Simple in-memory rate limit for order creation: max 5 orders / minute per IP.
// Note: resets on serverless cold-start — a Redis-based solution is recommended for production.
const orderRateLimit = new Map<string, { count: number; firstAt: number }>();
const ORDER_RATE_WINDOW_MS = 60_000;
const ORDER_RATE_MAX = 5;

function checkOrderRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = orderRateLimit.get(ip);
  if (!entry || now - entry.firstAt > ORDER_RATE_WINDOW_MS) {
    orderRateLimit.set(ip, { count: 1, firstAt: now });
    return true; // allowed
  }
  entry.count += 1;
  return entry.count <= ORDER_RATE_MAX;
}

export async function POST(req: NextRequest) {
  // ── Basic origin/CSRF check ───────────────────────────────────────────────
  const origin = req.headers.get('origin') || req.headers.get('referer') || '';
  const allowedOrigins = [
    process.env.NEXTAUTH_URL || '',
    process.env.AUTH_URL || '',
  ].filter(Boolean);
  const isTrustedOrigin = allowedOrigins.some(o => origin.startsWith(o));
  if (!isTrustedOrigin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ── IP rate limit ─────────────────────────────────────────────────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (!checkOrderRateLimit(ip)) {
    return NextResponse.json({ error: 'Слишком много запросов. Подождите минуту.' }, { status: 429 });
  }

  try {
    const newOrder: Order = await req.json();

    // Basic validation
    if (!newOrder.items || !Array.isArray(newOrder.items) || newOrder.items.length === 0) {
      return NextResponse.json({ error: 'Missing required field: items' }, { status: 400 });
    }
    if (!newOrder.total || typeof newOrder.total !== 'number' || newOrder.total <= 0) {
      return NextResponse.json({ error: 'Missing required field: total' }, { status: 400 });
    }

    // Determine current date string if missing
    const dateStr = newOrder.date || new Date().toISOString();

    // Save order in database.
    // items is stored as native PostgreSQL JSON — no JSON.stringify needed.
    const savedOrder = await prisma.order.create({
      data: {
        total: newOrder.total,
        date: dateStr,
        address: newOrder.address || '',
        status: newOrder.status || 'new',
        userName: newOrder.userName,
        userPhone: newOrder.userPhone,
        items: JSON.stringify(newOrder.items),
      }
    });

    const parsedOrder: Order = {
      ...savedOrder,
      userName: savedOrder.userName ?? undefined,
      userPhone: savedOrder.userPhone ?? undefined,
      items: JSON.parse(savedOrder.items) as CartItem[],
      status: savedOrder.status as Order['status'],
    };

    // Send SMS confirmation to customer (non-blocking)
    if (parsedOrder.userPhone) {
      const smsText = buildOrderSms({
        orderId: parsedOrder.id,
        userName: parsedOrder.userName || 'Клиент',
        total: parsedOrder.total,
        address: parsedOrder.address || '',
        itemCount: (parsedOrder.items as CartItem[]).length,
      });

      sendSms(parsedOrder.userPhone, smsText).catch(err => {
        console.error('[SMS.RU] Unhandled SMS error:', err);
      });
    }

    return NextResponse.json(parsedOrder, { status: 201 });
  } catch (error) {
    console.error('Error saving order to DB:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
