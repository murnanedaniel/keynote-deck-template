"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

// Shows its children from reveal step `at` onwards. Space is reserved before
// the reveal, so nothing else on the scene jumps when it appears.
export function Reveal({ at, step, children, className = "", as = "div" }: {
  at: number;
  step: number;
  children: ReactNode;
  className?: string;
  as?: "div" | "span" | "p" | "li";
}) {
  const shown = step >= at;
  const M = motion[as];
  return (
    <M
      className={className}
      data-reveal={at}
      aria-hidden={!shown}
      initial={false}
      animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 8 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </M>
  );
}
