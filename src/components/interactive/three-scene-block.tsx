"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { InteractiveSection } from "@/components/interactive/interactive-section";

const LazyThreeSceneCanvas = dynamic(
  () => import("@/components/interactive/three-scene-canvas").then((mod) => mod.ThreeSceneCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="media-integrated flex h-[360px] items-end rounded-card p-6">
        <p className="text-sm text-[#5a6272]">Loading interactive scene...</p>
      </div>
    )
  }
);

type ThreeSceneBlockProps = {
  kicker: string;
  title: string;
  description: string;
  conceptLabel: string;
  interactionHint: string;
};

export function ThreeSceneBlock({
  kicker,
  title,
  description,
  conceptLabel,
  interactionHint
}: ThreeSceneBlockProps) {
  const reduceMotion = useReducedMotion();

  return (
    <InteractiveSection kicker={kicker} title={title} description={description}>
      <div className="space-y-4">
        {reduceMotion ? (
          <div className="media-integrated flex h-[320px] items-end rounded-card p-6">
            <p className="max-w-xl text-sm text-[#5a6272]">
              Interactive 3D disabled due to reduced motion preference. Static placeholder mode remains readable.
            </p>
          </div>
        ) : (
          <LazyThreeSceneCanvas conceptLabel={conceptLabel} />
        )}

        <p className="text-xs tracking-[0.08em] text-[#737b8a]">{interactionHint}</p>
      </div>
    </InteractiveSection>
  );
}
