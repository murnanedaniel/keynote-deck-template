import type { ReactElement } from "react";
import type { SceneId } from "@/lib/timeline";
import { TitleScene } from "@/components/scenes/TitleScene";
import { BigNumberScene } from "@/components/scenes/BigNumberScene";
import { DiagramScene } from "@/components/scenes/DiagramScene";
import { ChartScene } from "@/components/scenes/ChartScene";
import { ComparisonScene } from "@/components/scenes/ComparisonScene";
import { QuoteScene } from "@/components/scenes/QuoteScene";

export type SceneComponent = (props: { step: number; onAdvance?: () => void }) => ReactElement;

// Single source of truth for SceneId → component. A missing entry is a type
// error, so a scene cannot be added to the timeline without a component.
export const SCENE_COMPONENTS: Record<SceneId, SceneComponent> = {
  title: TitleScene,
  bigNumber: BigNumberScene,
  diagram: DiagramScene,
  chart: ChartScene,
  comparison: ComparisonScene,
  quote: QuoteScene,
};
