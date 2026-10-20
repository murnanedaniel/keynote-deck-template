"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SceneFrame } from "@/components/kit/SceneFrame";

// Labels are pre-broken into lines: SVG text does not wrap, and a label wider
// than its box is the most common diagram defect.
const stages = [["hypothesis"], ["test", "written first"], ["run"], ["check against", "baseline"]];
const captions = [
  "State what you expect to see, and why.",
  "Write the number the run must reproduce before it starts.",
  "Run the smallest version that can fail.",
  "Compare against the known baseline. Disagreement is the interesting part.",
];

export function DiagramScene({ step }: { step: number }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <SceneFrame headline="Write the check before you run the experiment.">
      <div className="flex h-full min-h-0 flex-col justify-center">
        <svg viewBox="0 0 1200 360" width="100%" height="auto" className="max-h-full" role="img" aria-label="A four-stage experimental workflow">
          {stages.slice(1).map((_, index) => {
            const revealAt = index + 1;
            return (
              <motion.path
                key={`arrow-${revealAt}`}
                data-reveal={revealAt}
                d={`M ${282 + index * 300} 180 H ${312 + index * 300}`}
                stroke="var(--muted)"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
                initial={false}
                animate={{ pathLength: step >= revealAt ? 1 : 0, opacity: step >= revealAt ? 1 : 0.25 }}
                transition={{ duration: 0.55 }}
              />
            );
          })}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="var(--muted)" />
            </marker>
          </defs>
          {stages.map((label, index) => {
            const active = step === index;
            const done = step > index;
            const x = 25 + index * 300;
            return (
              <g
                key={label.join(" ")}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                onClick={(event) => event.stopPropagation()}
                data-dim={(!active && !done) || undefined}
                style={{ cursor: "default", opacity: !active && !done ? 0.25 : 1 }}
              >
                <title>{label.join(" ")}</title>
                <rect
                  x={x}
                  y="115"
                  width="250"
                  height="130"
                  rx="18"
                  fill="transparent"
                  stroke={active ? "var(--accent)" : "var(--muted)"}
                  strokeWidth={active || hovered === index ? 2 : 1}
                />
                {hovered === index && (
                  <rect x={x - 7} y="108" width="264" height="144" rx="24" fill="none" stroke="var(--accent)" strokeWidth="2" opacity="0.65" />
                )}
                <text
                  x={x + 125}
                  y={182 - (label.length - 1) * 16}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={active ? "var(--fg)" : "var(--muted)"}
                  fontSize="26"
                  fontFamily="var(--font-geist-mono)"
                >
                  {label.map((line, i) => (
                    <tspan key={line} x={x + 125} dy={i === 0 ? 0 : 32}>{line}</tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="relative min-h-[3.5em] shrink-0 text-center t-body text-muted">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={step}
              data-reveal={step}
              className="absolute inset-x-0 top-0"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              {captions[step]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </SceneFrame>
  );
}
