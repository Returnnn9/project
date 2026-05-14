export function typograph(text: string | null | undefined): string {
  if (!text) return "";
  // Return text untouched or simple replacements (like soft hyphens / spaces if desired)
  return text.replace(/ - /g, " — ");
}
