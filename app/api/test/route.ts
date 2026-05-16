import { NextResponse } from 'next/server';
import { parseRussianAddress } from '@/lib/address';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || 'Новослободская д. 24, кв. 57';
  const parsed = parseRussianAddress(q);
  return NextResponse.json({ q, parsed });
}
