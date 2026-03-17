"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const workCategories = [
  "Interactive Systems",
  "AI & Software",
  "Spatial & Architectural Design",
  "Objects & Product",
  "Visual & Media"
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openDesktopMenu = () => {
    clearCloseTimer();
    setDesktopOpen(true);
  };

  const closeDesktopMenu = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setDesktopOpen(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      <div className="relative z-10 w-full border-b border-black/[0.07] bg-white/78 backdrop-blur-lg">
        <div className="mx-auto flex h-[35px] w-full max-w-layout items-center justify-between px-4 md:px-6">
          <Link href="/" aria-label="Ariel Adhidevara Home" className="inline-flex items-center">
            <Image
              src="/brand/logo_black.png"
              alt="Ariel Adhidevara logo"
              width={18}
              height={18}
              className="h-[18px] w-[18px] rounded-sm object-cover"
              priority
            />
          </Link>

          <nav className="hidden items-center md:flex">
            <div className="relative" onMouseEnter={openDesktopMenu} onMouseLeave={closeDesktopMenu}>
              <button
                type="button"
                aria-label="Open navigation menu"
                className="inline-flex h-7 w-7 self-center items-center justify-center rounded-full border border-black/[0.08] text-[#2b313c] transition-colors hover:bg-black/[0.03]"
              >
                <span className="relative -translate-y-[0.5px] flex flex-col gap-[3px]">
                  <span className="block h-px w-4 bg-current" />
                  <span className="block h-px w-4 bg-current" />
                  <span className="block h-px w-4 bg-current" />
                </span>
              </button>

              <div
                className={cn(
                  "absolute right-0 top-full w-72 pt-2 transition-all duration-200 ease-smooth",
                  desktopOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
                )}
              >
                <div className="overflow-hidden rounded-soft border border-black/[0.07] bg-white/[0.86] shadow-[0_18px_34px_-26px_rgba(14,20,29,0.34)] backdrop-blur-[44px] backdrop-saturate-[1.9]">
                  <div>
                    <Link
                      href="/work"
                      className="block rounded-t-soft px-3 py-2 text-sm font-medium text-[#2e3542] transition-colors hover:bg-black/[0.03] hover:text-[#0f141b]"
                    >
                      All Works
                    </Link>

                    <p className="px-3 pb-1 pt-1 text-[10px] uppercase tracking-[0.14em] text-[#8a93a3]">Categories</p>
                    <div className="space-y-0.5 px-2 pb-2">
                      {workCategories.map((category) => (
                        <Link
                          key={category}
                          href={{ pathname: "/work", query: { category } }}
                          className="block rounded-xl px-3 py-2 text-sm text-[#3e4451] transition-colors hover:bg-black/[0.04] hover:text-[#11151b]"
                        >
                          {category}
                        </Link>
                      ))}
                    </div>

                    <div className="border-t border-black/[0.08] px-2 py-2">
                      <Link
                        href="/about"
                        className="block rounded-xl px-3 py-2 text-sm text-[#3e4451] transition-colors hover:bg-black/[0.04] hover:text-[#11151b]"
                      >
                        About
                      </Link>
                      <Link
                        href="/#contact"
                        className="block rounded-xl px-3 py-2 text-sm text-[#3e4451] transition-colors hover:bg-black/[0.04] hover:text-[#11151b]"
                      >
                        Contact
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <button
            className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/[0.08] text-[#2b313c] md:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span
              className={cn(
                "block h-px w-4 bg-current transition-transform duration-300",
                open && "translate-y-[1.5px] rotate-45"
              )}
            />
            <span
              className={cn(
                "absolute block h-px w-4 bg-current transition-transform duration-300",
                open && "-translate-y-[1.5px] -rotate-45"
              )}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-2 max-w-layout rounded-soft border border-black/[0.07] bg-white/92 p-4 backdrop-blur-lg md:hidden"
          >
            <nav className="flex flex-col gap-1">
              <Link
                href="/work"
                className="rounded-xl px-3 py-2 text-sm font-medium text-[#2e3542] transition-colors hover:bg-black/[0.03] hover:text-[#0f141b]"
                onClick={() => setOpen(false)}
              >
                Works
              </Link>

              <p className="px-3 pt-2 text-[10px] uppercase tracking-[0.14em] text-[#8f97a6]">Categories</p>
              {workCategories.map((category) => (
                <Link
                  key={category}
                  href={{ pathname: "/work", query: { category } }}
                  className="rounded-xl px-3 py-2 text-sm text-[#3e4451] transition-colors hover:bg-black/[0.03] hover:text-[#0f141b]"
                  onClick={() => setOpen(false)}
                >
                  {category}
                </Link>
              ))}

              <div className="mt-1 border-t border-black/[0.08] pt-2">
                <Link
                  href="/about"
                  className="block rounded-xl px-3 py-2 text-sm text-[#3e4451] transition-colors hover:bg-black/[0.03] hover:text-[#0f141b]"
                  onClick={() => setOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/#contact"
                  className="block rounded-xl px-3 py-2 text-sm text-[#3e4451] transition-colors hover:bg-black/[0.03] hover:text-[#0f141b]"
                  onClick={() => setOpen(false)}
                >
                  Contact
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

