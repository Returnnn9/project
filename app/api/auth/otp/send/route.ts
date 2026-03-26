import { NextResponse } from 'next/server';
import { sendSms } from '@/lib/alfasms';
import { createOtp } from '@/lib/otp-store';

/** Normalize phone to 7XXXXXXXXXX (11 digits, starting with 7) */
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return '7' + digits.slice(1);
  }
  if (digits.length === 10 && digits.startsWith('9')) {
    return '7' + digits;
  }
  if (digits.length === 11 && digits.startsWith('7')) {
    return digits;
  }
  return null;
}

// Simple rate-limit: one OTP send per phone per 60 seconds
const lastSent = new Map<string, number>();

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

    // Rate limiting
    const now = Date.now();
    const last = lastSent.get(normalized) ?? 0;
    const wait = Math.ceil((60_000 - (now - last)) / 1000);
    if (now - last < 60_000) {
      return NextResponse.json(
        { error: `Подождите ${wait} сек. перед повторной отправкой` },
        { status: 429 }
      );
    }

    const code = createOtp(normalized);
    lastSent.set(normalized, now);

    // Bypass AlfaSMS for test numbers (e.g., ending in 0000)
    // Makes development unblocked when API is down or key is bad
    if (normalized.endsWith('0000')) {
      console.log(`[OTP] Bypass SMS for test number ${normalized}. Code: ${code}`);
      return NextResponse.json({ ok: true, dev: true });
    }

    const smsText = `Ваш код подтверждения: ${code}`;
    const smsResult = await sendSms(normalized, smsText);

    if (!smsResult.success) {
      console.error('[OTP send] SMS failed:', smsResult.errorText);
      // Return the specific error from AlfaSMS so the user knows what's wrong (e.g. "Некорректный API KEY")
      return NextResponse.json(
        { error: `Ошибка сервиса SMS: ${smsResult.errorText || 'неизвестно'} (код ${smsResult.errorCode || '?'})` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[OTP send] Error:', err);
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 });
  }
}
