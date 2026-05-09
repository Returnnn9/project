export function cn(...inputs: (string | string[] | boolean | undefined | null | { [key: string]: unknown })[]) {
 const classes: string[] = [];

 for (const input of inputs) {
  if (!input) continue;

  if (typeof input === 'string') {
   classes.push(input);
  } else if (Array.isArray(input)) {
   for (const item of input) {
    if (item) classes.push(item);
   }
  } else if (typeof input === 'object') {
   for (const [key, value] of Object.entries(input)) {
    if (value) {
     classes.push(key);
    }
   }
  }
 }

 return classes.filter(Boolean).join(' ');
}
