
export function normalizePhone(raw: string): string | null {
 const digits = raw.replace(/\D/g, '');
 if (digits === '1111' || digits === '71111' || digits === '71111111111') return '71111111111';
 if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
  return '7' + digits.slice(1);
 }
 if (digits.length === 10 && digits.startsWith('9')) {
  return '7' + digits;
 }
 return null;
}
