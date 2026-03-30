import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/store/types';
import { sendSms, buildOrderSms } from '@/lib/alfasms';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  // Only admins can list all orders
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dbOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Map Prisma models to the expected frontend Order type
    const orders: Order[] = dbOrders.map(dbOrder => ({
      ...dbOrder,
      items: JSON.parse(dbOrder.items),
      status: dbOrder.status as any,
    }));

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error reading orders from DB:', error);
    return NextResponse.json({ error: 'Failed to read orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const newOrder: Order = await req.json();

    // Basic validation
    if (!newOrder.items || !newOrder.total) {
      return NextResponse.json({ error: 'Missing required fields: items or total' }, { status: 400 });
    }

    // Determine current date string if missing
    const dateStr = newOrder.date || new Date().toISOString();
    
    // Convert array of items to string for SQLite storage
    const itemsJsonStr = JSON.stringify(newOrder.items);

    // Save order in database
    const savedOrder = await prisma.order.create({
      data: {
        total: newOrder.total,
        date: dateStr,
        address: newOrder.address || '',
        status: newOrder.status || 'new',
        userName: newOrder.userName,
        userPhone: newOrder.userPhone,
        items: itemsJsonStr,
      }
    });

    const parsedOrder: Order = {
      ...savedOrder,
      items: JSON.parse(savedOrder.items),
      status: savedOrder.status as any,
    };

    // Send SMS confirmation to customer using 'await' to ensure execution in Serverless 
    if (parsedOrder.userPhone) {
      const smsText = buildOrderSms({
        orderId: parsedOrder.id,
        userName: parsedOrder.userName || 'Клиент',
        total: parsedOrder.total,
        address: parsedOrder.address || '',
        itemCount: parsedOrder.items.length,
      });

      try {
        await sendSms(parsedOrder.userPhone, smsText);
      } catch (err) {
        console.error('[AlfaSMS] Unhandled SMS error:', err);
      }
    }

    return NextResponse.json(parsedOrder, { status: 201 });
  } catch (error) {
    console.error('Error saving order to DB:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
