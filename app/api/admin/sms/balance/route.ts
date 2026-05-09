import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getSmsBalance } from '@/lib/sms';

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await getSmsBalance();

  if (!result.success) {
    return NextResponse.json({ error: result.errorText }, { status: 500 });
  }

  return NextResponse.json({ balance: result.balance });
}
