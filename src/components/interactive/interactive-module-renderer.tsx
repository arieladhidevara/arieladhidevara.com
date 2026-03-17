"use client";

import { PlaceholderInteractiveModule } from "@/lib/placeholder-data";
import { ScrollScene } from "@/components/interactive/scroll-scene";
import { ThreeSceneBlock } from "@/components/interactive/three-scene-block";
import { InteractiveDiagram } from "@/components/interactive/interactive-diagram";
import { MediaSequence } from "@/components/interactive/media-sequence";

type InteractiveModuleRendererProps = {
  module: PlaceholderInteractiveModule;
};

export function InteractiveModuleRenderer({ module }: InteractiveModuleRendererProps) {
  if (module.type === "scroll-scene") {
    return (
      <ScrollScene
        kicker={module.kicker}
        title={module.title}
        description={module.description}
        steps={module.steps}
      />
    );
  }

  if (module.type === "three-scene") {
    return (
      <ThreeSceneBlock
        kicker={module.kicker}
        title={module.title}
        description={module.description}
        conceptLabel={module.conceptLabel}
        interactionHint={module.interactionHint}
      />
    );
  }

  if (module.type === "diagram-interaction") {
    return (
      <InteractiveDiagram
        kicker={module.kicker}
        title={module.title}
        description={module.description}
        nodes={module.nodes}
      />
    );
  }

  return (
    <MediaSequence
      kicker={module.kicker}
      title={module.title}
      description={module.description}
      frames={module.frames}
    />
  );
}
