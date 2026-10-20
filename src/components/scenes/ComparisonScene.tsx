"use client";

import { motion } from "motion/react";
import { SceneFrame } from "@/components/kit/SceneFrame";
import { Reveal } from "@/components/kit/Reveal";

const read = ["a title naming the topic", "three sentences under it", "the figure added last"];
const seen = ["a headline stating the claim", "one figure, revealed in steps", "a citation in the corner"];

export function ComparisonScene({ step }: { step: number }) {
  return (
    <SceneFrame headline="Show the claim so the audience can see it.">
      <div className="grid h-full grid-cols-2 items-center">
        <motion.div
          data-reveal={1}
          className="grid grid-rows-[auto_repeat(3,auto)] gap-y-[3vh] pr-[5vw]"
          initial={false}
          data-dim={step >= 1 || undefined}
          animate={{ opacity: step >= 1 ? 0.55 : 1 }}
          transition={{ duration: 0.45 }}
        >
          <div className="t-label text-faint">read</div>
          {read.map((row) => <div key={row} className="t-body">{row}</div>)}
        </motion.div>
        <Reveal at={1} step={step} className="grid grid-rows-[auto_repeat(3,auto)] gap-y-[3vh] border-l border-[var(--faint)] pl-[5vw]">
          <div className="t-label text-accent">seen</div>
          {seen.map((row) => <div key={row} className="t-body">{row}</div>)}
        </Reveal>
      </div>
    </SceneFrame>
  );
}
