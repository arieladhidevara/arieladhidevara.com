"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { HeroScene } from "@/components/three/hero-scene";
import { usePortfolioChat } from "@/components/chat/portfolio-chat-provider";

const HERO_HEADING_PREFIX = "Welcome to";
const HERO_HEADING_EMPHASIS = "Ariel's Experiential Portfolio.";
const HERO_HEADING = `${HERO_HEADING_PREFIX} ${HERO_HEADING_EMPHASIS}`;
const TYPE_START_PROGRESS = 0.95;
const TYPE_SCROLL_START_PROGRESS = 0.2;
const TYPE_INITIAL_DELAY_MS = 20;
const TYPE_STEP_MS = 24;
const TYPE_SPACE_STEP_MS = 14;
const CHAT_REVEAL_DELAY_MS = 120;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

export function HeroOpeningSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const lastTouchYRef = useRef<number | null>(null);
  const [copyProgress, setCopyProgress] = useState(0);
  const [heroDraft, setHeroDraft] = useState("");
  const [chatFadeProgress, setChatFadeProgress] = useState(0);
  const [typedEmphasis, setTypedEmphasis] = useState("");
  const [typingCompleted, setTypingCompleted] = useState(false);
  const [typingReady, setTypingReady] = useState(false);
  const [userScrolledDuringOpening, setUserScrolledDuringOpening] = useState(false);
  const [chatRevealReady, setChatRevealReady] = useState(false);
  const { submitPrompt, isSending, hasChattedEver } = usePortfolioChat();
  const textProgress = clamp(copyProgress);
  const textOpacity = clamp(textProgress);
  const chatOpacity = clamp(1 - chatFadeProgress, 0, 1);
  const chatRevealOpacity = chatRevealReady ? 1 : 0;
  const chatCombinedOpacity = chatOpacity * chatRevealOpacity;
  const chatScrollOffset = chatFadeProgress * 10;
  const chatRevealOffset = chatRevealReady ? 0 : 14;
  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;

    const update = () => {
      rafId = null;
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const nextProgress = clamp(-rect.top / Math.max(rect.height * 0.76, 1), 0, 1);
      setChatFadeProgress((prev) => (Math.abs(prev - nextProgress) < 0.002 ? prev : nextProgress));
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

  useEffect(() => {
    if (typingReady || typingCompleted) return;
    const startFromCompletion = textProgress >= TYPE_START_PROGRESS;
    const startFromScroll = userScrolledDuringOpening && textProgress >= TYPE_SCROLL_START_PROGRESS;
    if (!startFromCompletion && !startFromScroll) return;
    setTypingReady(true);
  }, [textProgress, typingCompleted, typingReady, userScrolledDuringOpening]);

  useEffect(() => {
    if (typingReady || typingCompleted || userScrolledDuringOpening) return;

    const markScrolled = () => {
      setUserScrolledDuringOpening(true);
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 0.5) return;
      markScrolled();
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      lastTouchYRef.current = touch?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY;
      if (currentY == null) return;
      const lastY = lastTouchYRef.current;
      lastTouchYRef.current = currentY;
      if (lastY == null) return;
      if (Math.abs(lastY - currentY) < 2) return;
      markScrolled();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [typingReady, typingCompleted, userScrolledDuringOpening]);

  useEffect(() => {
    if (!typingReady || typingCompleted) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTypedEmphasis(HERO_HEADING_EMPHASIS);
      setTypingCompleted(true);
      return;
    }

    let index = 0;
    let startTimeoutId = 0;
    let stepTimeoutId = 0;

    const tick = () => {
      index += 1;
      setTypedEmphasis(HERO_HEADING_EMPHASIS.slice(0, index));
      if (index >= HERO_HEADING_EMPHASIS.length) {
        setTypingCompleted(true);
        return;
      }

      const nextChar = HERO_HEADING_EMPHASIS[index];
      const nextDelay = nextChar === " " ? TYPE_SPACE_STEP_MS : TYPE_STEP_MS;
      stepTimeoutId = window.setTimeout(tick, nextDelay);
    };

    setTypedEmphasis("");
    startTimeoutId = window.setTimeout(tick, TYPE_INITIAL_DELAY_MS);

    return () => {
      window.clearTimeout(startTimeoutId);
      window.clearTimeout(stepTimeoutId);
    };
  }, [typingReady, typingCompleted]);

  useEffect(() => {
    if (hasChattedEver) {
      setChatRevealReady(false);
      return;
    }
    if (!typingCompleted) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setChatRevealReady(true);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setChatRevealReady(true);
    }, CHAT_REVEAL_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [typingCompleted, hasChattedEver]);

  const handleHeroSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitPrompt(heroDraft, { open: true });
    setHeroDraft("");
  };

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
          <h1
            className="display-type mt-6 max-w-5xl text-4xl font-extralight leading-[1.02] text-[#121418] md:text-7xl"
            aria-label={HERO_HEADING}
          >
            <span aria-hidden className="block text-[0.52em] leading-[1.08] md:text-[0.46em]">
              {HERO_HEADING_PREFIX}
            </span>
            <span aria-hidden className="mt-[0.08em] block font-bold">
              {typedEmphasis}
              {!typingCompleted ? (
                <span
                  aria-hidden
                  className="ml-1 inline-block h-[0.88em] w-[0.08em] translate-y-[0.1em] animate-pulse bg-[#121418]"
                />
              ) : null}
            </span>
          </h1>
          <p className="editorial-copy mt-7 text-sm text-[#4c5360] md:text-base">
            A multidisciplinary body of work across interactive systems, AI software, architecture, objects, and visual
            storytelling, presented through a calm editorial framework.
          </p>

          {!hasChattedEver && (
            <div
              className="relative mt-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-white/20 bg-[radial-gradient(124%_94%_at_0%_0%,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_52%),linear-gradient(155deg,rgba(26,35,47,0.48)_0%,rgba(9,13,20,0.72)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(93,108,128,0.28),0_24px_42px_-34px_rgba(7,10,15,0.74)] backdrop-blur-[18px] md:rounded-3xl md:p-5"
              style={{
                opacity: chatOpacity,
                transform: `translateY(${chatScrollOffset}px)`,
                pointerEvents: chatCombinedOpacity > 0.06 ? "auto" : "none"
              }}
            >
              <div
                className="relative transition-[opacity,transform] duration-[860ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  opacity: chatRevealOpacity,
                  transform: `translateY(${chatRevealOffset}px)`
                }}
              >
                <div className="relative z-10">
                  <form
                    className="mt-1 flex items-center gap-2.5 rounded-full border border-black/[0.24] bg-[linear-gradient(180deg,rgba(228,233,241,0.92)_0%,rgba(212,219,230,0.86)_100%)] px-3 py-2 shadow-[inset_0_2px_6px_rgba(12,17,24,0.26),inset_0_-1px_0_rgba(255,255,255,0.48)] md:mt-0 md:px-4 md:py-2.5"
                    onSubmit={handleHeroSubmit}
                  >
                    <label htmlFor="hero-chat-input" className="sr-only">
                      Ask about Ariel&apos;s portfolio
                    </label>
                    <input
                      id="hero-chat-input"
                      value={heroDraft}
                      onChange={(event) => setHeroDraft(event.target.value)}
                      placeholder='Try: "What projects combine AI and architecture?"'
                      className="min-w-0 flex-1 bg-transparent text-xs text-[#202734] outline-none placeholder:text-[#8f98a8] md:text-sm"
                    />
                    <button
                      type="submit"
                      disabled={heroDraft.trim().length === 0 || isSending}
                      className="shrink-0 rounded-full border border-black/[0.14] bg-transparent px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[#586173] transition-colors hover:bg-black/[0.06] hover:text-[#1c2230] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
