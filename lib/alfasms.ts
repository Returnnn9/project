/**
 * AlfaSMS (alfaooo.ru) SMS sending utility.
 * API docs: https://alfaooo.ru/api
 * Endpoint: https://ssl.bs00.ru/?method=push_msg
 */

const ALFASMS_API_KEY = process.env.ALFASMS_API_KEY || '';
const ALFASMS_SENDER = process.env.ALFASMS_SENDER || 'Smusl';

/**
 * Normalize a Russian phone number to the format expected by AlfaSMS.
 * Accepts: +7..., 7..., 8..., or 9... (10-digit without country code)
 */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return '7' + digits.slice(1);
  }
  if (digits.length === 10 && digits.startsWith('9')) {
    return '7' + digits;
  }
  return digits;
}

interface SmsSendResult {
  success: boolean;
  smsId?: number;
  credits?: string;
  errorCode?: string;
  errorText?: string;
}

/**
 * Send an SMS message via AlfaSMS API (ssl.bs00.ru gateway).
 * Never throws — errors are logged and returned in the result object.
 */
export async function sendSms(phone: string, text: string): Promise<SmsSendResult> {
  if (!ALFASMS_API_KEY) {
    console.warn('[AlfaSMS] ALFASMS_API_KEY is not set. Skipping SMS.');
    return { success: false, errorText: 'API key not set' };
  }

  const normalizedPhone = normalizePhone(phone);

  const params = new URLSearchParams({
    method: 'push_msg',
    key: ALFASMS_API_KEY,
    text: text,
    phone: normalizedPhone,
    sender_name: ALFASMS_SENDER,
    format: 'JSON',
  });

  const url = `https://ssl.bs00.ru/?${params.toString()}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      // 8-second timeout — don't block the order response for too long
      signal: AbortSignal.timeout(8000),
    });

    const json = await res.json() as {
      response: {
        msg: { err_code: string; text: string; type: string };
        data: { id: number; credits: string; n_raw_sms: number; sender_name: string } | null;
      };
    };

    const { msg, data } = json.response;

    if (msg.err_code === '0') {
      console.log(`[AlfaSMS] ✅ SMS sent to ${normalizedPhone} | id=${data?.id} | cost=${data?.credits} credits`);
      return { success: true, smsId: data?.id, credits: data?.credits };
    } else {
      console.error(`[AlfaSMS] ❌ Error ${msg.err_code}: ${msg.text}`);
      return { success: false, errorCode: msg.err_code, errorText: msg.text };
    }
  } catch (err) {
    console.error('[AlfaSMS] ❌ Request failed:', err);
    return { success: false, errorText: String(err) };
  }
}

/**
 * Build the order confirmation SMS text.
 */
export function buildOrderSms(opts: {
  orderId: number;
  userName: string;
  total: number;
  address: string;
  itemCount: number;
}): string {
  const shortId = opts.orderId.toString().slice(-6);
  const addr = opts.address || 'самовывоз';
  return (
    `${opts.userName}, ваш заказ #${shortId} принят! ` +
    `Состав: ${opts.itemCount} поз. Сумма: ${opts.total} ₽. ` +
    `Адрес: ${addr}. Спасибо!`
  );
}
