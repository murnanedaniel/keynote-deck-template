// The storyboard. One row per scene, in talk order. This file is the single
// source of truth for order, theme, number of reveal steps and time budget.
//
// steps: how many times the presenter presses → before the next scene.
//        Every step must change something visible (see CHECKLIST.md).
// Light theme only. Section names and timing belong in the presenter view.
// line:  the one sentence you say on this scene. Write it before building it.

export type Theme = "light";

export type Scene = {
  id: string;
  label: string;
  part: string;
  theme: Theme;
  steps: number;
  startSec: number;
  endSec: number;
  line: string;
};

export const SCENES = [
  { id: "title",      label: "Title",              part: "open",     theme: "light", steps: 1, startSec: 0,   endSec: 30,  line: "Who I am and what this talk is about." },
  { id: "bigNumber",  label: "One number",         part: "problem",  theme: "light",  steps: 2, startSec: 30,  endSec: 90,  line: "The problem in one number, then what it is compared against." },
  { id: "diagram",    label: "How it works",       part: "method",   theme: "light",  steps: 4, startSec: 90,  endSec: 210, line: "The mechanism, one stage per click." },
  { id: "chart",      label: "The evidence",       part: "result",   theme: "light",  steps: 2, startSec: 210, endSec: 330, line: "The measurement, with its source, then the one point that matters." },
  { id: "comparison", label: "Before and after",   part: "result",   theme: "light", steps: 2, startSec: 330, endSec: 420, line: "Two ways of working, side by side." },
  { id: "quote",      label: "Close",              part: "close",    theme: "light", steps: 2, startSec: 420, endSec: 480, line: "The takeaway in one sentence, then thank you." },
] as const satisfies readonly Scene[];

export type SceneId = (typeof SCENES)[number]["id"];

export const TOTAL_SEC = SCENES[SCENES.length - 1].endSec;

export function formatMMSS(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
