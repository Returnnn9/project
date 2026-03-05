"use client";

export function cn(...inputs: (string | boolean | undefined | null | { [key: string]: any })[]) {
 const classes: string[] = [];

 for (const input of inputs) {
  if (!input) continue;

  if (typeof input === 'string') {
   classes.push(input);
  } else if (Array.isArray(input)) {
   // Basic flat array support if ever needed
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
