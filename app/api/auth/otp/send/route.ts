import { NextResponse } from 'next/server';
import { sendSms } from '@/lib/sms';
import { createOtp, getOtpSendCooldown } from '@/lib/otp-store';
import { normalizePhone } from '@/lib/phone';

const ADMIN_PHONE = process.env.ADMIN_PHONE ?? '';

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: 'Укажите номер телефона' }, { status: 400 });
    }

    const normalized = normalizePhone(phone);
    if (!normalized) {
      return NextResponse.json({ error: 'Неверный формат номера' }, { status: 400 });
    }

    // Admin shortcut — no OTP needed, password is verified in auth.ts
    if (ADMIN_PHONE && normalized === ADMIN_PHONE) {
      return NextResponse.json({ ok: true, admin: true });
    }

    // DB-based cooldown (safe for serverless — no in-memory Map)
    const waitSeconds = await getOtpSendCooldown(normalized);
    if (waitSeconds > 0) {
      return NextResponse.json(
        { error: `Подождите ${waitSeconds} сек. перед повторной отправкой` },
        { status: 429 },
      );
    }

    const code = await createOtp(normalized);

    // Bypass SMS.RU for test numbers in development only
    if (process.env.NODE_ENV !== 'production' && normalized.endsWith('0000')) {
      console.log(`[OTP] Bypass SMS for test number ${normalized}. Code: ${code}`);
      return NextResponse.json({ ok: true, dev: true });
    }

    const smsResult = await sendSms(normalized, `Ваш код подтверждения: ${code}`);

    if (!smsResult.success) {
      console.error('[OTP send] SMS failed:', smsResult.errorText);
      return NextResponse.json(
        { error: `Ошибка сервиса SMS: ${smsResult.errorText || 'неизвестно'} (код ${smsResult.errorCode || '?'})` },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[OTP send] Error:', err);
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 });
  }
}
