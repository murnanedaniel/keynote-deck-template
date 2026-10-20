"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SCENES } from "@/lib/timeline";
import { useKeyboard } from "@/lib/useKeyboard";
import { useElapsed } from "@/lib/useElapsed";
import { PresenterClock } from "./PresenterClock";
import { SCENE_COMPONENTS } from "@/lib/sceneRegistry";

export function Stage() {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  // Presenter clock + reset button hidden by default (press P to reveal).
  const [clockVisible, setClockVisible] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [running, setRunning] = useState(false);

  const { elapsed, reset } = useElapsed(running);

  // Deep-link: ?scene=<id> or ?s=<index> jumps straight to a scene on load,
  // and &step=<n> to a reveal step (used by scripts/shoot.mjs).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const byId = params.get("scene");
    const byIdx = params.get("s");
    let idx = -1;
    if (byId) idx = SCENES.findIndex((s) => s.id === byId);
    else if (byIdx) idx = parseInt(byIdx, 10);
    if (idx >= 0 && idx < SCENES.length) {
      const step = parseInt(params.get("step") ?? "0", 10);
      // The URL only exists in the browser, after the static page hydrates,
      // so this one-off sync from the URL has to happen in an effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSceneIdx(idx);
      setStepIdx(Number.isFinite(step) ? Math.min(Math.max(step, 0), SCENES[idx].steps - 1) : 0);
    }
  }, []);

  const scene = SCENES[sceneIdx];

  const advance = useCallback(() => {
    setRunning(true);
    const current = SCENES[sceneIdx];
    if (stepIdx < current.steps - 1) {
      setStepIdx(stepIdx + 1);
      return;
    }
    if (sceneIdx < SCENES.length - 1) {
      setSceneIdx(sceneIdx + 1);
      setStepIdx(0);
    }
  }, [sceneIdx, stepIdx]);

  const rewind = useCallback(() => {
    if (stepIdx > 0) {
      setStepIdx(stepIdx - 1);
      return;
    }
    if (sceneIdx > 0) {
      const prev = SCENES[sceneIdx - 1];
      setSceneIdx(sceneIdx - 1);
      setStepIdx(Math.max(0, prev.steps - 1));
    }
  }, [sceneIdx, stepIdx]);

  const restart = useCallback(() => {
    setSceneIdx(0);
    setStepIdx(0);
    setRunning(false);
    reset();
  }, [reset]);

  useKeyboard({
    onAdvance: advance,
    onRewind: rewind,
    onToggleClock: () => setClockVisible((v) => !v),
    onToggleFallback: () => setFallback((v) => !v),
    onRestart: restart,
  });

  const rendered = useMemo(() => {
    const Comp = SCENE_COMPONENTS[scene.id];
    return <Comp key={scene.id} step={stepIdx} onAdvance={advance} />;
  }, [scene, stepIdx, advance]);

  return (
    <motion.div
      className="relative w-screen h-screen overflow-hidden cursor-pointer select-none theme-light"
      onClick={advance}
      role="button"
      tabIndex={0}
      data-scene={scene.id}
      data-step={stepIdx}
      animate={{ backgroundColor: "#f6f1e7" }}
      transition={{ duration: 1.2, ease: [0.65, 0, 0.3, 1] }}
    >
      <AnimatePresence mode="wait">{rendered}</AnimatePresence>

      {clockVisible && (
        <button
          type="button"
          aria-label="Restart from the beginning"
          onClick={(e) => {
            e.stopPropagation();
            restart();
          }}
          className="fixed top-4 right-4 z-50 h-9 px-3 flex items-center gap-1.5 rounded-full backdrop-blur border text-[11px] font-mono transition bg-white/60 hover:bg-white/80 border-ink/10 text-ink/70"
        >
          <span className="text-sm leading-none">↺</span>
          <span>reset</span>
        </button>
      )}

      {clockVisible && (
        <PresenterClock
          elapsed={elapsed}
          sceneIdx={sceneIdx}
          stepIdx={stepIdx}
          total={SCENES.length}
          fallback={fallback}
          running={running}
        />
      )}

      {/* Talk mode is a clean canvas: hide the Next.js dev indicator unless
          the presenter clock is showing. */}
      {!clockVisible && <style>{`nextjs-portal { display: none !important; }`}</style>}
    </motion.div>
  );
}
