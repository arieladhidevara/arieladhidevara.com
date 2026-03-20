"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type PhysicadProcessBackdropProps = {
  startId: string;
  endId: string;
  className?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function PhysicadProcessBackdrop({ startId, endId, className }: PhysicadProcessBackdropProps) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const root = document.documentElement;

    const update = () => {
      const startElement = document.getElementById(startId);
      if (!startElement) {
        setOpacity(0);
        root.style.setProperty("--physicad-process-media-visibility", "0");
        return;
      }

      const endElement = document.getElementById(endId);
      const viewportHeight = Math.max(window.innerHeight, 1);
      const scrollY = window.scrollY;

      const processTop = startElement.offsetTop;
      const reflectionTop = endElement?.offsetTop ?? processTop + viewportHeight * 1.25;

      // Start darkening while still in "The Project" and hit full black right as Process takes focus.
      const fadeInStart = processTop - viewportHeight * 1.04;
      const fadeInEnd = processTop - viewportHeight * 0.08;
      const rawFadeOutStart = reflectionTop - viewportHeight * 0.9;
      const fadeOutStart = Math.max(rawFadeOutStart, fadeInEnd + viewportHeight * 0.22);
      const fadeOutEnd = Math.max(reflectionTop - viewportHeight * 0.2, fadeOutStart + viewportHeight * 0.22);

      let nextOpacity = 0;
      let mediaVisibility = 0;

      if (scrollY <= fadeInStart) {
        nextOpacity = 0;
      } else if (scrollY < fadeInEnd) {
        nextOpacity = clamp((scrollY - fadeInStart) / Math.max(fadeInEnd - fadeInStart, 1), 0, 1);
      } else if (scrollY <= fadeOutStart) {
        nextOpacity = 1;
      } else if (scrollY < fadeOutEnd) {
        nextOpacity = clamp(1 - (scrollY - fadeOutStart) / Math.max(fadeOutEnd - fadeOutStart, 1), 0, 1);
      } else {
        nextOpacity = 0;
      }

      // Show Process media only when the backdrop is fully black and hide as soon as white fade-out starts.
      mediaVisibility = nextOpacity >= 0.999 && scrollY < fadeOutStart ? 1 : 0;

      setOpacity(nextOpacity);
      root.style.setProperty("--physicad-process-media-visibility", `${mediaVisibility}`);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        update();
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      root.style.removeProperty("--physicad-process-media-visibility");
    };
  }, [endId, startId]);

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 z-0 transition-opacity duration-500 ease-out", className)}
      style={{ opacity }}
    >
      <div className="absolute inset-0 bg-black" />
    </div>
  );
}
