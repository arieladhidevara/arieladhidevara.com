"use client";

import { useRef, useState, useEffect } from "react";
import { FadeIn } from "@/components/motion/fade-in";
import { ProjectPreviewLink } from "@/components/ui/project-preview-link";
import { MediaBlock } from "@/components/ui/media-block";
import { getProjectCardImageSrc } from "@/lib/project-media";
import type { PlaceholderProject } from "@/lib/placeholder-data";

type Props = {
  projects: PlaceholderProject[];
  allProjects: PlaceholderProject[];
};

export function OthersCarousel({ projects, allProjects }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const syncNav = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 1);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    syncNav();
    const el = trackRef.current;
    el?.addEventListener("scroll", syncNav, { passive: true });
    return () => el?.removeEventListener("scroll", syncNav);
  }, []);

  if (projects.length === 0) return null;

  const scroll = (dir: "prev" | "next") => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "next" ? el.clientWidth : -el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="relative pb-2">
      <div
        ref={trackRef}
        className="grid grid-flow-col gap-4 overflow-x-auto overflow-y-hidden [grid-auto-columns:calc(25%-12px)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((project, index) => (
          <FadeIn key={project.slug} delay={index * 0.04}>
            <ProjectPreviewLink
              project={project}
              allProjects={allProjects}
              className="no-glass-hover group flex h-[22rem] flex-col rounded-soft border border-black/[0.05] bg-white/[0.18] p-3.5 shadow-[0_18px_34px_-30px_rgba(14,20,29,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-[14px] transition-colors hover:bg-white/[0.88]"
            >
              <MediaBlock
                label={project.heroLabel}
                kind="image"
                ratio="wide"
                className="rounded-soft"
                src={getProjectCardImageSrc(project)}
                colorOnHover
              />
              <div className="mt-3 flex flex-1 flex-col gap-1.5 overflow-hidden">
                <p className="display-type overflow-hidden text-lg font-semibold leading-tight text-[#171c24] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                  {project.title}
                </p>
                <p className="truncate text-xs text-[#677082]">
                  {project.year} | {project.type}
                </p>
                <p className="overflow-hidden text-xs leading-relaxed text-[#505868] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                  {project.oneLiner}
                </p>
              </div>
            </ProjectPreviewLink>
          </FadeIn>
        ))}
      </div>

      {canPrev && (
        <button
          onClick={() => scroll("prev")}
          aria-label="Previous"
          className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 pr-3 text-4xl text-[#596173] transition-colors hover:text-[#1a2029]"
        >
          ‹
        </button>
      )}

      {canNext && (
        <button
          onClick={() => scroll("next")}
          aria-label="Next"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-3 text-4xl text-[#596173] transition-colors hover:text-[#1a2029]"
        >
          ›
        </button>
      )}
    </div>
  );
}
