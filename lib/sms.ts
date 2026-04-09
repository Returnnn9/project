/**
 * SMS.RU SMS sending utility.
 * API docs: https://sms.ru/api/send
 * Endpoint: https://sms.ru/sms/send
 */

import { normalizePhone } from './phone';

const SMSRU_API_ID = process.env.SMSRU_API_ID || '';

interface SmsSendResult {
 success: boolean;
 smsId?: number;
 credits?: string;
 errorCode?: string;
 errorText?: string;
}

export async function sendSms(phone: string, text: string): Promise<SmsSendResult> {
 if (!SMSRU_API_ID) {
  console.warn('[SMS.RU] SMSRU_API_ID is not set. Skipping SMS.');
  return { success: false, errorText: 'API key not set' };
 }

 const normalizedPhone = normalizePhone(phone);
 if (!normalizedPhone) {
  return { success: false, errorText: 'Invalid phone format' };
 }

 const params = new URLSearchParams({
  api_id: SMSRU_API_ID,
  to: normalizedPhone,
  msg: text,
  json: '1',
 });

 const url = `https://sms.ru/sms/send?${params.toString()}`;

 try {
  const res = await fetch(url, {
   method: 'GET',
   headers: { 'Accept': 'application/json' },
   // 15-second timeout — don't block the order response for too long
   signal: AbortSignal.timeout(15000),
  });

  const json = await res.json() as {
   status: string;
   status_code: number;
   sms?: Record<string, { status: string; status_code: number; sms_id?: string; cost?: string; status_text?: string }>;
   balance?: number;
  };

  // status_code 100 = success
  if (json.status_code === 100) {
   const smsEntry = json.sms ? Object.values(json.sms)[0] : undefined;
   
   if (smsEntry && smsEntry.status_code !== 100) {
    console.error(`[SMS.RU] ❌ Error ${smsEntry.status_code}: ${smsEntry.status_text}`);
    return { success: false, errorCode: String(smsEntry.status_code), errorText: smsEntry.status_text };
   }

   const smsId = smsEntry?.sms_id ? Number(smsEntry.sms_id) : undefined;
   const cost = smsEntry?.cost;
   console.log(`[SMS.RU] ✅ SMS sent to ${normalizedPhone} | id=${smsId} | cost=${cost ?? '?'}`);
   return { success: true, smsId, credits: cost };
  } else {
   const errText = json.sms ? Object.values(json.sms)[0]?.status_text ?? 'Unknown error' : 'Unknown error';
   console.error(`[SMS.RU] ❌ Error ${json.status_code}: ${errText}`);
   return { success: false, errorCode: String(json.status_code), errorText: errText };
  }
 } catch (err) {
  console.error('[SMS.RU] ❌ Request failed:', err);
  return { success: false, errorText: String(err) };
 }
}

export async function getSmsBalance(): Promise<{ success: boolean; balance?: number; errorText?: string }> {
 if (!SMSRU_API_ID) {
  return { success: false, errorText: 'API key not set' };
 }

 const url = `https://sms.ru/my/balance?api_id=${SMSRU_API_ID}&json=1`;

 try {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const json = await res.json() as { status_code: number; balance?: number; status_text?: string };

  if (json.status_code === 100) {
   return { success: true, balance: json.balance };
  } else {
   return { success: false, errorText: json.status_text || `Error ${json.status_code}` };
  }
 } catch (err) {
  console.error('[SMS.RU] ❌ Balance fetch failed:', err);
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
