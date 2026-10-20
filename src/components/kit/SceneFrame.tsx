"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

// Every scene renders inside a SceneFrame. It owns the three layout regions
// so no scene can drift: a header (one-line headline), the visual (takes all
// remaining height and clips rather than pushing into the header), and a
// footer line for the source. Scenes that need a full-bleed canvas (title,
// quote) pass bare and lay out their own children.

type Props = {
  headline?: ReactNode;
  source?: ReactNode;
  bare?: boolean;
  texture?: "grid" | "none";
  children: ReactNode;
};

export function SceneFrame({ headline, source, bare = false, texture = "grid", children }: Props) {
  return (
    <motion.section
      className={`absolute inset-0 overflow-hidden text-fg ${texture === "grid" ? "canvas-grid paper-grid vignette" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.7 } }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
    >
      {bare ? (
        children
      ) : (
        <div className="absolute inset-0 flex flex-col px-[5vw] pt-[6vh] pb-[5vh]">
          <header data-region="header" className="shrink-0">
            {headline && <h1 className="t-headline whitespace-nowrap">{headline}</h1>}
          </header>
          <div data-region="visual" className="relative flex-1 min-h-0 mt-[4vh] overflow-hidden">
            {children}
          </div>
          {source && (
            <footer data-region="source" className="shrink-0 mt-[2vh] t-source">
              {source}
            </footer>
          )}
        </div>
      )}
    </motion.section>
  );
}
