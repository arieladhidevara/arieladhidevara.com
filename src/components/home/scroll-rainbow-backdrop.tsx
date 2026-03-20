"use client";

import { useEffect, useRef, useState } from "react";

type ScrollRainbowBackdropProps = {
  targetId: string;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

export function ScrollRainbowBackdrop({ targetId }: ScrollRainbowBackdropProps) {
  const [intensity, setIntensity] = useState(0);
  const initialDeltaRef = useRef<number>(1);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const resolveInitialDelta = () => {
      const target = document.getElementById(targetId);
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const targetCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      initialDeltaRef.current = Math.max(targetCenter - viewportCenter, window.innerHeight * 0.25);
    };

    const update = () => {
      const target = document.getElementById(targetId);
      if (!target) {
        setIntensity(0);
        return;
      }

      const rect = target.getBoundingClientRect();
      const targetCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const delta = targetCenter - viewportCenter;
      const initialDelta = Math.max(initialDeltaRef.current, 1);

      const fadeIn = clamp(1 - delta / initialDelta);
      const fadeOutDistance = window.innerHeight * 0.62;
      const fadeOut = clamp((-delta) / fadeOutDistance);
      const nextIntensity = clamp(fadeIn * (1 - fadeOut));

      setIntensity((prev) => (Math.abs(prev - nextIntensity) > 0.003 ? nextIntensity : prev));
    };

    const onScrollOrResize = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        update();
      });
    };

    const onResize = () => {
      resolveInitialDelta();
      onScrollOrResize();
    };

    resolveInitialDelta();
    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onResize);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [targetId]);

  if (intensity <= 0.001) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[1]" style={{ opacity: clamp(intensity * 1.45) }}>
      <div className="absolute inset-0 bg-[radial-gradient(90%_80%_at_12%_10%,rgba(255,116,121,0.56)_0%,rgba(255,116,121,0)_55%),radial-gradient(90%_70%_at_88%_16%,rgba(255,199,109,0.58)_0%,rgba(255,199,109,0)_58%),radial-gradient(84%_82%_at_76%_84%,rgba(106,194,255,0.55)_0%,rgba(106,194,255,0)_58%),radial-gradient(72%_80%_at_24%_86%,rgba(138,232,187,0.52)_0%,rgba(138,232,187,0)_58%)]" />
    </div>
  );
}
