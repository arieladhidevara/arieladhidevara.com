"use client";

import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { InteractiveSection } from "@/components/interactive/interactive-section";

type ScrollSceneStep = {
  id: string;
  heading: string;
  copy: string;
  visualLabel: string;
};

type ScrollSceneProps = {
  kicker: string;
  title: string;
  description: string;
  steps: ScrollSceneStep[];
};

export function ScrollScene({ kicker, title, description, steps }: ScrollSceneProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll();
  const progressScale = useTransform(scrollYProgress, [0, 1], [0.1, 1]);

  return (
    <InteractiveSection kicker={kicker} title={title} description={description}>
      <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:gap-10">
        <div className="space-y-7">
          {steps.map((step, index) => (
            <motion.article
              key={step.id}
              onViewportEnter={() => setActiveIndex(index)}
              initial={{ opacity: 0.55, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-24% 0px -36% 0px", amount: 0.35 }}
              transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
              className="tone-layer rounded-soft p-5 md:p-6"
            >
              <p className="kicker">Step {index + 1}</p>
              <h4 className="mt-2 text-lg font-medium text-[#1a1f27]">{step.heading}</h4>
              <p className="mt-2 text-sm leading-relaxed text-[#5a6272]">{step.copy}</p>
            </motion.article>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="media-integrated relative overflow-hidden rounded-card p-7 md:p-8">
            <div className="absolute inset-0 rounded-[inherit] bg-soft-grid bg-[size:18px_18px] opacity-15" />
            <motion.div
              style={{ scaleX: progressScale }}
              className="absolute left-0 right-0 top-0 h-[2px] origin-left bg-[#404855]/20"
            />

            <div className="relative space-y-4">
              <p className="kicker">Pinned Visual State</p>
              <motion.h4
                key={`heading-${steps[activeIndex]?.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="text-xl font-semibold text-[#181d25]"
              >
                {steps[activeIndex]?.heading}
              </motion.h4>

              <motion.p
                key={`visual-${steps[activeIndex]?.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-sm text-[#586071]"
              >
                {steps[activeIndex]?.visualLabel}
              </motion.p>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={
                      index === activeIndex
                        ? "h-1.5 rounded-full bg-[#1d232d]/55"
                        : "h-1.5 rounded-full bg-[#1d232d]/14"
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </InteractiveSection>
  );
}

