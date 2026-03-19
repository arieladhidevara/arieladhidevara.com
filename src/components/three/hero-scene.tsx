"use client";

import { useEffect, useRef, useState } from "react";

type HeroSceneProps = {
  onOverlayProgress?: (progress: number) => void;
};

type Phase = "intro" | "rewind" | "done";

const FADE_OUT_MS = 260;
const REWIND_THRESHOLD = 0.92;
const WHEEL_REWIND_DISTANCE = 160;
const TOUCH_REWIND_DISTANCE = 900;
const DOWN_WHEEL_BOOST_DISTANCE = 320;
const DOWN_TOUCH_BOOST_DISTANCE = 620;
const MAX_WHEEL_DELTA = 16;
const MAX_TOUCH_DELTA = 24;
const EPSILON_SECONDS = 1 / 30;
const SCROLL_HINT_DELAY_MS = 2000;
const AUTO_REWIND_MS = 1450;
const MIN_REWIND_STEP_SECONDS = 0.01;
const MAX_REWIND_STEP_SECONDS = 0.045;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

export function HeroScene({ onOverlayProgress }: HeroSceneProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const rewindProgressRef = useRef(0);
  const rewindStartTimeRef = useRef(0);
  const overlayProgressRef = useRef(0);
  const interactionUnlockedRef = useRef(false);
  const autoRewindRef = useRef(false);
  const lastTouchYRef = useRef<number | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [lastFrameTime, setLastFrameTime] = useState(0);
  const [videoHidden, setVideoHidden] = useState(false);
  const [overlayProgress, setOverlayProgress] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const completeSequence = () => {
    interactionUnlockedRef.current = true;
    autoRewindRef.current = false;
    rewindProgressRef.current = REWIND_THRESHOLD;
    overlayProgressRef.current = 1;
    setOverlayProgress(1);
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    setPhase("done");
  };

  useEffect(() => {
    overlayProgressRef.current = overlayProgress;
    onOverlayProgress?.(overlayProgress);
  }, [overlayProgress, onOverlayProgress]);

  useEffect(() => {
    if (phase === "intro") {
      interactionUnlockedRef.current = false;
      autoRewindRef.current = false;
      rewindProgressRef.current = 0;
      rewindStartTimeRef.current = 0;
      overlayProgressRef.current = 0;
      setOverlayProgress(0);
      return;
    }
    if (phase === "done" || videoHidden) {
      interactionUnlockedRef.current = true;
      overlayProgressRef.current = 1;
      setOverlayProgress(1);
    }
  }, [phase, videoHidden]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowScrollHint(true), SCROLL_HINT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      const endFrameTime = Math.max(video.duration - EPSILON_SECONDS, 0);
      setLastFrameTime(endFrameTime);

      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          video.pause();
          video.currentTime = endFrameTime;
          rewindStartTimeRef.current = endFrameTime;
          setPhase("rewind");
        });
      }
    };

    const handleEnded = () => {
      video.pause();
      const endedFrameTime = Math.max(lastFrameTime, video.currentTime, 0);
      rewindStartTimeRef.current = endedFrameTime;
      video.currentTime = endedFrameTime;
      if (rewindProgressRef.current <= 0.001) {
        completeSequence();
        return;
      }
      setPhase("rewind");
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [lastFrameTime]);

  useEffect(() => {
    if (videoHidden || phase === "done") return;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [phase, videoHidden]);

  useEffect(() => {
    if (videoHidden) return;

    const syncOverlayWithRewind = () => {
      const nextOverlayProgress = clamp(rewindProgressRef.current / REWIND_THRESHOLD);
      overlayProgressRef.current = nextOverlayProgress;
      setOverlayProgress((prev) => (Math.abs(prev - nextOverlayProgress) > 0.001 ? nextOverlayProgress : prev));
    };

    const startRewind = () => {
      const video = videoRef.current;
      if (!video) return;

      if (phase === "intro") {
        interactionUnlockedRef.current = false;
        const rewindStartTime = clamp(video.currentTime, 0, Math.max(lastFrameTime, video.currentTime, 0));
        rewindStartTimeRef.current = rewindStartTime;
        video.pause();
        video.currentTime = rewindStartTime;
        setPhase("rewind");
        const seededOverlayProgress = Math.max(overlayProgressRef.current, 0.01);
        overlayProgressRef.current = seededOverlayProgress;
        setOverlayProgress((prev) => (Math.abs(prev - seededOverlayProgress) > 0.001 ? seededOverlayProgress : prev));
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (interactionUnlockedRef.current) return;
      if (phase === "done") return;
      if (event.deltaY === 0) return;
      if (phase !== "intro" && phase !== "rewind") return;

      const isDown = event.deltaY > 0;

      if (isDown) {
        if (phase === "intro") {
          startRewind();
        }
        autoRewindRef.current = true;
        const wheelBoost = clamp(event.deltaY, 0, MAX_WHEEL_DELTA);
        if (wheelBoost > 0) {
          rewindProgressRef.current = clamp(rewindProgressRef.current + wheelBoost / DOWN_WHEEL_BOOST_DISTANCE);
          syncOverlayWithRewind();
        }
        event.preventDefault();
        return;
      }

      if (phase === "intro") {
        startRewind();
      }

      event.preventDefault();
      const wheelDelta = clamp(event.deltaY, -MAX_WHEEL_DELTA, MAX_WHEEL_DELTA);
      rewindProgressRef.current = clamp(rewindProgressRef.current + wheelDelta / WHEEL_REWIND_DISTANCE);
      syncOverlayWithRewind();
    };

    const onTouchStart = (event: TouchEvent) => {
      if (!event.touches.length) return;
      lastTouchYRef.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (interactionUnlockedRef.current) return;
      if (phase === "done") return;
      if (!event.touches.length) return;
      if (phase !== "intro" && phase !== "rewind") return;

      const currentY = event.touches[0]?.clientY;
      if (currentY == null) return;

      if (phase === "intro") {
        startRewind();
      }

      const lastY = lastTouchYRef.current;
      lastTouchYRef.current = currentY;
      if (lastY == null) return;

      const delta = lastY - currentY;
      if (delta === 0) return;

      if (delta > 0) {
        autoRewindRef.current = true;
        const touchBoost = clamp(delta, 0, MAX_TOUCH_DELTA);
        if (touchBoost > 0) {
          rewindProgressRef.current = clamp(rewindProgressRef.current + touchBoost / DOWN_TOUCH_BOOST_DISTANCE);
          syncOverlayWithRewind();
        }
        event.preventDefault();
        return;
      }

      event.preventDefault();
      const touchDelta = clamp(delta, -MAX_TOUCH_DELTA, MAX_TOUCH_DELTA);
      rewindProgressRef.current = clamp(rewindProgressRef.current + touchDelta / TOUCH_REWIND_DISTANCE);
      syncOverlayWithRewind();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [phase, lastFrameTime, videoHidden]);

  useEffect(() => {
    if (phase !== "rewind") return;
    let lastTimestamp = performance.now();

    const animate = (timestamp: number) => {
      const video = videoRef.current;
      if (!video) return;
      const deltaMs = Math.max(timestamp - lastTimestamp, 0);
      lastTimestamp = timestamp;

      if (autoRewindRef.current) {
        const autoProgress = (deltaMs / AUTO_REWIND_MS) * REWIND_THRESHOLD;
        rewindProgressRef.current = clamp(rewindProgressRef.current + autoProgress);
      }

      const progress = rewindProgressRef.current;
      const nextOverlayProgress = clamp(progress / REWIND_THRESHOLD);
      overlayProgressRef.current = nextOverlayProgress;
      setOverlayProgress((prev) => (Math.abs(prev - nextOverlayProgress) > 0.001 ? nextOverlayProgress : prev));
      const rewindStartTime = Math.max(rewindStartTimeRef.current, 0);
      const targetTime = rewindStartTime * (1 - nextOverlayProgress);
      const maxStep = clamp((deltaMs / 1000) * 1.25, MIN_REWIND_STEP_SECONDS, MAX_REWIND_STEP_SECONDS);
      const deltaTime = targetTime - video.currentTime;
      const nextTime =
        Math.abs(deltaTime) > maxStep ? video.currentTime + Math.sign(deltaTime) * maxStep : targetTime;
      video.currentTime = nextTime;

      if (progress >= REWIND_THRESHOLD) {
        video.currentTime = 0;
        completeSequence();
        return;
      }

      rafRef.current = window.requestAnimationFrame(animate);
    };

    rafRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [phase, lastFrameTime]);

  useEffect(() => {
    if (phase !== "done") return;
    const timer = window.setTimeout(() => setVideoHidden(true), FADE_OUT_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (videoHidden) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden transition-opacity duration-[260ms] ease-smooth"
      style={{ opacity: phase === "done" ? 0 : 1 }}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        src="/site/ui-graphics/opening-video_seek.mp4?v=1"
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_40%_9%,rgba(243,245,248,0)_0%,rgba(241,242,244,0.86)_74%)]" />
      {showScrollHint && phase !== "done" ? (
        <p className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.18em] text-[#b3bac6]">
          Scroll down
        </p>
      ) : null}
    </div>
  );
}
