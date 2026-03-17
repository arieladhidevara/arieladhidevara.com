"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InteractiveSection } from "@/components/interactive/interactive-section";

type SequenceFrame = {
  id: string;
  label: string;
  note: string;
};

type MediaSequenceProps = {
  kicker: string;
  title: string;
  description: string;
  frames: SequenceFrame[];
};

export function MediaSequence({ kicker, title, description, frames }: MediaSequenceProps) {
  const [activeId, setActiveId] = useState(frames[0]?.id ?? "");
  const [open, setOpen] = useState(false);

  const activeFrame = frames.find((frame) => frame.id === activeId) ?? frames[0];

  return (
    <InteractiveSection kicker={kicker} title={title} description={description}>
      <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="media-integrated relative h-[340px] rounded-card text-left transition-transform duration-300 hover:-translate-y-1"
        >
          <div className="absolute inset-0 rounded-[inherit] bg-soft-grid bg-[size:18px_18px] opacity-20" />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFrame?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex h-full flex-col justify-end p-6"
            >
              <p className="kicker">Layer Preview</p>
              <h4 className="mt-2 text-2xl font-semibold text-[#141921]">{activeFrame?.label}</h4>
              <p className="mt-2 max-w-[30ch] text-sm text-[#596173]">{activeFrame?.note}</p>
            </motion.div>
          </AnimatePresence>
        </button>

        <div className="space-y-3">
          {frames.map((frame, index) => {
            const isActive = frame.id === activeId;
            return (
              <button
                key={frame.id}
                type="button"
                onMouseEnter={() => setActiveId(frame.id)}
                onFocus={() => setActiveId(frame.id)}
                onClick={() => setActiveId(frame.id)}
                className={
                  isActive
                    ? "w-full rounded-soft bg-black/[0.1] px-4 py-3 text-left text-[#202733]"
                    : "w-full rounded-soft bg-black/[0.04] px-4 py-3 text-left text-[#495162]"
                }
              >
                <p className="text-[10px] uppercase tracking-[0.16em]">Frame {index + 1}</p>
                <p className="mt-1 text-sm font-medium">{frame.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-[#f0f2f5]/95 p-6 backdrop-blur-sm"
          >
            <div className="mx-auto flex h-full max-w-layout flex-col">
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-black/[0.08] px-4 py-2 text-xs tracking-[0.12em] text-[#343c4b]"
                >
                  Close
                </button>
              </div>

              <div className="media-integrated relative flex-1 rounded-card p-8">
                <div className="absolute inset-0 rounded-[inherit] bg-soft-grid bg-[size:20px_20px] opacity-18" />
                <div className="relative flex h-full items-end">
                  <div className="max-w-3xl">
                    <p className="kicker">Fullscreen View</p>
                    <h4 className="mt-3 text-4xl font-semibold text-[#11161d]">{activeFrame?.label}</h4>
                    <p className="mt-3 text-base text-[#555d6d]">{activeFrame?.note}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </InteractiveSection>
  );
}

