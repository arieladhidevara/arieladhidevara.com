"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MediaBlock } from "@/components/ui/media-block";
import { cn } from "@/lib/utils";

export type SectionMediaCarouselItem = {
  key: string;
  kind: "image" | "video";
  label: string;
  src?: string;
  poster?: string;
};

type SectionMediaCarouselProps = {
  items: SectionMediaCarouselItem[];
  className?: string;
};

export function SectionMediaCarousel({ items, className }: SectionMediaCarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [canGoNext, setCanGoNext] = useState(items.length > 1);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const maxScroll = Math.max(track.scrollWidth - track.clientWidth, 0);
    const scrollLeft = track.scrollLeft;

    setCanGoPrev(scrollLeft > 6);
    setCanGoNext(scrollLeft < maxScroll - 6);

    const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-carousel-item]"));
    if (cards.length === 0) return;

    const viewportCenter = scrollLeft + track.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(cardCenter - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }, []);

  useEffect(() => {
    updateState();
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => updateState();
    const onResize = () => updateState();

    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [items.length, updateState]);

  const stepSize = useMemo(() => {
    const track = trackRef.current;
    if (!track) return 0;
    return Math.max(Math.floor(track.clientWidth * 0.82), 1);
  }, [items.length]);

  const scrollByDirection = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;

    const distance = stepSize || Math.max(Math.floor(track.clientWidth * 0.82), 1);
    track.scrollBy({
      left: direction * distance,
      behavior: "smooth"
    });
  }, [stepSize]);

  if (items.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="kicker">Media Carousel</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByDirection(-1)}
            disabled={!canGoPrev}
            aria-label="Previous media"
            className="rounded-full border border-black/10 bg-black/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#4a5261] transition-colors disabled:cursor-not-allowed disabled:opacity-35 hover:bg-black/[0.08]"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => scrollByDirection(1)}
            disabled={!canGoNext}
            aria-label="Next media"
            className="rounded-full border border-black/10 bg-black/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#4a5261] transition-colors disabled:cursor-not-allowed disabled:opacity-35 hover:bg-black/[0.08]"
          >
            Next
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          <div
            key={item.key}
            data-carousel-item
            className="min-w-[86%] snap-start sm:min-w-[72%] lg:min-w-[56%]"
          >
            <MediaBlock kind={item.kind} ratio="wide" label={item.label} src={item.src} poster={item.poster} />
            <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-[#8c939f]">{index + 1} / {items.length}</p>
          </div>
        ))}
      </div>

      <p className="kicker">
        Slide {activeIndex + 1} of {items.length}
      </p>
    </div>
  );
}
