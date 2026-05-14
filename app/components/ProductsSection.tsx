"use client";

import ProductsCarousel from "./ProductsCarousel/ProductsCarousel";
import { typograph } from '../../lib/typograph';
import styles from "./ProductsSection.module.css";

interface Product {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  ingredients?: string;
  weight?: number | string;
  // Совмещаем с типом в ProductsCarousel и lib: Directus file, строковый id или {url}
  product_photo?: { id: string; filename_disk: string } | { url: string } | string;
}

interface ProductsSectionProps {
  initialProducts?: Product[];
}

export default function ProductsSection({ initialProducts = [] }: ProductsSectionProps) {
  return (
    <section id="products" className={styles.section}>
      {/* Заголовок в контейнере */}
      <div className={styles.container}>
        <div className={styles.titleContainer}>
          <h2 className={styles.title}>
            Наша выпечка <br />и десерты
          </h2>
        </div>
      </div>

      {/* Карусель на полную ширину без ограничений */}
      <div className={styles.carouselWrapper}>
        <ProductsCarousel initialProducts={initialProducts} />
      </div>
    </section>
  );
}