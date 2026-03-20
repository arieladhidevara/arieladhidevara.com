"use client";

import { ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";

type InViewOptions = NonNullable<Parameters<typeof useInView>[1]>;

const FadeGroupContext = createContext<boolean | undefined>(undefined);

type FadeGroupProps = {
  children: ReactNode;
  className?: string;
  once?: boolean;
  amount?: InViewOptions["amount"];
  margin?: InViewOptions["margin"];
};

export function FadeGroup({
  children,
  className,
  once = true,
  amount = 0.2,
  margin = "0px"
}: FadeGroupProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inTriggerZone = useInView(ref, { amount, margin });
  const inViewport = useInView(ref, { amount: 0, margin: "0px" });
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (inTriggerZone) {
      setActive(true);
    }
  }, [inTriggerZone]);

  useEffect(() => {
    if (!once && !inViewport) {
      setActive(false);
    }
  }, [inViewport, once]);

  return (
    <div ref={ref} className={cn(className)}>
      <FadeGroupContext.Provider value={active}>{children}</FadeGroupContext.Provider>
    </div>
  );
}

export function useFadeGroupActive(): boolean | undefined {
  return useContext(FadeGroupContext);
}
