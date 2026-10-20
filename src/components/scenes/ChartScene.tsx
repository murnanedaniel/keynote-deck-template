"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { SceneFrame } from "@/components/kit/SceneFrame";
import { Reveal } from "@/components/kit/Reveal";
import { Source } from "@/components/kit/Source";
import { HIGGS_MASS } from "@/data/higgsMass";

const domain = { min: 124.6, max: 125.8 };
const plot = { left: 350, right: 900, top: 36, bottom: 278 };
const ticks = [124.8, 125.0, 125.2, 125.4, 125.6];
const x = (value: number) => plot.left + ((value - domain.min) / (domain.max - domain.min)) * (plot.right - plot.left);

export function ChartScene({ step }: { step: number }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <SceneFrame
      headline="We know the Higgs mass to one part in a thousand."
      source={<Source>ATLAS + CMS, PRL 114 (2015) 191803 · CMS, PLB 805 (2020) 135425 · ATLAS, PRL 131 (2023) 251802</Source>}
    >
      <div className="flex h-full min-h-0 flex-col">
        <svg viewBox="0 0 1200 350" width="100%" height="auto" className="min-h-0 flex-1" role="img" aria-label="Higgs boson mass measurements with uncertainties">
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={x(tick)} x2={x(tick)} y1={plot.top} y2={plot.bottom} stroke="var(--muted)" strokeWidth="1" opacity="0.25" />
              <text x={x(tick)} y="310" textAnchor="middle" fill="var(--muted)" fontSize="20" fontFamily="var(--font-geist-mono)">{tick.toFixed(1)}</text>
            </g>
          ))}
          <text x={(plot.left + plot.right) / 2} y="342" textAnchor="middle" fill="var(--muted)" fontSize="20" fontFamily="var(--font-geist-mono)">
            m<tspan baselineShift="sub" fontSize="16">H</tspan> (GeV)
          </text>
          {HIGGS_MASS.map((measurement, index) => {
            const y = 78 + index * 88;
            const low = x(measurement.value - measurement.err);
            const high = x(measurement.value + measurement.err);
            const centre = x(measurement.value);
            return (
              <motion.g
                key={measurement.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.12, duration: 0.5 }}
              >
                {index === HIGGS_MASS.length - 1 && (
                  <motion.rect
                    data-reveal={1}
                    x="12"
                    y={y - 33}
                    width="1170"
                    height="66"
                    rx="12"
                    fill="var(--accent)"
                    initial={false}
                    animate={{ opacity: step >= 1 ? 0.09 : 0 }}
                  />
                )}
                <a href={measurement.href} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>
                  <g
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={(event) => event.stopPropagation()}
                    style={{ cursor: "pointer" }}
                  >
                    <text x="18" y={y + 7} fill="var(--fg)" fontSize="22" fontFamily="var(--font-geist-sans)">{measurement.label}</text>
                    <line x1={low} x2={high} y1={y} y2={y} stroke="var(--accent)" strokeWidth="2" />
                    <line x1={low} x2={low} y1={y - 10} y2={y + 10} stroke="var(--accent)" strokeWidth="2" />
                    <line x1={high} x2={high} y1={y - 10} y2={y + 10} stroke="var(--accent)" strokeWidth="2" />
                    <circle cx={centre} cy={y} r="7" fill="var(--accent)" />
                    <text x={high + 16} y={y + 7} fill="var(--muted)" fontSize="20" fontFamily="var(--font-geist-mono)">
                      {measurement.value.toFixed(2)} ± {measurement.err.toFixed(2)}
                    </text>
                    {hovered === index && (
                      <g onClick={(event) => event.stopPropagation()}>
                        <rect x="720" y={y - 48} width="465" height="60" rx="10" fill="var(--canvas)" stroke="var(--accent)" strokeWidth="1.5" />
                        <text x="738" y={y - 23} fill="var(--fg)" fontSize="18" fontFamily="var(--font-geist-mono)">
                          {measurement.value.toFixed(2)} ± {measurement.err.toFixed(2)} GeV
                        </text>
                        <text x="738" y={y - 2} fill="var(--muted)" fontSize="14" fontFamily="var(--font-geist-mono)">{measurement.source}</text>
                      </g>
                    )}
                  </g>
                </a>
              </motion.g>
            );
          })}
        </svg>
        <Reveal at={1} step={step} className="t-body min-h-[1.5em] shrink-0 text-center">
          Uncertainty halved between 2015 and 2023: ±0.24 → ±0.11 GeV.
        </Reveal>
        <table className="sr-only">
          <caption>Higgs boson mass measurements</caption>
          <thead><tr><th>Label</th><th>Experiment</th><th>Value in GeV</th><th>Uncertainty in GeV</th><th>Year</th><th>Source</th></tr></thead>
          <tbody>
            {HIGGS_MASS.map((measurement) => (
              <tr key={measurement.label}>
                <td>{measurement.label}</td><td>{measurement.experiment}</td><td>{measurement.value}</td><td>{measurement.err}</td><td>{measurement.year}</td>
                <td><a href={measurement.href} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>{measurement.source}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SceneFrame>
  );
}
