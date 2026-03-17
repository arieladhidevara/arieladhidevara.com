"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const resolvedPathname = pathname ?? "";
  const isProjectDetail = /^\/work\/[^/]+$/.test(resolvedPathname);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={resolvedPathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {isProjectDetail ? (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[90] bg-white"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : null}

        {children}
      </motion.div>
    </AnimatePresence>
  );
}
