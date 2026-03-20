"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MediaBlock } from "@/components/ui/media-block";
import type { SectionMediaCarouselItem } from "@/components/project/section-media-carousel";
import { cn } from "@/lib/utils";

type ProjectMediaScrollSequenceProps = {
  items: SectionMediaCarouselItem[];
  className?: string;
  syncToPageScroll?: boolean;
  mediaClassName?: string;
  showFooter?: boolean;
  fadeOutOnLastScroll?: boolean;
};

export function ProjectMediaScrollSequence({
  items,
  className,
  syncToPageScroll = false,
  mediaClassName,
  showFooter = true,
  fadeOutOnLastScroll = false
}: ProjectMediaScrollSequenceProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const lockRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!syncToPageScroll || items.length <= 1) return;

    const isLockZoneActive = () => {
      const container = containerRef.current;
      if (!container) return false;

      const rect = container.getBoundingClientRect();
      const topThreshold = window.innerHeight * 0.48;
      const bottomThreshold = window.innerHeight * 0.58;

      return rect.top <= topThreshold && rect.bottom >= bottomThreshold;
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 1) return;
      if (!isLockZoneActive()) return;

      if (event.deltaY > 0 && activeIndex < items.length - 1) {
        if (fadeOut) {
          setFadeOut(false);
        }
        event.preventDefault();
        moveSequence(1);
        return;
      }

      if (event.deltaY > 0 && activeIndex >= items.length - 1) {
        if (fadeOutOnLastScroll) {
          setFadeOut(true);
        }
        return;
      }

      if (event.deltaY < 0 && activeIndex > 0) {
        if (fadeOut) {
          setFadeOut(false);
        }
        event.preventDefault();
        moveSequence(-1);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
    };
  }, [activeIndex, fadeOut, fadeOutOnLastScroll, items.length, syncToPageScroll]);

  useEffect(() => {
    if (activeIndex < items.length - 1 && fadeOut) {
      setFadeOut(false);
    }
  }, [activeIndex, fadeOut, items.length]);

  const moveSequence = (direction: 1 | -1) => {
    if (items.length <= 1 || lockRef.current) return;

    lockRef.current = true;
    setActiveIndex((previous) => Math.max(0, Math.min(items.length - 1, previous + direction)));

    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      lockRef.current = false;
    }, 210);
  };

  const activeItem = items[activeIndex] ?? items[0];
  if (!activeItem) return null;
  const pinHeightStyle =
    syncToPageScroll && items.length > 1
      ? { minHeight: `${Math.max(160, 82 + (items.length - 1) * 30)}svh` }
      : undefined;

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={pinHeightStyle}
      onWheel={(event) => {
        if (items.length <= 1) return;
        if (Math.abs(event.deltaY) < 1) return;
        if (syncToPageScroll) return;

        event.preventDefault();
        moveSequence(event.deltaY > 0 ? 1 : -1);
      }}
    >
      <div
        className={cn(
          syncToPageScroll && items.length > 1 ? "lg:sticky lg:top-24" : "",
          "transition-opacity duration-300 ease-out",
          fadeOut ? "opacity-0" : "opacity-100"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <MediaBlock
              kind={activeItem.kind}
              ratio="wide"
              className={cn("w-full min-h-[320px] lg:h-[64svh] lg:min-h-[420px] lg:aspect-auto", mediaClassName)}
              label={activeItem.label}
              src={activeItem.src}
              poster={activeItem.poster}
            />
          </motion.div>
        </AnimatePresence>

        {showFooter && items.length > 1 ? (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#8c939f]">
              {activeIndex + 1} / {items.length}
            </p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#8c939f]">
              {syncToPageScroll ? "Scroll to change" : "Wheel to change"}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
