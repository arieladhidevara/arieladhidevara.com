"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const INTRO_KEY = "ariel_intro_v2";

export function IntroSequence() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const hasPlayed = window.sessionStorage.getItem(INTRO_KEY);
      if (hasPlayed === "1") {
        setShow(false);
        return;
      }
      setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  useEffect(() => {
    if (!show) return;

    const delay = reduceMotion ? 850 : 2100;
    const timer = window.setTimeout(() => {
      setShow(false);
      try {
        window.sessionStorage.setItem(INTRO_KEY, "1");
      } catch {
        // ignore storage failures in restricted mode
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [show, reduceMotion]);

  return (
    <AnimatePresence>
      {mounted && show ? (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[120] overflow-hidden bg-[#f3f4f6]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(188,197,213,0.38)_0%,transparent_45%),radial-gradient(circle_at_84%_6%,rgba(215,220,231,0.6)_0%,transparent_42%)]" />

          <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
            <motion.span
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 148, opacity: 1 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 h-px bg-[#1c2129]/20"
            />

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="display-type text-3xl font-semibold tracking-[0.04em] text-[#141920] md:text-5xl"
            >
              Ariel Adhidevara
            </motion.h1>

            <motion.p
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 text-xs tracking-[0.2em] text-[#5f6674] md:text-sm"
            >
              CREATIVE TECHNOLOGY PORTFOLIO
            </motion.p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
