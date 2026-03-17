"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type JourneyPhase = {
  label: string;
  title: string;
  story: string;
  milestones: string[];
};

type TextTransition = {
  from: number;
  to: number;
  progress: number;
};

const STEP_SECONDS = 5;
const WHEEL_TRIGGER = 36;
const REWIND_FRAMES_PER_TICK = 0.55;
const FRAME_SECONDS = 1 / 30;
const MIN_REWIND_STEP_SECONDS = 0.004;
const MAX_REWIND_STEP_SECONDS = 0.028;
const SEQUENCE_COMPLETE_EPSILON = 0.75;
const TEXT_FADE_PORTION = 0.18;
const MAX_FORWARD_RATE = 2.8;
const MAX_BACKWARD_RATE = 2.4;
const BACKWARD_RATE_BOOST = 0.2;
const STEP_EPSILON = 0.02;
const CV_SCROLLBAR_CLASS = "cv-scrollbar-visible";

const phases: JourneyPhase[] = [
  {
    label: "Early Curiosity",
    title: "Early Curiosity",
    story:
      "I grew up with a deep curiosity about how things are made and how ideas become real. Long before design became my field, I was already fascinated by space, systems, and the process of building something from imagination into reality. That curiosity eventually shaped the direction of my life and pushed me to pursue education far beyond where I started.",
    milestones: [
      "Early life in Indonesia",
      "Interest in design, making, and problem solving",
      "Decision to pursue education abroad"
    ]
  },
  {
    label: "Leaving Home",
    title: "Leaving Home",
    story:
      "Leaving home was the first big leap in my journey. Moving to the United States meant stepping into uncertainty, but also into possibility. I left with one clear goal: to pursue a stronger education and build a future through design and architecture.",
    milestones: [
      "Moved from Indonesia to the United States",
      "Began academic journey abroad",
      "Committed to architecture and design"
    ]
  },
  {
    label: "Building the Foundation",
    title: "Building the Foundation",
    story:
      "Starting in a new country meant rebuilding everything from the ground up. These early years were about adaptation, persistence, and learning the fundamentals of architecture through constant practice. From drafting to model making, every studio session helped build the foundation for my future career.",
    milestones: [
      "GED, De Anza College",
      "A.S. in Architecture Design, Diablo Valley College",
      "Architecture Teaching Assistant",
      "Architecture & Engineering Lab Technician",
      "Internships in architecture and construction",
      "Early architecture competition recognition"
    ]
  },
  {
    label: "Architectural Training",
    title: "Architectural Training",
    story:
      "At Cal Poly, architecture became both a discipline and a language. Studio culture pushed me to think critically, iterate constantly, and translate ideas into spatial solutions. These years shaped how I approach design by balancing creativity with technical rigor and collaboration.",
    milestones: [
      "Bachelor of Architecture, Cal Poly San Luis Obispo",
      "President's Honor List",
      "Robin L. Rossi Scholarship",
      "Hilton Williams Architects Scholarship",
      "Morphosis Best Design Award",
      "Internship at CallisonRTKL"
    ]
  },
  {
    label: "Professional Practice",
    title: "Professional Practice",
    story:
      "After graduation, I entered professional practice and began working on real-world projects where design decisions carry real consequences. This phase taught me how architecture operates beyond the studio by coordinating with consultants, navigating building codes, and translating concepts into buildable solutions.",
    milestones: [
      "Architectural Designer, Paranni",
      "Design Coordinator, HGA Architects & Engineers",
      "Projects with major clients and complex building systems",
      "BIM coordination, documentation, and multidisciplinary collaboration"
    ]
  },
  {
    label: "Expanding the Field",
    title: "Expanding the Field",
    story:
      "While practicing architecture, I became increasingly interested in how technology is reshaping design. This curiosity led me to pursue graduate studies at Harvard, where I began exploring the intersection between architecture, computation, and interactive systems.",
    milestones: [
      "Master of Design Studies (Mediums / Technology), Harvard University",
      "Cross-registered HCI coursework at MIT",
      "Dean's Merit Scholarship Award"
    ]
  },
  {
    label: "Design Technologist",
    title: "Design Technologist",
    story:
      "Today my work sits at the intersection of design, technology, and human experience. I explore how emerging tools such as AI, interactive systems, and computational design can expand the possibilities of architecture and reshape how people interact with spaces and information.",
    milestones: [
      "Research and projects combining architecture and technology",
      "Development of interactive systems and computational tools",
      "Publication: PhysiCAD, SIGraDi Conference"
    ]
  }
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getViewportTopOffset() {
  return 0;
}

function isPointerOnScrollbar(event: WheelEvent) {
  if (typeof window === "undefined") return false;
  const scrollbarWidth = Math.max(window.innerWidth - document.documentElement.clientWidth, 14);
  return event.clientX >= window.innerWidth - scrollbarWidth;
}

export function CvPreviewSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const magnetRafRef = useRef<number | null>(null);
  const wheelResetTimerRef = useRef<number | null>(null);
  const magnetUnlockTimerRef = useRef<number | null>(null);
  const magnetAutoPlayTimerRef = useRef<number | null>(null);

  const isMagnetSnappingRef = useRef(false);
  const magnetEngagedRef = useRef(false);
  const stepVideoRef = useRef<(direction: -1 | 1) => void>(() => {});
  const autoKickStartedRef = useRef(false);
  const jumpToPhaseRef = useRef<(phaseIndex: number) => void>(() => {});
  const videoReadyRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const animationDirectionRef = useRef<0 | 1 | -1>(0);
  const forwardRateRef = useRef(1);
  const backwardRateRef = useRef(1);
  const backwardTargetTimeRef = useRef<number | null>(null);
  const sequenceCompletedRef = useRef(false);
  const holdPhaseIndexRef = useRef(0);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const wheelAccumulatorRef = useRef(0);

  const [playhead, setPlayhead] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [, setSequenceCompleted] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [holdPhaseIndex, setHoldPhaseIndex] = useState(0);
  const [textTransition, setTextTransition] = useState<TextTransition | null>(null);

  const progress = useMemo(() => {
    if (duration <= 0) return 0;
    return clamp(playhead / duration, 0, 1);
  }, [duration, playhead]);

  const resolvePausedPhaseIndex = (time: number) => {
    const index = Math.floor((time - STEP_SECONDS + STEP_EPSILON) / STEP_SECONDS);
    return clamp(index, 0, phases.length - 1);
  };

  const syncSequenceCompletion = (time: number) => {
    const knownDuration = durationRef.current;
    const done = knownDuration > 0 && time >= Math.max(knownDuration - SEQUENCE_COMPLETE_EPSILON, 0);
    if (sequenceCompletedRef.current === done) return;
    sequenceCompletedRef.current = done;
    setSequenceCompleted(done);
  };

  useEffect(() => {
    const hintTimer = window.setTimeout(() => {
      setShowHint(true);
    }, 2000);

    return () => {
      window.clearTimeout(hintTimer);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      const safeDuration = Number.isFinite(video.duration) ? video.duration : 0;
      const isReady = safeDuration > 0.01;
      videoReadyRef.current = isReady;
      setVideoReady(isReady);
      durationRef.current = safeDuration;
      setDuration(safeDuration);

      video.pause();
      video.currentTime = 0;
      currentTimeRef.current = 0;
      setPlayhead(0);
      sequenceCompletedRef.current = false;
      setSequenceCompleted(false);
      holdPhaseIndexRef.current = 0;
      setHoldPhaseIndex(0);
      setTextTransition(null);
    };

    const onError = () => {
      videoReadyRef.current = false;
      setVideoReady(false);
      sequenceCompletedRef.current = true;
      setSequenceCompleted(true);
    };

    const onTimeUpdate = () => {
      if (isAnimatingRef.current) return;
      currentTimeRef.current = video.currentTime;
      setPlayhead(video.currentTime);
      syncSequenceCompletion(video.currentTime);
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("error", onError);

    if (video.readyState >= 1) {
      onLoadedMetadata();
    }

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("error", onError);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const SNAP_TOLERANCE = 12;
    const MIN_VISIBLE_RATIO = 0.12;
    const MAGNET_LOCK_MS = 380;
    const AUTOPLAY_AFTER_SNAP_MS = 320;

    const scheduleMagnetUnlock = () => {
      if (magnetUnlockTimerRef.current != null) {
        window.clearTimeout(magnetUnlockTimerRef.current);
      }
      magnetUnlockTimerRef.current = window.setTimeout(() => {
        isMagnetSnappingRef.current = false;
      }, MAGNET_LOCK_MS);
    };

    const scheduleAutoPlay = () => {
      if (magnetAutoPlayTimerRef.current != null) {
        window.clearTimeout(magnetAutoPlayTimerRef.current);
      }
      magnetAutoPlayTimerRef.current = window.setTimeout(() => {
        stepVideoRef.current(1);
      }, AUTOPLAY_AFTER_SNAP_MS);
    };

    const snapToSection = () => {
      if (isMagnetSnappingRef.current) return;
      isMagnetSnappingRef.current = true;

      const topOffset = getViewportTopOffset();
      const rect = section.getBoundingClientRect();
      const targetY = window.scrollY + rect.top - topOffset;
      window.scrollTo({ top: targetY, behavior: "auto" });
      scheduleAutoPlay();
      scheduleMagnetUnlock();
    };

    const evaluateMagnet = () => {
      if (isMagnetSnappingRef.current) return;
      if (!videoReadyRef.current) return;
      if (sequenceCompletedRef.current) {
        magnetEngagedRef.current = false;
        return;
      }

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const visiblePx = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
      const visibleRatio = visiblePx / Math.max(Math.min(viewportHeight, rect.height || viewportHeight), 1);
      const topOffset = getViewportTopOffset();

      if (visibleRatio <= MIN_VISIBLE_RATIO) {
        magnetEngagedRef.current = false;
        return;
      }

      const isTopPinned = Math.abs(rect.top - topOffset) <= SNAP_TOLERANCE;
      if (isTopPinned) {
        magnetEngagedRef.current = true;
        return;
      }

      magnetEngagedRef.current = false;
      snapToSection();
    };

    const scheduleEvaluate = () => {
      if (magnetRafRef.current != null) return;
      magnetRafRef.current = window.requestAnimationFrame(() => {
        magnetRafRef.current = null;
        evaluateMagnet();
      });
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 0.5) return;
      if (isPointerOnScrollbar(event)) return;

      if (!videoReadyRef.current || sequenceCompletedRef.current) {
        scheduleEvaluate();
        return;
      }

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const visiblePx = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
      const visibleRatio = visiblePx / Math.max(Math.min(viewportHeight, rect.height || viewportHeight), 1);
      const topOffset = getViewportTopOffset();
      const isTopPinned = Math.abs(rect.top - topOffset) <= SNAP_TOLERANCE;

      if (visibleRatio > MIN_VISIBLE_RATIO && !isTopPinned) {
        event.preventDefault();
        evaluateMagnet();
        return;
      }

      scheduleEvaluate();
    };

    const onScroll = () => {
      scheduleEvaluate();
    };

    const onResize = () => {
      scheduleEvaluate();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    scheduleEvaluate();

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (magnetRafRef.current != null) {
        window.cancelAnimationFrame(magnetRafRef.current);
      }
      if (magnetUnlockTimerRef.current != null) {
        window.clearTimeout(magnetUnlockTimerRef.current);
      }
      if (magnetAutoPlayTimerRef.current != null) {
        window.clearTimeout(magnetAutoPlayTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const TOP_TOLERANCE = 28;
    const BOTTOM_TOLERANCE = 28;
    let raf: number | null = null;

    const evaluate = () => {
      const rect = section.getBoundingClientRect();
      const topOffset = getViewportTopOffset();
      const inFocusRange =
        rect.top <= topOffset + TOP_TOLERANCE &&
        rect.top >= topOffset - TOP_TOLERANCE &&
        rect.bottom >= window.innerHeight - BOTTOM_TOLERANCE;

      if (!inFocusRange) {
        autoKickStartedRef.current = false;
        return;
      }

      if (!videoReadyRef.current) return;
      if (sequenceCompletedRef.current) return;
      if (isAnimatingRef.current) return;
      if (currentTimeRef.current > 0.06) return;
      if (autoKickStartedRef.current) return;

      autoKickStartedRef.current = true;
      stepVideoRef.current(1);
    };

    const scheduleEvaluate = () => {
      if (raf != null) return;
      raf = window.requestAnimationFrame(() => {
        raf = null;
        evaluate();
      });
    };

    window.addEventListener("scroll", scheduleEvaluate, { passive: true });
    window.addEventListener("resize", scheduleEvaluate);
    scheduleEvaluate();

    return () => {
      window.removeEventListener("scroll", scheduleEvaluate);
      window.removeEventListener("resize", scheduleEvaluate);
      if (raf != null) {
        window.cancelAnimationFrame(raf);
      }
    };
  }, []);

  useEffect(() => {
    if (!videoReady) return;
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const topOffset = getViewportTopOffset();
    const inFocusRange = rect.top <= topOffset + 28 && rect.top >= topOffset - 28 && rect.bottom >= window.innerHeight - 28;
    if (!inFocusRange) return;
    if (sequenceCompletedRef.current) return;
    if (isAnimatingRef.current) return;
    if (currentTimeRef.current > 0.06) return;

    autoKickStartedRef.current = true;
    stepVideoRef.current(1);
  }, [videoReady]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let raf: number | null = null;

    const setScrollbarVisible = (visible: boolean) => {
      document.documentElement.classList.toggle(CV_SCROLLBAR_CLASS, visible);
      document.body.classList.toggle(CV_SCROLLBAR_CLASS, visible);
    };

    const evaluate = () => {
      const rect = section.getBoundingClientRect();
      const topOffset = getViewportTopOffset();
      const inFocusRange =
        rect.top <= topOffset + 28 && rect.top >= topOffset - 28 && rect.bottom >= window.innerHeight - 28;
      const inViewport = rect.bottom > 0 && rect.top < window.innerHeight;
      const visible = inFocusRange || (isMagnetSnappingRef.current && inViewport);
      setScrollbarVisible(visible);
    };

    const scheduleEvaluate = () => {
      if (raf != null) return;
      raf = window.requestAnimationFrame(() => {
        raf = null;
        evaluate();
      });
    };

    window.addEventListener("scroll", scheduleEvaluate, { passive: true });
    window.addEventListener("resize", scheduleEvaluate);
    window.addEventListener("wheel", scheduleEvaluate, { passive: true });
    scheduleEvaluate();

    return () => {
      window.removeEventListener("scroll", scheduleEvaluate);
      window.removeEventListener("resize", scheduleEvaluate);
      window.removeEventListener("wheel", scheduleEvaluate);
      if (raf != null) {
        window.cancelAnimationFrame(raf);
      }
      setScrollbarVisible(false);
    };
  }, []);

  useEffect(() => {
    const cleanupRaf = () => {
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const finishTransition = (time: number) => {
      const video = videoRef.current;
      if (!video) return;

      cleanupRaf();
      video.pause();
      video.playbackRate = 1;
      const boundedTime = clamp(time, 0, durationRef.current || time);
      video.currentTime = boundedTime;
      currentTimeRef.current = boundedTime;
      setPlayhead(boundedTime);
      isAnimatingRef.current = false;
      animationDirectionRef.current = 0;
      forwardRateRef.current = 1;
      backwardRateRef.current = 1;
      backwardTargetTimeRef.current = null;
      setIsTransitioning(false);
      syncSequenceCompletion(boundedTime);
      const pausedIndex = resolvePausedPhaseIndex(boundedTime);
      holdPhaseIndexRef.current = pausedIndex;
      setHoldPhaseIndex(pausedIndex);
      setTextTransition(null);
    };

    const interruptTransition = () => {
      finishTransition(currentTimeRef.current);
    };

    const playForwardStep = (targetTime: number, fromIndex: number, toIndex: number, fromTime: number) => {
      const video = videoRef.current;
      if (!video) return;
      if (toIndex !== fromIndex) {
        setTextTransition({ from: fromIndex, to: toIndex, progress: 0 });
      } else {
        setTextTransition(null);
      }

      cleanupRaf();
      isAnimatingRef.current = true;
      animationDirectionRef.current = 1;
      forwardRateRef.current = 1;
      setIsTransitioning(true);
      video.playbackRate = 1;
      const totalDistance = Math.max(targetTime - fromTime, 0.0001);

      const trackForward = () => {
        const currentVideo = videoRef.current;
        if (!currentVideo) {
          finishTransition(targetTime);
          return;
        }

        const now = currentVideo.currentTime;
        currentTimeRef.current = now;
        setPlayhead(now);
        if (toIndex !== fromIndex) {
          const rawProgress = clamp((now - fromTime) / totalDistance, 0, 1);
          const transitionProgress = clamp(rawProgress / TEXT_FADE_PORTION, 0, 1);
          setTextTransition((prev) => (prev ? { ...prev, progress: transitionProgress } : prev));
        }

        if (now >= targetTime - 0.04 || currentVideo.ended) {
          finishTransition(targetTime);
          return;
        }

        rafRef.current = window.requestAnimationFrame(trackForward);
      };

      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            rafRef.current = window.requestAnimationFrame(trackForward);
          })
          .catch(() => {
            finishTransition(targetTime);
          });
        return;
      }

      rafRef.current = window.requestAnimationFrame(trackForward);
    };

    const scrubBackwardStep = (targetTime: number, fromIndex: number, toIndex: number, fromTime: number) => {
      const video = videoRef.current;
      if (!video) return;

      const boundedTarget = clamp(targetTime, 0, durationRef.current || targetTime);
      if (isAnimatingRef.current && animationDirectionRef.current === -1) {
        const previousTarget = backwardTargetTimeRef.current ?? currentTimeRef.current;
        backwardTargetTimeRef.current = Math.min(previousTarget, boundedTarget);
        return;
      }
      if (toIndex !== fromIndex) {
        setTextTransition({ from: fromIndex, to: toIndex, progress: 0 });
      } else {
        setTextTransition(null);
      }

      cleanupRaf();
      video.pause();
      isAnimatingRef.current = true;
      animationDirectionRef.current = -1;
      backwardRateRef.current = 1;
      setIsTransitioning(true);
      backwardTargetTimeRef.current = boundedTarget;
      let lastTimestamp = performance.now();
      const totalDistance = Math.max(fromTime - boundedTarget, 0.0001);

      const trackBackward = (timestamp: number) => {
        const currentVideo = videoRef.current;
        if (!currentVideo) {
          finishTransition(backwardTargetTimeRef.current ?? boundedTarget);
          return;
        }

        const activeTarget = backwardTargetTimeRef.current ?? boundedTarget;
        const deltaMs = Math.max(timestamp - lastTimestamp, 0);
        lastTimestamp = timestamp;
        const normalizedTick = deltaMs / (1000 / 60);
        const desiredStep =
          FRAME_SECONDS * REWIND_FRAMES_PER_TICK * normalizedTick * clamp(backwardRateRef.current, 1, MAX_BACKWARD_RATE);
        const frameStep = clamp(desiredStep, MIN_REWIND_STEP_SECONDS, MAX_REWIND_STEP_SECONDS);
        const next = Math.max(activeTarget, currentVideo.currentTime - frameStep);
        currentVideo.currentTime = next;
        currentTimeRef.current = next;
        setPlayhead(next);
        if (toIndex !== fromIndex) {
          const rawProgress = clamp((fromTime - next) / totalDistance, 0, 1);
          const transitionProgress = clamp(rawProgress / TEXT_FADE_PORTION, 0, 1);
          setTextTransition((prev) => (prev ? { ...prev, progress: transitionProgress } : prev));
        }

        if (next <= activeTarget + 0.0001) {
          const settledTarget = backwardTargetTimeRef.current ?? activeTarget;
          if (next <= settledTarget + 0.0001) {
            finishTransition(settledTarget);
            return;
          }
        }

        if (currentVideo.currentTime <= 0.0001 && activeTarget <= 0.0001) {
          finishTransition(0);
          return;
        }

        rafRef.current = window.requestAnimationFrame(trackBackward);
      };

      rafRef.current = window.requestAnimationFrame(trackBackward);
    };

    const resolveNextStopTime = (current: number, knownDuration: number) => {
      const base = Math.floor(current / STEP_SECONDS) * STEP_SECONDS;
      return clamp(base + STEP_SECONDS, 0, knownDuration);
    };

    const resolvePreviousStopTime = (current: number, knownDuration: number) => {
      const base = Math.floor((current - STEP_EPSILON) / STEP_SECONDS) * STEP_SECONDS;
      return clamp(base, 0, knownDuration);
    };

    const stepVideo = (direction: -1 | 1) => {
      const video = videoRef.current;
      if (!video) return;
      if (direction > 0 && isAnimatingRef.current) return;

      const knownDuration = durationRef.current || video.duration;
      if (!Number.isFinite(knownDuration) || knownDuration <= 0) return;

      const rewindBase =
        direction < 0 && animationDirectionRef.current === -1 && backwardTargetTimeRef.current != null
          ? backwardTargetTimeRef.current
          : currentTimeRef.current;
      const current = rewindBase;
      const targetTime =
        direction > 0 ? resolveNextStopTime(current, knownDuration) : resolvePreviousStopTime(current, knownDuration);
      if (Math.abs(targetTime - current) < 0.03) return;

      const fromIndex = resolvePausedPhaseIndex(current);
      const toIndex = resolvePausedPhaseIndex(targetTime);

      if (direction > 0) {
        playForwardStep(targetTime, fromIndex, toIndex, current);
      } else {
        scrubBackwardStep(targetTime, fromIndex, toIndex, current);
      }
    };
    stepVideoRef.current = stepVideo;

    const jumpToPhase = (phaseIndex: number) => {
      const video = videoRef.current;
      if (!video) return;

      if (isAnimatingRef.current) {
        interruptTransition();
      }

      const knownDuration = durationRef.current || video.duration;
      if (!Number.isFinite(knownDuration) || knownDuration <= 0) return;

      const boundedIndex = clamp(phaseIndex, 0, phases.length - 1);
      const rawTarget = (boundedIndex + 1) * STEP_SECONDS;
      const targetTime = clamp(rawTarget, 0, knownDuration);

      video.pause();
      video.playbackRate = 1;
      video.currentTime = targetTime;
      currentTimeRef.current = targetTime;
      setPlayhead(targetTime);
      holdPhaseIndexRef.current = boundedIndex;
      setHoldPhaseIndex(boundedIndex);
      setTextTransition(null);
      wheelAccumulatorRef.current = 0;
      setShowHint(false);
      syncSequenceCompletion(targetTime);
    };
    jumpToPhaseRef.current = jumpToPhase;

    const onWheel = (event: WheelEvent) => {
      const section = sectionRef.current;
      if (!section) return;
      if (!videoReadyRef.current) return;
      if (isPointerOnScrollbar(event)) return;

      const rect = section.getBoundingClientRect();
      const topOffset = getViewportTopOffset();
      const inFocusRange =
        rect.top <= topOffset + 28 && rect.top >= topOffset - 28 && rect.bottom >= window.innerHeight - 28;
      if (!inFocusRange) return;

      const delta = event.deltaY;
      if (Math.abs(delta) < 1) return;

      const lockActive = videoReadyRef.current && !sequenceCompletedRef.current;
      if (lockActive) {
        event.preventDefault();
        setShowHint(false);
      }

      const current = currentTimeRef.current;
      const knownDuration = durationRef.current;
      if (!Number.isFinite(knownDuration) || knownDuration <= 0) return;
      const canStepForward = current < knownDuration - 0.04;
      const canStepBackward = current > 0.04;

      if (delta < 0) {
        if (!canStepBackward && !(isAnimatingRef.current && animationDirectionRef.current === -1)) return;
        event.preventDefault();
        setShowHint(false);
        wheelAccumulatorRef.current = 0;

        if (isAnimatingRef.current && animationDirectionRef.current === 1) {
          interruptTransition();
          stepVideo(-1);
          return;
        }

        if (isAnimatingRef.current && animationDirectionRef.current === -1) {
          const boosted = clamp(backwardRateRef.current + BACKWARD_RATE_BOOST, 1, MAX_BACKWARD_RATE);
          backwardRateRef.current = boosted;
          return;
        }

        stepVideo(-1);
        return;
      }

      const shouldIntercept =
        isAnimatingRef.current || (delta > 0 ? canStepForward : canStepBackward);

      if (!shouldIntercept) return;

      event.preventDefault();
      setShowHint(false);

      if (isAnimatingRef.current) {
        if (delta > 0 && animationDirectionRef.current === -1) {
          wheelAccumulatorRef.current = 0;
          interruptTransition();
          stepVideo(1);
          return;
        }

        if (delta > 0 && animationDirectionRef.current === 1) {
          const video = videoRef.current;
          if (video) {
            const boosted = clamp(forwardRateRef.current + 0.25, 1, MAX_FORWARD_RATE);
            forwardRateRef.current = boosted;
            video.playbackRate = boosted;
          }
        }
        return;
      }

      wheelAccumulatorRef.current += delta;

      if (wheelResetTimerRef.current != null) {
        window.clearTimeout(wheelResetTimerRef.current);
      }
      wheelResetTimerRef.current = window.setTimeout(() => {
        wheelAccumulatorRef.current = 0;
      }, 220);

      if (wheelAccumulatorRef.current >= WHEEL_TRIGGER) {
        wheelAccumulatorRef.current = 0;
        stepVideo(1);
        return;
      }

      if (wheelAccumulatorRef.current <= -WHEEL_TRIGGER) {
        wheelAccumulatorRef.current = 0;
        stepVideo(-1);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      stepVideoRef.current = () => {};
      jumpToPhaseRef.current = () => {};
      if (wheelResetTimerRef.current != null) {
        window.clearTimeout(wheelResetTimerRef.current);
      }
      cleanupRaf();
    };
  }, []);

  const hasTextTransition = Boolean(textTransition && textTransition.from !== textTransition.to);
  const transitionProgress = hasTextTransition ? clamp(textTransition?.progress ?? 0, 0, 1) : 1;
  const incomingPhase = phases[hasTextTransition ? textTransition!.to : holdPhaseIndex];
  const displayPhaseIndex = hasTextTransition ? textTransition!.to : holdPhaseIndex;
  const useTopLayout = displayPhaseIndex < 2;
  const useBottomLeftCard = displayPhaseIndex === 2 || displayPhaseIndex === 4;
  const useBottomRightCard = !useTopLayout && !useBottomLeftCard;
  const firstSceneReveal = clamp(playhead / STEP_SECONDS, 0, 1);
  const staticReveal =
    !hasTextTransition && holdPhaseIndex === 0 && playhead <= STEP_SECONDS + 0.04 ? firstSceneReveal : 1;
  const videoOpacity = isTransitioning ? 1 : 0.6;

  const milestoneReveal = (baseProgress: number, index: number, total: number) => {
    const start = 0.14 + (index / Math.max(total, 1)) * 0.68;
    return clamp((baseProgress - start) / 0.2, 0, 1);
  };

  const renderPhaseCard = (
    phase: JourneyPhase,
    cardOpacity: number,
    revealProgress: number,
    translateY: number
  ) => (
    <div
      className="relative overflow-hidden rounded-card border border-white/42 bg-white/[0.2] p-4 shadow-[0_24px_52px_-38px_rgba(14,20,29,0.46)] backdrop-blur-[20px] transition-all duration-500 ease-smooth md:p-5"
      style={{
        opacity: cardOpacity,
        transform: `translateY(${translateY}px)`
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_88%_at_0%_0%,rgba(255,255,255,0.36)_0%,rgba(255,255,255,0)_52%),linear-gradient(156deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.06)_58%,rgba(223,229,239,0.2)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-card shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(125,138,157,0.16)]"
      />

      <div className="relative z-10">
        <p className="kicker">Career Journey</p>
        <h3
          className="display-type mt-3 text-2xl font-semibold leading-[1.1] text-[#131920] md:text-4xl"
          style={{
            opacity: revealProgress,
            transform: `translateY(${(1 - revealProgress) * 12}px)`
          }}
        >
          {phase.title}
        </h3>
        <p
          className="mt-3 max-w-xl text-xs leading-relaxed text-[#576173] md:text-sm"
          style={{
            opacity: revealProgress,
            transform: `translateY(${(1 - revealProgress) * 10}px)`
          }}
        >
          {phase.story}
        </p>
        <p className="mt-4 text-[0.64rem] uppercase tracking-[0.18em] text-[#8d95a2]">Milestones</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {phase.milestones.map((milestone, index) => {
            const reveal = milestoneReveal(revealProgress, index, phase.milestones.length);
            return (
              <p
                key={milestone}
                className="rounded-soft border border-white/45 bg-white/[0.2] px-2.5 py-1.5 text-[11px] leading-snug text-[#3f4755] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-lg"
                style={{
                  opacity: reveal * cardOpacity,
                  transform: `translateY(${(1 - reveal) * 8}px) scale(${0.98 + reveal * 0.02})`
                }}
              >
                {milestone}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={sectionRef} className="relative h-[100dvh] min-h-[100svh] w-full overflow-hidden bg-[#ecedf0]">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out"
        style={{ opacity: videoOpacity }}
        src="/site/ui-graphics/cv-journey/Ariels_journey_seek.mp4?v=1"
        preload="auto"
        muted
        playsInline
        aria-label="Ariel career journey video"
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(240,242,246,0.08),rgba(236,238,242,0.13)_54%,rgba(233,235,240,0.2))]" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_84%_at_16%_10%,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_58%),radial-gradient(100%_76%_at_84%_90%,rgba(223,228,237,0.22)_0%,rgba(223,228,237,0)_62%)]" />

      <div
        className={cn(
          "relative z-10 mx-auto flex h-full w-full max-w-layout flex-col px-5 pb-7 pt-14 md:px-8 md:pb-9 md:pt-16",
          useTopLayout ? "justify-between" : "justify-end gap-4"
        )}
      >
        <div
          className={cn(
            "relative",
            useTopLayout
              ? "max-w-2xl"
              : useBottomRightCard
                ? "ml-auto w-full max-w-xl"
                : "mr-auto w-full max-w-xl"
          )}
        >
          {hasTextTransition ? (
            renderPhaseCard(incomingPhase, transitionProgress, transitionProgress, (1 - transitionProgress) * 14)
          ) : (
            renderPhaseCard(incomingPhase, staticReveal, staticReveal, (1 - staticReveal) * 10)
          )}
        </div>

        <div className="rounded-card bg-[#ecf0f5]/82 p-4 backdrop-blur-[2px] md:p-5">
          <div className="h-[2px] w-full overflow-hidden rounded-full bg-black/[0.08]">
            <div
              className="h-full rounded-full bg-[#1a212b] transition-[width] duration-200 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-7">
            {phases.map((phase, index) => {
              const active = index === displayPhaseIndex;
              return (
                <button
                  key={phase.label}
                  type="button"
                  onClick={() => jumpToPhaseRef.current(index)}
                  aria-label={`Jump to ${phase.title}`}
                  className={`rounded-soft border px-2.5 py-1.5 transition-all duration-300 ${
                    active
                      ? "border-white/85 bg-white/[0.6] shadow-[0_0_0_1px_rgba(255,255,255,0.85),0_0_22px_rgba(255,255,255,0.7)] backdrop-blur-md"
                      : "border-black/[0.05] bg-black/[0.015] opacity-55 hover:bg-black/[0.03] hover:opacity-80"
                  }`}
                >
                  <p
                    className={`text-[0.54rem] uppercase tracking-[0.15em] ${
                      active ? "text-[#9099a7]" : "text-[#b4bcc9]"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className={`mt-1 text-[11px] leading-snug ${active ? "text-[#161c24]" : "text-[#98a2b2]"}`}>{phase.title}</p>
                </button>
              );
            })}
          </div>

          {!videoReady ? (
            <p className="mt-4 text-xs text-[#8e96a4]">Preparing journey sequence...</p>
          ) : showHint ? (
            <p className="mt-4 text-xs text-[#8e96a4]">
              {isTransitioning
                ? "Segment running. Scroll down to speed up, or scroll up to run backward."
                : "Scroll down: +5s per segment. Scroll up: play backward by segment."}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
