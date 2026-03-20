"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type CategoryVideoTarget = {
  id: string;
  videoSrc: string;
};

type CategoryVideoBackdropProps = {
  targets: CategoryVideoTarget[];
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function getSignal(rect: DOMRect, viewportHeight: number) {
  const viewportCenter = viewportHeight / 2;
  const sectionCenter = rect.top + rect.height / 2;
  const distance = Math.abs(sectionCenter - viewportCenter);
  const proximity = clamp(1 - distance / (viewportHeight * 0.68));

  const visiblePixels = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
  const visibleRatio = rect.height > 0 ? clamp(visiblePixels / Math.min(rect.height, viewportHeight)) : 0;

  const inFocus = rect.top <= viewportCenter && rect.bottom >= viewportCenter ? 1 : 0;

  return clamp(proximity * 0.58 + visibleRatio * 0.46 + inFocus * 0.28);
}

export function CategoryVideoBackdrop({ targets }: CategoryVideoBackdropProps) {
  const videoSources = useMemo(() => Array.from(new Set(targets.map((target) => target.videoSrc))), [targets]);
  const [intensity, setIntensity] = useState(0);
  const [sourceOpacities, setSourceOpacities] = useState<Record<string, number>>(() =>
    Object.fromEntries(videoSources.map((source) => [source, 0]))
  );
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setSourceOpacities((previous) => {
      const next: Record<string, number> = {};
      for (const source of videoSources) {
        next[source] = previous[source] ?? 0;
      }
      return next;
    });
  }, [videoSources]);

  useEffect(() => {
    const update = () => {
      const viewportHeight = window.innerHeight;
      const scoredTargets = targets
        .map((target) => {
          const element = document.getElementById(target.id);
          if (!element) return null;
          return {
            source: target.videoSrc,
            score: getSignal(element.getBoundingClientRect(), viewportHeight)
          };
        })
        .filter((value): value is { source: string; score: number } => Boolean(value))
        .sort((left, right) => right.score - left.score);

      const primary = scoredTargets[0];
      const secondary = scoredTargets[1];
      const nextIntensity = primary ? clamp(primary.score) : 0;
      setIntensity((prev) => (Math.abs(prev - nextIntensity) > 0.002 ? nextIntensity : prev));

      const nextOpacities: Record<string, number> = Object.fromEntries(videoSources.map((source) => [source, 0]));
      if (primary) {
        const secondaryScore = secondary ? secondary.score : 0;
        const total = Math.max(primary.score + secondaryScore, 0.0001);
        const secondaryOpacity = secondary ? clamp(secondaryScore / total) : 0;
        const primaryOpacity = clamp(1 - secondaryOpacity);

        nextOpacities[primary.source] = primaryOpacity;
        if (secondary && secondaryOpacity > 0.015) {
          nextOpacities[secondary.source] = secondaryOpacity;
        }
      }

      setSourceOpacities((previous) => {
        let changed = false;
        for (const source of videoSources) {
          if (Math.abs((previous[source] ?? 0) - (nextOpacities[source] ?? 0)) > 0.01) {
            changed = true;
            break;
          }
        }
        return changed ? nextOpacities : previous;
      });
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
  }, [targets, videoSources]);

  if (videoSources.length === 0) return null;
  const layeredSources = [...videoSources].sort(
    (left, right) => (sourceOpacities[left] ?? 0) - (sourceOpacities[right] ?? 0)
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[2] overflow-hidden transition-opacity duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ opacity: intensity }}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(96%_86%_at_16%_12%,rgba(164,190,226,0.34)_0%,rgba(164,190,226,0)_58%),radial-gradient(90%_84%_at_84%_18%,rgba(95,119,150,0.28)_0%,rgba(95,119,150,0)_56%),linear-gradient(180deg,rgba(222,230,242,0.56)_0%,rgba(210,220,234,0.4)_100%)]" />

      {layeredSources.map((source) => (
        <video
          key={`category-video-${source}`}
          className="absolute inset-0 h-full w-full scale-[1.06] object-cover blur-[9px] transition-opacity duration-[980ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ opacity: sourceOpacities[source] ?? 0 }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={source} type="video/mp4" />
        </video>
      ))}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,247,252,0.2)_0%,rgba(236,241,248,0.1)_42%,rgba(227,234,245,0.18)_100%)]" />
    </div>
  );
}
