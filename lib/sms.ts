
import { normalizePhone } from './phone';

const SMSRU_API_KEY = process.env.SMSRU_API_KEY || '';

interface SmsPhoneInfo {
 status: string;
 status_code?: number;
 status_text?: string;
 sms_id?: string | number;
}

interface SmsResponse {
 status: string;
 status_code?: number;
 status_text?: string;
 balance?: number;
 sms?: Record<string, SmsPhoneInfo>;
}

interface SmsSendResult {
 success: boolean;
 smsId?: string;
 errorCode?: string;
 errorText?: string;
}

export async function sendSms(phone: string, text: string): Promise<SmsSendResult> {
 if (!SMSRU_API_KEY) {
  console.warn('[SMSRU] SMSRU_API_KEY is not set. Skipping SMS.');
  return { success: false, errorText: 'API key not set' };
 }

 const normalizedPhone = normalizePhone(phone);
 if (!normalizedPhone) {
  return { success: false, errorText: 'Invalid phone format' };
 }

 const params = new URLSearchParams({
  api_id: SMSRU_API_KEY,
  to: normalizedPhone,
  msg: text,
  json: '1',
 });

 const url = `https://sms.ru/sms/send?${params.toString()}`;

 try {
  const res = await fetch(url, {
   method: 'GET',
   headers: {
    'Accept': 'application/json',
   },
   signal: AbortSignal.timeout(15000),
  });

  const json = await res.json() as SmsResponse;

  if (json.status === 'OK') {
   const smsInfo = json.sms?.[normalizedPhone];
   
   if (smsInfo && smsInfo.status === 'OK') {
    const smsId = smsInfo.sms_id;
    console.log(`[SMSRU] ✅ SMS sent to ${normalizedPhone} | id=${smsId}`);
    return { success: true, smsId: String(smsId) };
   } else {
    const errCode = smsInfo?.status_code;
    const textError = smsInfo?.status_text || 'Unknown error';
    console.error(`[SMSRU] ❌ Error ${errCode}: ${textError}`);
    return { success: false, errorCode: String(errCode), errorText: String(textError) };
   }
  } else {
   const errCode = json.status_code;
   const textError = json.status_text || 'Unknown API error';
   console.error(`[SMSRU] ❌ API Error ${errCode}: ${textError}`);
   return { success: false, errorCode: String(errCode), errorText: String(textError) };
  }
 } catch (err) {
  console.error('[SMSRU] ❌ Request failed:', err);
  return { success: false, errorText: String(err) };
 }
}

export async function getSmsBalance(): Promise<{ success: boolean; balance?: number; errorText?: string }> {
 if (!SMSRU_API_KEY) {
  return { success: false, errorText: 'API key not set' };
 }

 const params = new URLSearchParams({
  api_id: SMSRU_API_KEY,
  json: '1',
 });

 const url = `https://sms.ru/my/balance?${params.toString()}`;

 try {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const json = await res.json() as SmsResponse;

  if (json.status === 'OK') {
   return { success: true, balance: Number(json.balance) };
  } else {
   return { success: false, errorText: json.status_text || 'Could not fetch balance' };
  }
 } catch (err) {
  console.error('[SMSRU] ❌ Balance fetch failed:', err);
  return { success: false, errorText: String(err) };
 }
}

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
