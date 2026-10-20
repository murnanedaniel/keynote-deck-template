"use client";

import { SceneFrame } from "@/components/kit/SceneFrame";
import { Source } from "@/components/kit/Source";
import { Reveal } from "@/components/kit/Reveal";

export function QuoteScene({ step }: { step: number }) {
  return (
    <SceneFrame bare>
      <div className="absolute inset-0 flex items-center justify-center px-[8vw]">
        <div className="w-full max-w-[980px]">
          <blockquote className="t-headline" style={{ fontSize: "clamp(34px,3.6vw,68px)" }}>
            <p>The first principle is that you must not fool yourself,</p>
            <Reveal at={1} step={step} as="p">and you are the easiest person to fool.</Reveal>
          </blockquote>
          <div data-region="source" className="absolute bottom-[5vh] left-[5vw] t-source">
            <Source href="https://calteches.library.caltech.edu/51/2/CargoCult.htm">Feynman, “Cargo Cult Science”, Engineering and Science 37:7 (1974)</Source>
          </div>
          <Reveal at={1} step={step} className="mt-[2vh] text-right t-label text-faint">thank you</Reveal>
        </div>
      </div>
    </SceneFrame>
  );
}
