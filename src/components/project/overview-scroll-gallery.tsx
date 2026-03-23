"use client";

import { useEffect, useRef, useState } from "react";
import type { SectionMediaCarouselItem } from "@/components/project/section-media-carousel";

const STEP_THRESHOLD = 80;
const SWITCH_COOLDOWN_MS = 420;
const LAYOUT_HEIGHT_PER_ITEM = 480;

type Props = { items: SectionMediaCarouselItem[] };

export function OverviewScrollGallery({ items }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const accDeltaRef = useRef(0);
  const cooldownRef = useRef(false);
  const lastTouchYRef = useRef(0);
  const currentIndexRef = useRef(0);
  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;

    const activate = () => {
      activeRef.current = true;
      accDeltaRef.current = 0;
      currentIndexRef.current = 0;
      setCurrentIndex(0);
      setIsActive(true);
      document.body.style.overflow = "hidden";
    };

    const deactivate = (scrollPast: boolean) => {
      activeRef.current = false;
      setIsActive(false);
      document.body.style.overflow = "";
      if (scrollPast) {
        requestAnimationFrame(() => {
          const container = containerRef.current;
          if (!container) return;
          const endY = container.offsetTop + container.offsetHeight - window.innerHeight + 20;
          window.scrollTo({ top: Math.max(0, endY), behavior: "instant" });
        });
      }
    };

    const tryAdvance = (forward: boolean) => {
      if (cooldownRef.current) return;
      if (forward && currentIndexRef.current >= items.length - 1) {
        deactivate(true);
        return;
      }
      if (!forward && currentIndexRef.current <= 0) {
        deactivate(false);
        return;
      }
      const next = forward ? currentIndexRef.current + 1 : currentIndexRef.current - 1;
      cooldownRef.current = true;
      currentIndexRef.current = next;
      setCurrentIndex(next);
      accDeltaRef.current = 0;
      setTimeout(() => { cooldownRef.current = false; }, SWITCH_COOLDOWN_MS);
    };

    const onScroll = () => {
      if (activeRef.current) return;
      const container = containerRef.current;
      if (!container) return;
      const top = container.getBoundingClientRect().top;
      if (top <= window.innerHeight * 0.5 && top >= -80) activate();
    };

    const onWheel = (e: WheelEvent) => {
      if (!activeRef.current) return;
      e.preventDefault();
      const dy =
        e.deltaMode === 1 ? e.deltaY * 16
        : e.deltaMode === 2 ? e.deltaY * window.innerHeight
        : e.deltaY;
      accDeltaRef.current += dy;
      if (accDeltaRef.current >= STEP_THRESHOLD) tryAdvance(true);
      else if (accDeltaRef.current <= -STEP_THRESHOLD) tryAdvance(false);
    };

    const onTouchStart = (e: TouchEvent) => {
      lastTouchYRef.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!activeRef.current) return;
      e.preventDefault();
      const dy = (lastTouchYRef.current - e.touches[0].clientY) * 2;
      lastTouchYRef.current = e.touches[0].clientY;
      accDeltaRef.current += dy;
      if (accDeltaRef.current >= STEP_THRESHOLD) tryAdvance(true);
      else if (accDeltaRef.current <= -STEP_THRESHOLD) tryAdvance(false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      document.body.style.overflow = "";
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      style={{ height: `${items.length * LAYOUT_HEIGHT_PER_ITEM}px` }}
    >
      <div className="sticky top-24">
        <div className="relative w-full overflow-hidden rounded-card" style={{ display: "grid", gridTemplateAreas: '"stack"', aspectRatio: "16/10" }}>
          {items.map((item, i) => (
            <div
              key={item.key}
              style={{
                gridArea: "stack",
                opacity: isActive && i === currentIndex ? 1 : i === 0 && !isActive ? 1 : 0,
                transition: "opacity 360ms ease-in-out"
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
                  className="h-full w-full object-contain"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
