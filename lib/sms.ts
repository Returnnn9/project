/**
 * Alfa SMS sending utility.
 * API docs: http://lk.alfasms.info/
 * Endpoint: http://api.alfasms.info/
 */

import { normalizePhone } from './phone';

const ALFASMS_API_KEY = process.env.ALFASMS_API_KEY || '';
const ALFASMS_SENDER = process.env.ALFASMS_SENDER || '';

interface SmsSendResult {
 success: boolean;
 smsId?: number;
 credits?: string;
 errorCode?: string;
 errorText?: string;
}

export async function sendSms(phone: string, text: string): Promise<SmsSendResult> {
 if (!ALFASMS_API_KEY) {
  console.warn('[ALFASMS] ALFASMS_API_KEY is not set. Skipping SMS.');
  return { success: false, errorText: 'API key not set' };
 }

 const normalizedPhone = normalizePhone(phone);
 if (!normalizedPhone) {
  return { success: false, errorText: 'Invalid phone format' };
 }

 const params = new URLSearchParams({
  method: 'push_msg',
  key: ALFASMS_API_KEY,
  phone: normalizedPhone,
  text: text,
  format: 'json',
 });

 if (ALFASMS_SENDER) {
  params.append('sender', ALFASMS_SENDER);
 }

 const url = `http://api.alfasms.info/?${params.toString()}`;

 try {
  const res = await fetch(url, {
   method: 'GET',
   headers: {
    'Accept': 'application/json',
   },
   // 15-second timeout — don't block the order response for too long
   signal: AbortSignal.timeout(15000),
  });

  const textRes = await res.text();
  let json: any = {};
  
  try {
    json = JSON.parse(textRes);
  } catch (e) {
    console.error('[ALFASMS] ❌ Failed to parse JSON response:', textRes);
    return { success: false, errorText: 'Invalid JSON response from AlfaSMS' };
  }

  // Response structure check
  let errCode = json?.response?.msg?.err_code || json?.err_code || json?.error_code;
  let textError = json?.response?.msg?.text || json?.text || 'Unknown error';
  
  if (json.error) {
    return { success: false, errorCode: String(json.error.code || 'error'), errorText: json.error.message || json.error };
  }

  if (errCode === '0' || errCode === 0 || (json?.response?.msg?.id) || (json?.id)) {
   const smsId = json?.response?.msg?.id || json?.id;
   console.log(`[ALFASMS] ✅ SMS sent to ${normalizedPhone} | id=${smsId}`);
   return { success: true, smsId };
  } else {
   console.error(`[ALFASMS] ❌ Error ${errCode}: ${textError}`);
   return { success: false, errorCode: String(errCode), errorText: String(textError) };
  }
 } catch (err) {
  console.error('[ALFASMS] ❌ Request failed:', err);
  return { success: false, errorText: String(err) };
 }
}

export async function getSmsBalance(): Promise<{ success: boolean; balance?: number; errorText?: string }> {
 if (!ALFASMS_API_KEY) {
  return { success: false, errorText: 'API key not set' };
 }

 const params = new URLSearchParams({
  method: 'get_profile',
  key: ALFASMS_API_KEY,
  format: 'json',
 });

 const url = `http://api.alfasms.info/?${params.toString()}`;

 try {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const textRes = await res.text();
  let json: any = {};
  
  try {
    json = JSON.parse(textRes);
  } catch(e) {
    return { success: false, errorText: 'Invalid JSON response' };
  }

  const balance = json?.response?.data?.balance || json?.balance;
  
  if (balance !== undefined) {
   return { success: true, balance: Number(balance) };
  } else {
   return { success: false, errorText: json?.response?.msg?.text || 'Could not fetch balance' };
  }
 } catch (err) {
  console.error('[ALFASMS] ❌ Balance fetch failed:', err);
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
