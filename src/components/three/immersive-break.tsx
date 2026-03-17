"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function ImmersiveBreak() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const yMain = useTransform(scrollYProgress, [0, 1], [48, -48]);
  const yAlt = useTransform(scrollYProgress, [0, 1], [-18, 36]);
  const opacity = useTransform(scrollYProgress, [0.1, 0.45, 0.8], [0.32, 1, 0.45]);

  return (
    <div ref={ref} className="tone-layer relative h-[70vh] overflow-hidden rounded-card">
      <motion.div
        style={{ y: yMain, opacity }}
        className="absolute -left-14 top-12 h-80 w-80 rounded-full bg-gradient-to-br from-[#dde2eb] to-transparent blur-3xl"
      />
      <motion.div
        style={{ y: yAlt, opacity }}
        className="absolute -right-14 bottom-8 h-72 w-72 rounded-full bg-gradient-to-br from-[#ccd3df] to-transparent blur-3xl"
      />

      <div className="absolute inset-0 rounded-[inherit] bg-soft-grid bg-[size:20px_20px] opacity-[0.18]" />

      <div className="relative flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="kicker">Spatial Interlude</p>
        <h3 className="display-type max-w-3xl text-3xl font-semibold leading-tight text-[#141921] md:text-5xl">
          A quiet pause between chapters of the portfolio.
        </h3>
        <p className="max-w-xl text-sm leading-relaxed text-[#5a6272] md:text-base">
          Scroll-linked depth and restrained movement create a reflective transition before the next body of work.
        </p>
      </div>
    </div>
  );
}
