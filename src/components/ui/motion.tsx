import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useEffect, useState, useRef, type ReactNode } from "react";

// ─── Spring presets ─────────────────────────────────────────────
export const spring = {
  gentle: { type: "spring" as const, stiffness: 120, damping: 14 },
  snappy: { type: "spring" as const, stiffness: 300, damping: 20 },
  bouncy: { type: "spring" as const, stiffness: 400, damping: 10 },
  slow:   { type: "spring" as const, stiffness: 80,  damping: 20 },
};

// ─── Variant presets ────────────────────────────────────────────
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

export const fadeSlideUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: spring.gentle },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export const fadeSlideRight: Variants = {
  hidden:  { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: spring.gentle },
  exit:    { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: spring.snappy },
  exit:    { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

export const staggerContainer: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: spring.gentle },
};

// ─── Page transition wrapper ────────────────────────────────────
export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeSlideUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Stagger container ──────────────────────────────────────────
export function StaggerContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Stagger item ───────────────────────────────────────────────
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Scroll-triggered reveal ────────────────────────────────────
export function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ ...spring.gentle, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Animated counter ───────────────────────────────────────────
export function AnimatedCounter({
  value,
  className,
  duration = 1.2,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return <span className={className}>{display}</span>;
}

// ─── Hover lift card ────────────────────────────────────────────
export function HoverCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}
      whileTap={{ scale: 0.98 }}
      transition={spring.snappy}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Animated expand/collapse ───────────────────────────────────
export function AnimatedCollapse({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ ...spring.gentle, opacity: { duration: 0.2 } }}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Pulse on critical status ───────────────────────────────────
export function PulseBadge({
  children,
  pulse = false,
  className,
}: {
  children: ReactNode;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <motion.span
      animate={pulse ? { scale: [1, 1.05, 1] } : {}}
      transition={pulse ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : {}}
      className={className}
    >
      {children}
    </motion.span>
  );
}

export { motion, AnimatePresence };
