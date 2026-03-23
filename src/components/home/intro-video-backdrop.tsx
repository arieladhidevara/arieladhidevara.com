"use client";

import { useEffect, useRef, useState } from "react";

type IntroVideoBackdropProps = {
  endId: string;
  videoSrc: string;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

export function IntroVideoBackdrop({ endId, videoSrc }: IntroVideoBackdropProps) {
  const [opacity, setOpacity] = useState(1);
  const rafRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const normalizedVideoSrc = videoSrc.trim();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const attempt = () => {
      video.play().catch(() => {});
    };

    const result = video.play();
    if (result) {
      result.catch(() => {
        window.addEventListener("touchstart", attempt, { once: true, passive: true });
        window.addEventListener("scroll", attempt, { once: true, passive: true });
        window.addEventListener("click", attempt, { once: true });
      });
    }
  }, []);

  useEffect(() => {
    const update = () => {
      const endElement = document.getElementById(endId);
      if (!endElement) {
        setOpacity(0);
        return;
      }

      const viewportHeight = window.innerHeight;
      const endRect = endElement.getBoundingClientRect();
      const fadeStart = viewportHeight * 1.16;
      const fadeEnd = viewportHeight * 0.08;
      const nextOpacity = clamp((endRect.top - fadeEnd) / Math.max(fadeStart - fadeEnd, 1));
      setOpacity((previous) => (Math.abs(previous - nextOpacity) > 0.003 ? nextOpacity : previous));
    };

    const onScrollOrResize = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        update();
      });
    };

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [endId]);

  if (!normalizedVideoSrc) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[3] overflow-hidden transition-opacity duration-[480ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ opacity }}
      aria-hidden
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full scale-[1.04] object-cover blur-[3px] opacity-[0.76]"
        style={{ pointerEvents: "none" }}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src={normalizedVideoSrc} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[radial-gradient(96%_86%_at_16%_10%,rgba(184,197,216,0.3)_0%,rgba(184,197,216,0)_58%),radial-gradient(88%_84%_at_82%_14%,rgba(124,141,167,0.24)_0%,rgba(124,141,167,0)_56%),linear-gradient(180deg,rgba(236,240,247,0.3)_0%,rgba(236,240,247,0.08)_42%,rgba(232,237,246,0.22)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(241,242,244,0.16)_0%,rgba(241,242,244,0.24)_100%)]" />
    </div>
  );
}
