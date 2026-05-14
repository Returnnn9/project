
// Принимает проп seo (SiteSettings)
export default function StructuredData({ seo }: { seo: any }) {
  // Если seo не загружена, не рендерим schema.org скрипты
  if (!seo) {
    return null;
  }

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "name": seo.business_name,
    "description": seo.default_description,
    "url": seo.site_url,
    "telephone": seo.business_phone,
    "email": seo.business_email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": seo.business_address,
      "addressLocality": seo.business_city,
      "postalCode": seo.business_postal_code,
      "addressCountry": "RU"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": seo.geo_latitude,
      "longitude": seo.geo_longitude
    },
    "openingHoursSpecification": seo.opening_hours,
    "priceRange": seo.price_range,
    "servesCuisine": seo.serves_cuisine,
    "menu": `${seo.site_url}/#products`,
    "image": seo.og_image_url,
    "logo": seo.og_image_url,
    "sameAs": [seo.social_telegram, seo.social_instagram, seo.social_vk].filter(Boolean)
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": seo.business_name,
    "legalName": seo.business_name,
    "url": seo.site_url,
    "logo": seo.og_image_url,
    "description": seo.default_description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": seo.business_address,
      "addressLocality": seo.business_city,
      "postalCode": seo.business_postal_code,
      "addressCountry": "RU"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": seo.business_phone,
      "contactType": "customer service",
      "email": seo.business_email,
      "availableLanguage": "Russian"
    },
    "sameAs": [seo.social_telegram, seo.social_instagram, seo.social_vk].filter(Boolean)
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Главная",
        "item": seo.site_url
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
