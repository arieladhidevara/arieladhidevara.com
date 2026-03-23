"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { SectionMediaCarouselItem } from "@/components/project/section-media-carousel";

type Props = {
  items: SectionMediaCarouselItem[];
  className?: string;
  autoLoop?: boolean;
  autoLoopInterval?: number;
  fill?: boolean;
};

export function SectionSlideshow({ items, className, autoLoop = false, autoLoopInterval = 3000, fill = false }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!autoLoop || items.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, autoLoopInterval);
    return () => clearInterval(id);
  }, [autoLoop, autoLoopInterval, items.length]);

  if (items.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Media area */}
      <div className="relative overflow-hidden rounded-card" style={{ aspectRatio: "16/10" }}>
        {items.map((item, i) => (
          <div
            key={item.key}
            className="absolute inset-0"
            style={{
              opacity: i === index ? 1 : 0,
              transition: "opacity 320ms ease-in-out",
              pointerEvents: i === index ? "auto" : "none"
            }}
          >
            {item.kind === "video" ? (
              <video
                src={item.src}
                className="h-full w-full object-contain"
                autoPlay
                muted
                loop
                playsInline
                aria-label={item.label}
              />
            ) : (
              <img
                src={item.src}
                alt={item.label}
                className={cn("h-full w-full", fill ? "object-cover" : "object-contain")}
              />
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      {!autoLoop && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#7a8394]">
            {index + 1} / {items.length}
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.05] text-sm text-[#4d5565] transition-colors hover:bg-black/[0.1]"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.05] text-sm text-[#4d5565] transition-colors hover:bg-black/[0.1]"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
