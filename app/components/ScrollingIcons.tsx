"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import styles from "./ScrollingIcons.module.css";

export default function ScrollingIcons() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { scrollY } = useScroll();

  // Config for buttery smooth inertia physics
  const springConfig = { damping: 50, stiffness: 180, mass: 0.5 };
  const smoothScrollY = useSpring(scrollY, springConfig);

  // Transform absolute scroll position to horizontal offset transforms for parallax response
  // Row 1 and 3 speed up leftward as you scroll, Row 2 accelerates rightward
  const transformX1 = useTransform(smoothScrollY, [0, 3000], [0, -400]);
  const transformX2 = useTransform(smoothScrollY, [0, 3000], [0, 400]);
  const transformX3 = useTransform(smoothScrollY, [0, 3000], [0, -320]);

  if (!isMounted) {
    return <div className="h-64 bg-[#93a88f] pointer-events-none" />;
  }

  const row1Content = Array(6).fill(null);
  const row2Content = Array(6).fill(null);
  const row3Content = Array(6).fill(null);

  return (
    <section className={styles.section} aria-label="Декоративная бегущая строка">
      <div className={styles.rows}>
        {/* РЯД 1: СОЗДАЁМ счастливый и добрый МИР */}
        <div className={styles.row}>
          <motion.div style={{ x: transformX1 }} className={styles.parallaxWrapper}>
            <div className={`${styles.track} ${styles.animateLeft}`}>
              {row1Content.map((_, idx) => (
                <div key={`row1-${idx}`} className={styles.item}>
                  <span className={styles.sansWord}>СОЗДАЁМ</span>
                  <span className={styles.scriptWord}>счастливый и добрый</span>
                  <span className={styles.sansWord}>МИР</span>
                </div>
              ))}
              {row1Content.map((_, idx) => (
                <div key={`row1-dup-${idx}`} className={styles.item}>
                  <span className={styles.sansWord}>СОЗДАЁМ</span>
                  <span className={styles.scriptWord}>счастливый и добрый</span>
                  <span className={styles.sansWord}>МИР</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* РЯД 2: НАПОЛНЕННЫЙ тёплыми МОМЕНТАМИ */}
        <div className={styles.row}>
          <motion.div style={{ x: transformX2 }} className={styles.parallaxWrapper}>
            <div className={`${styles.track} ${styles.animateRight}`}>
              {row2Content.map((_, idx) => (
                <div key={`row2-${idx}`} className={styles.item}>
                  <span className={styles.sansWord}>НАПОЛНЕННЫЙ</span>
                  <span className={styles.scriptWord}>тёплыми</span>
                  <span className={styles.sansWord}>МОМЕНТАМИ</span>
                </div>
              ))}
              {row2Content.map((_, idx) => (
                <div key={`row2-dup-${idx}`} className={styles.item}>
                  <span className={styles.sansWord}>НАПОЛНЕННЫЙ</span>
                  <span className={styles.scriptWord}>тёплыми</span>
                  <span className={styles.sansWord}>МОМЕНТАМИ</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* РЯД 3: любимыми ВКУСАМИ И */}
        <div className={styles.row}>
          <motion.div style={{ x: transformX3 }} className={styles.parallaxWrapper}>
            <div className={`${styles.track} ${styles.animateLeft}`}>
              {row3Content.map((_, idx) => (
                <div key={`row3-${idx}`} className={styles.item}>
                  <span className={styles.scriptWord}>любимыми</span>
                  <span className={styles.sansWord}>ВКУСАМИ</span>
                  <span className={styles.sansWord}>И</span>
                </div>
              ))}
              {row3Content.map((_, idx) => (
                <div key={`row3-dup-${idx}`} className={styles.item}>
                  <span className={styles.scriptWord}>любимыми</span>
                  <span className={styles.sansWord}>ВКУСАМИ</span>
                  <span className={styles.sansWord}>И</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
