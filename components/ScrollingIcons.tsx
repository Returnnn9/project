"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ScrollingIcons.module.css";

export default function ScrollingIcons() {
  const sectionRef = useRef<HTMLElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const row3Ref = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const pos1 = useRef(0);
  const pos2 = useRef(0);
  const pos3 = useRef(0);
  const target1 = useRef(0);
  const target2 = useRef(0);
  const target3 = useRef(0);
  const offset1 = useRef(0);
  const offset2 = useRef(0);
  const offset3 = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsActive(entry.isIntersecting);
      },
      { root: null, threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const updateTargets = () => {
      const y = window.scrollY;
      const isMobile = window.innerWidth < 768;
      const base = reduceMotion ? 0.1 : 1;
      const boost = 1.2; // чуть быстрее
      const s1 = (isMobile ? 0.35 : 0.55) * base * boost;
      const s2 = (isMobile ? 0.3 : 0.5) * base * boost;
      const s3 = (isMobile ? 0.4 : 0.6) * base * boost;
      target1.current = y * s1;
      target2.current = y * s2;
      target3.current = y * s3;

      // Вычисляем смещения строк один раз при resize
      const w1 = row1Ref.current?.offsetWidth || 0;
      const w2 = row2Ref.current?.offsetWidth || 0;
      const w3 = row3Ref.current?.offsetWidth || 0;
      offset1.current = isMobile ? w1 * 0.1 : w1 * 0.2;
      offset2.current = isMobile ? 0 : w2 * 0.1;
      offset3.current = w3 * 0.1;
    };

    const smooth = () => {
      const k = 0.12; // инерция
      pos1.current += (target1.current - pos1.current) * k;
      pos2.current += (target2.current - pos2.current) * k;
      pos3.current += (target3.current - pos3.current) * k;
      if (row1Ref.current) row1Ref.current.style.backgroundPosition = `${offset1.current - pos1.current}px 50%`;
      if (row2Ref.current) row2Ref.current.style.backgroundPosition = `${offset2.current + pos2.current}px 50%`;
      if (row3Ref.current) row3Ref.current.style.backgroundPosition = `${offset3.current - pos3.current}px 50%`;
      rafId.current = requestAnimationFrame(smooth);
    };

    updateTargets();
    smooth();
    window.addEventListener("scroll", updateTargets, { passive: true });
    window.addEventListener("resize", updateTargets, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateTargets);
      window.removeEventListener("resize", updateTargets);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = null;
    };
  }, [reduceMotion, isActive]);

  const paused = !isActive;

  return (
    <section ref={sectionRef} className={styles.section} aria-hidden="true">
      <div className={styles.rows}>
        <div ref={row1Ref} className={`${styles.row} ${styles.row1} ${paused ? styles.paused : ""}`} />
        <div ref={row2Ref} className={`${styles.row} ${styles.row2} ${paused ? styles.paused : ""}`} />
        <div ref={row3Ref} className={`${styles.row} ${styles.row3} ${paused ? styles.paused : ""}`} />
      </div>
    </section>
  );
}
