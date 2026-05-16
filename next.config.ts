import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://mapgl.2gis.com https://api-maps.yandex.ru https://suggest-maps.yandex.ru https://yastatic.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://mapgl.2gis.com",
      "font-src 'self' https://fonts.gstatic.com https://mapgl.2gis.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://img.freepik.com https://*.tile.openstreetmap.org https://*.2gis.com https://*.maps.2gis.com https://*.yandex.ru https://*.yandex.net https://*.smislest.ru https://smislest.ru",
      "connect-src 'self' https://nominatim.openstreetmap.org https://restcountries.eu https://*.2gis.com wss://*.2gis.com https://*.maps.2gis.com wss://*.maps.2gis.com https://styles.2gis.com https://*.yandex.ru https://*.yandex.net wss://*.yandex.ru wss://*.yandex.net https://admin.smislest.ru https://smislest.ru",
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      "frame-src 'none' https://yandex.ru",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.freepik.com",
      },
      {
        protocol: "https",
        hostname: "smislest.ru",
      },
      {
        protocol: "https",
        hostname: "admin.smislest.ru",
      },
      {
        protocol: "https",
        hostname: "*.smislest.ru",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
