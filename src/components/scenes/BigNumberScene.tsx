"use client";

import { SceneFrame } from "@/components/kit/SceneFrame";
import { Reveal } from "@/components/kit/Reveal";
import { Source } from "@/components/kit/Source";

export function BigNumberScene({ step }: { step: number }) {
  return (
    <SceneFrame
      headline="Collisions outpace human attention."
      source={<Source>25 ns bunch spacing, CERN-2020-010 · first-level rate, ATLAS-TDR-029</Source>}
    >
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="t-display text-fg">40 million</div>
        <div className="t-body mt-[1.5vh] text-muted">proton bunch crossings per second at the LHC</div>
        <Reveal at={1} step={step} className="mt-[4vh] flex items-baseline justify-center gap-[1.2vw]">
          <span className="t-headline text-accent">1 million</span>
          <span className="t-body text-muted">per second kept by the HL-LHC ATLAS first-level trigger</span>
        </Reveal>
      </div>
    </SceneFrame>
  );
}
