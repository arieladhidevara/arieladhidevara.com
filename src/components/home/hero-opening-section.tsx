"use client";

import { useEffect, useRef, useState } from "react";
import { HeroScene } from "@/components/three/hero-scene";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

export function HeroOpeningSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [copyProgress, setCopyProgress] = useState(0);
  const [chatScrollProgress, setChatScrollProgress] = useState(0);
  const textProgress = clamp(copyProgress);
  const textOpacity = clamp(textProgress);
  const introRevealProgress = clamp((textProgress - 0.18) / 0.38, 0, 1);
  const collapseProgress = clamp((chatScrollProgress - 0.05) / 0.63, 0, 1);
  const vanishProgress = clamp((chatScrollProgress - 0.72) / 0.18, 0, 1);
  const dockProgress = clamp((chatScrollProgress - 0.78) / 0.16, 0, 1);
  const cardContentOpacity = 1 - clamp((collapseProgress - 0.08) / 0.34, 0, 1);
  const miniGlyphOpacity = clamp((collapseProgress - 0.52) / 0.28, 0, 1) * (1 - vanishProgress * 0.72);
  const collapseRadius = 16 - collapseProgress * 13;
  const clipRightPercent = (1 - introRevealProgress) * 100 + introRevealProgress * (collapseProgress * 100);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;

    const update = () => {
      rafId = null;
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const nextProgress = clamp(-rect.top / Math.max(rect.height * 0.95, 1), 0, 1);

      setChatScrollProgress((prev) => (Math.abs(prev - nextProgress) < 0.002 ? prev : nextProgress));
    };

    const scheduleUpdate = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(update);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (rafId != null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative h-full w-full overflow-hidden">
      <HeroScene onOverlayProgress={setCopyProgress} />

      <div
        className={`absolute inset-0 z-40 flex items-center ${
          textProgress > 0.2 ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{ opacity: textOpacity }}
      >
        <div className="mx-auto w-full max-w-layout px-6 md:px-10">
          <h1 className="display-type mt-6 max-w-5xl text-4xl font-bold leading-[1.02] text-[#121418] md:text-7xl">
            Welcome to Ariel&apos;s Experiential Portfolio.
          </h1>
          <p className="editorial-copy mt-7 text-sm text-[#4c5360] md:text-base">
            A multidisciplinary body of work across interactive systems, AI software, architecture, objects, and visual
            storytelling, presented through a calm editorial framework.
          </p>

          <div
            className="relative mt-8 w-full max-w-3xl overflow-hidden border border-white/22 bg-black/[0.28] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_18px_38px_-30px_rgba(8,11,17,0.64)] backdrop-blur-[16px] md:p-5"
            style={{
              borderRadius: `${collapseRadius}px`,
              opacity: 1 - vanishProgress * 0.94,
              clipPath: `inset(0 ${clipRightPercent}% 0 0 round ${collapseRadius}px)`,
              willChange: "clip-path, opacity"
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_0%,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0)_52%),linear-gradient(150deg,rgba(18,24,32,0.06)_0%,rgba(5,8,12,0.32)_100%)]"
            />

            <div className="relative z-10" style={{ opacity: cardContentOpacity }}>
              <div className="text-sm text-[#d0d6e0] md:text-base">Ask anything about Ariel or Ariel&apos;s works.</div>
              <div className="mt-4 flex items-center gap-3 rounded-full border border-black/[0.08] bg-white/[0.76] px-4 py-2.5 backdrop-blur-lg">
                <span className="text-xs text-[#8f98a8] md:text-sm">
                  Try: &quot;What projects combine AI and architecture?&quot;
                </span>
                <span className="ml-auto shrink-0 rounded-full border border-black/[0.08] bg-black/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[#8f98a8]">
                  Chat Soon
                </span>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ opacity: miniGlyphOpacity }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/28 bg-black/[0.26] backdrop-blur-xl">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M7 8.5h10m-10 4h7m8-0.2c0 4.1-4.1 7.4-9.1 7.4-1.1 0-2.2-0.2-3.2-0.6L4 20l1.4-3.4c-1.5-1.2-2.4-2.8-2.4-4.6 0-4.1 4.1-7.4 9.1-7.4S22 8.2 22 12.3Z"
                    stroke="#dbe0ea"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Open portfolio chat"
        className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full border border-white/24 bg-black/[0.26] shadow-[inset_0_1px_0_rgba(255,255,255,0.26),0_18px_34px_-24px_rgba(8,11,17,0.72)] backdrop-blur-xl md:bottom-7 md:right-7"
        style={{
          opacity: dockProgress * textOpacity,
          pointerEvents: dockProgress > 0.12 && textProgress > 0.2 ? "auto" : "none",
          transform: `translateY(${(1 - dockProgress) * 22}px) scale(${0.82 + dockProgress * 0.18})`
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 8.5h10m-10 4h7m8-0.2c0 4.1-4.1 7.4-9.1 7.4-1.1 0-2.2-0.2-3.2-0.6L4 20l1.4-3.4c-1.5-1.2-2.4-2.8-2.4-4.6 0-4.1 4.1-7.4 9.1-7.4S22 8.2 22 12.3Z"
            stroke="#dde2ec"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
