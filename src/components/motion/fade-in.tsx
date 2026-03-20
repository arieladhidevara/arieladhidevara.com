"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFadeGroupActive } from "@/components/motion/fade-group";

type InViewOptions = NonNullable<Parameters<typeof useInView>[1]>;

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  active?: boolean;
  once?: boolean;
  amount?: InViewOptions["amount"];
  margin?: InViewOptions["margin"];
};

export function FadeIn({
  children,
  className,
  delay = 0,
  y = 24,
  active,
  once = true,
  amount = 0.2,
  margin = "0px"
}: FadeInProps) {
  const groupActive = useFadeGroupActive();
  const ref = useRef<HTMLDivElement | null>(null);
  const inTriggerZone = useInView(ref, { amount, margin });
  const inViewport = useInView(ref, { amount: 0, margin: "0px" });
  const [selfVisible, setSelfVisible] = useState(false);
  const [controlledVisible, setControlledVisible] = useState(false);
  const externalActive = typeof active === "boolean" ? active : groupActive;
  const isControlled = typeof externalActive === "boolean";

  useEffect(() => {
    if (isControlled) return;
    if (inTriggerZone) {
      setSelfVisible(true);
    }
  }, [inTriggerZone, isControlled]);

  useEffect(() => {
    if (isControlled) return;
    if (!once && !inViewport) {
      setSelfVisible(false);
    }
  }, [inViewport, once, isControlled]);

  useEffect(() => {
    if (!isControlled) return;
    if (externalActive) {
      setControlledVisible(true);
      return;
    }
    if (!once) {
      setControlledVisible(false);
    }
  }, [externalActive, isControlled, once]);

  const isVisible = isControlled ? controlledVisible : selfVisible;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : y }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
