export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (typeof window === "undefined") {
    if (process.env.NEXTAUTH_URL) {
      return process.env.NEXTAUTH_URL.replace(/\/$/, "");
    }
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
  }

  return "https://smislest.ru";
}
