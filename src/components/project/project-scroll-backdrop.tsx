"use client";

import { useEffect, useMemo, useRef } from "react";
import type { PracticeCategory } from "@/lib/placeholder-data";

type ProjectScrollBackdropProps = {
  slug: string;
  category: PracticeCategory;
};

type BackdropTheme = {
  base: string;
  band: string;
  haze: string;
  glow: string;
  orbA: string;
  orbB: string;
  orbC: string;
  motion: {
    drift: number;
    swayFreq: number;
    sweepFreq: number;
    bandAmp: number;
    hazeAmp: number;
    orbAStartX: number;
    orbAStartY: number;
    orbAEndX: number;
    orbAEndY: number;
    orbBStartX: number;
    orbBStartY: number;
    orbBEndX: number;
    orbBEndY: number;
    orbCStartX: number;
    orbCStartY: number;
    orbCEndX: number;
    orbCEndY: number;
  };
};

const categoryColorPools: Record<PracticeCategory, string[]> = {
  "Interactive Systems": ["#05e6fa", "#09899b", "#f79807", "#f6ac07", "#f88407", "#34d6e8", "#0f7080", "#ffc168"],
  "AI & Software": ["#7ec8ff", "#4d8dd7", "#6f7dff", "#5eb7b4", "#92afff", "#6ab8ff", "#5f9ee6", "#7cd4c4"],
  "Spatial & Architectural Design": ["#c8b79c", "#a6a095", "#d4c4ac", "#8ea69a", "#b89f86", "#d8cbb9", "#94b0a5", "#bcae97"],
  "Objects & Product": ["#ff9a6b", "#f3b06c", "#65b6ad", "#f38b62", "#f0c07a", "#72c0b8", "#f5a074", "#7bc9bf"],
  "Visual & Media": ["#ff8a7b", "#f7b455", "#6faaff", "#8c80dc", "#f29f8e", "#f5ca71", "#6494e7", "#a48de4"]
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const safeHex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((value) => `${value}${value}`)
          .join("")
      : normalized;

  const int = Number.parseInt(safeHex, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildTheme(slug: string, category: PracticeCategory): BackdropTheme {
  const hash = hashString(slug);
  const pool = categoryColorPools[category];
  const offset = hash % pool.length;
  const pick = (jump: number) => pool[(offset + jump) % pool.length];

  const c1 = pick(0);
  const c2 = pick(2);
  const c3 = pick(4);
  const c4 = pick(1);
  const c5 = pick(3);

  return {
    base: `linear-gradient(180deg, rgba(247,247,248,0.99) 0%, rgba(244,245,247,0.97) 100%), radial-gradient(88% 62% at 14% 0%, ${hexToRgba(c1, 0.07)} 0%, ${hexToRgba(c1, 0)} 100%), radial-gradient(82% 58% at 86% 4%, ${hexToRgba(c3, 0.06)} 0%, ${hexToRgba(c3, 0)} 100%)`,
    band: `linear-gradient(90deg, ${hexToRgba(c1, 0.2)} 0%, ${hexToRgba(c1, 0.2)} 18%, ${hexToRgba(c2, 0.19)} 18%, ${hexToRgba(c2, 0.19)} 38%, ${hexToRgba(c3, 0.18)} 38%, ${hexToRgba(c3, 0.18)} 60%, ${hexToRgba(c4, 0.17)} 60%, ${hexToRgba(c4, 0.17)} 80%, ${hexToRgba(c5, 0.16)} 80%, ${hexToRgba(c5, 0.16)} 100%)`,
    haze: `radial-gradient(42% 46% at 10% 18%, ${hexToRgba(c1, 0.1)} 0%, ${hexToRgba(c1, 0)} 100%), radial-gradient(45% 48% at 34% 15%, ${hexToRgba(c2, 0.1)} 0%, ${hexToRgba(c2, 0)} 100%), radial-gradient(42% 46% at 66% 20%, ${hexToRgba(c3, 0.11)} 0%, ${hexToRgba(c3, 0)} 100%), radial-gradient(42% 44% at 84% 18%, ${hexToRgba(c4, 0.1)} 0%, ${hexToRgba(c4, 0)} 100%), radial-gradient(48% 50% at 22% 84%, ${hexToRgba(c5, 0.08)} 0%, ${hexToRgba(c5, 0)} 100%), radial-gradient(50% 52% at 80% 86%, ${hexToRgba(c2, 0.08)} 0%, ${hexToRgba(c2, 0)} 100%)`,
    glow:
      "radial-gradient(56% 54% at 24% 76%, rgba(255,255,255,0.56) 0%, rgba(255,255,255,0) 100%), radial-gradient(58% 56% at 76% 84%, rgba(255,255,255,0.54) 0%, rgba(255,255,255,0) 100%)",
    orbA: `radial-gradient(circle, ${hexToRgba(c1, 0.2)} 0%, ${hexToRgba(c1, 0.03)} 52%, ${hexToRgba(c1, 0)} 100%)`,
    orbB: `radial-gradient(circle, ${hexToRgba(c2, 0.18)} 0%, ${hexToRgba(c2, 0.03)} 52%, ${hexToRgba(c2, 0)} 100%)`,
    orbC: `radial-gradient(circle, ${hexToRgba(c3, 0.17)} 0%, ${hexToRgba(c3, 0.03)} 52%, ${hexToRgba(c3, 0)} 100%)`,
    motion: {
      drift: 250 + (hash % 120),
      swayFreq: 1.7 + ((hash >> 2) % 8) * 0.12,
      sweepFreq: 1.5 + ((hash >> 5) % 8) * 0.11,
      bandAmp: 22 + (hash % 14),
      hazeAmp: 18 + ((hash >> 4) % 11),
      orbAStartX: -16 + ((hash >> 1) % 9),
      orbAStartY: -4 + ((hash >> 3) % 10),
      orbAEndX: 28 + ((hash >> 6) % 16),
      orbAEndY: 46 + ((hash >> 8) % 16),
      orbBStartX: 54 + ((hash >> 2) % 14),
      orbBStartY: 8 + ((hash >> 4) % 10),
      orbBEndX: 6 + ((hash >> 7) % 18),
      orbBEndY: 56 + ((hash >> 9) % 14),
      orbCStartX: 66 + ((hash >> 3) % 16),
      orbCStartY: -10 + ((hash >> 5) % 14),
      orbCEndX: 30 + ((hash >> 8) % 18),
      orbCEndY: 42 + ((hash >> 10) % 16)
    }
  };
}

export function ProjectScrollBackdrop({ slug, category }: ProjectScrollBackdropProps) {
  const bandRef = useRef<HTMLDivElement | null>(null);
  const hazeRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const orbARef = useRef<HTMLDivElement | null>(null);
  const orbBRef = useRef<HTMLDivElement | null>(null);
  const orbCRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const theme = useMemo(() => buildTheme(slug, category), [slug, category]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const render = () => {
      rafRef.current = null;

      const current = currentRef.current + (targetRef.current - currentRef.current) * 0.09;
      currentRef.current = current;

      const drift = current * theme.motion.drift;
      const sway = Math.sin(current * Math.PI * theme.motion.swayFreq);
      const sweep = Math.cos(current * Math.PI * theme.motion.sweepFreq);

      if (bandRef.current) {
        bandRef.current.style.transform = `translate3d(${sway * theme.motion.bandAmp}px, ${-drift * 0.2}px, 0) scale(1.06)`;
      }

      if (hazeRef.current) {
        hazeRef.current.style.transform = `translate3d(${sweep * theme.motion.hazeAmp}px, ${-drift * 0.16}px, 0) rotate(${sway * 2.3}deg) scale(1.07)`;
      }

      if (orbARef.current) {
        const x = lerp(theme.motion.orbAStartX, theme.motion.orbAEndX, current) + sway * 5.2;
        const y = lerp(theme.motion.orbAStartY, theme.motion.orbAEndY, current) + sweep * 3.8;
        orbARef.current.style.transform = `translate3d(${x}vw, ${y}vh, 0)`;
      }

      if (orbBRef.current) {
        const x = lerp(theme.motion.orbBStartX, theme.motion.orbBEndX, current) + sweep * 5;
        const y = lerp(theme.motion.orbBStartY, theme.motion.orbBEndY, current) - sway * 4.1;
        orbBRef.current.style.transform = `translate3d(${x}vw, ${y}vh, 0)`;
      }

      if (orbCRef.current) {
        const x = lerp(theme.motion.orbCStartX, theme.motion.orbCEndX, current) - sway * 5.7;
        const y = lerp(theme.motion.orbCStartY, theme.motion.orbCEndY, current) + sweep * 3.3;
        orbCRef.current.style.transform = `translate3d(${x}vw, ${y}vh, 0)`;
      }

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${sway * 14}px, ${-drift * 0.08}px, 0) scale(1.04)`;
        glowRef.current.style.opacity = String(0.22 + current * 0.14);
      }

      if (Math.abs(targetRef.current - currentRef.current) > 0.0007) {
        rafRef.current = window.requestAnimationFrame(render);
      }
    };

    const updateTarget = () => {
      if (reducedMotion) return;
      const root = document.documentElement;
      const maxScroll = Math.max(root.scrollHeight - window.innerHeight, 1);
      targetRef.current = clamp(window.scrollY / maxScroll);
      if (rafRef.current == null) {
        rafRef.current = window.requestAnimationFrame(render);
      }
    };

    if (reducedMotion) {
      if (glowRef.current) {
        glowRef.current.style.opacity = "0.24";
      }
      return;
    }

    updateTarget();
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget);

    return () => {
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [theme]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0" style={{ background: theme.base }} />

      <div
        ref={bandRef}
        className="absolute inset-x-[-14%] top-[-8%] h-[44%] blur-[90px] will-change-transform transition-transform duration-500 ease-smooth"
        style={{ background: theme.band }}
      />

      <div
        ref={orbARef}
        className="absolute left-0 top-0 h-[56vw] w-[56vw] min-h-[18rem] min-w-[18rem] max-h-[38rem] max-w-[38rem] rounded-full blur-[74px] will-change-transform transition-transform duration-500 ease-smooth"
        style={{
          transform: `translate3d(${theme.motion.orbAStartX}vw, ${theme.motion.orbAStartY}vh, 0)`,
          background: theme.orbA
        }}
      />

      <div
        ref={orbBRef}
        className="absolute left-0 top-0 h-[52vw] w-[52vw] min-h-[17rem] min-w-[17rem] max-h-[34rem] max-w-[34rem] rounded-full blur-[70px] will-change-transform transition-transform duration-500 ease-smooth"
        style={{
          transform: `translate3d(${theme.motion.orbBStartX}vw, ${theme.motion.orbBStartY}vh, 0)`,
          background: theme.orbB
        }}
      />

      <div
        ref={orbCRef}
        className="absolute left-0 top-0 h-[54vw] w-[54vw] min-h-[16rem] min-w-[16rem] max-h-[34rem] max-w-[34rem] rounded-full blur-[72px] will-change-transform transition-transform duration-500 ease-smooth"
        style={{
          transform: `translate3d(${theme.motion.orbCStartX}vw, ${theme.motion.orbCStartY}vh, 0)`,
          background: theme.orbC
        }}
      />

      <div
        ref={hazeRef}
        className="absolute inset-[-8%] blur-[124px] will-change-transform transition-transform duration-500 ease-smooth"
        style={{ background: theme.haze }}
      />

      <div
        ref={glowRef}
        className="absolute inset-[-6%] blur-[140px] will-change-transform transition-[transform,opacity] duration-500 ease-smooth"
        style={{
          opacity: 0.24,
          background: theme.glow
        }}
      />
    </div>
  );
}
