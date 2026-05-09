/**
 * Shared Framer Motion animation variants.
 * Import from here instead of copy-pasting into each modal.
 */

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      damping: 30,
      stiffness: 150,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.2 },
  },
}

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
      duration: 0.6,
    },
  },
  exit: {
    opacity: 0,
    x: -40,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: 'easeInOut' as const,
    },
  },
}
