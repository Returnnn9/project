export const SPRING_CONFIGS = {
  smooth: { type: 'spring' as const, damping: 32, stiffness: 160 },
  snappy: { type: 'spring' as const, damping: 40, stiffness: 280 },
  bouncy: { type: 'spring' as const, damping: 20, stiffness: 300 },
} as const;

export const DURATION = { fast: 0.15, normal: 0.25, slow: 0.4 } as const;

export const EASING = {
  premium: [0.16, 1, 0.3, 1] as const,
  ease: [0.4, 0, 0.2, 1] as const,
};

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: SPRING_CONFIGS.smooth,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: DURATION.fast },
  },
};

export const stepVariants = {
  initial: { opacity: 0, x: 40, scale: 0.98 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      damping: 35,
      stiffness: 180,
    },
  },
  exit: {
    opacity: 0,
    x: -40,
    scale: 0.98,
    transition: {
      duration: DURATION.normal,
      ease: EASING.ease,
    },
  },
};
