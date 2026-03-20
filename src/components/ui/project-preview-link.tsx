"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type MouseEvent, type ReactNode, type TouchEvent, type WheelEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PlaceholderProject, placeholderProjects } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";
import { MediaBlock } from "@/components/ui/media-block";
import { TagList } from "@/components/ui/tag-list";

type ProjectPreviewLinkProps = {
  project: PlaceholderProject;
  allProjects?: PlaceholderProject[];
  children: ReactNode;
  className?: string;
  href?: string;
};

type EntryPoint = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function ProjectPreviewLink({
  project,
  allProjects,
  children,
  className,
  href = `/work/${project.slug}`
}: ProjectPreviewLinkProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<PlaceholderProject>(project);
  const [mounted, setMounted] = useState(false);
  const [entryPoint, setEntryPoint] = useState<EntryPoint | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    setActiveProject(project);
  }, [project]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }

    let rafTwo: number | null = null;
    const rafOne = window.requestAnimationFrame(() => {
      rafTwo = window.requestAnimationFrame(() => {
        setEntered(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(rafOne);
      if (rafTwo != null) {
        window.cancelAnimationFrame(rafTwo);
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    router.prefetch(`/work/${activeProject.slug}`);
  }, [open, activeProject.slug, router]);

  const onTriggerClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();
    setEntryPoint({
      x: event.clientX || rect.left + rect.width / 2,
      y: event.clientY || rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height
    });

    setActiveProject(project);
    setOpen(true);
  };

  const projectPool = allProjects && allProjects.length > 0 ? allProjects : placeholderProjects;
  const activeIndex = projectPool.findIndex((item) => item.slug === activeProject.slug);
  const totalProjects = projectPool.length;
  const canNavigate = totalProjects > 1 && activeIndex >= 0;
  const previousProject = canNavigate ? projectPool[(activeIndex - 1 + totalProjects) % totalProjects] : null;
  const nextProject = canNavigate ? projectPool[(activeIndex + 1) % totalProjects] : null;
  const previewHref = `/work/${activeProject.slug}`;

  const navigatePreview = (direction: -1 | 1) => {
    if (!canNavigate) return;
    const nextIndex = (activeIndex + direction + totalProjects) % totalProjects;
    setActiveProject(projectPool[nextIndex]);
  };

  const viewportCenterX = typeof window === "undefined" ? 0 : window.innerWidth / 2;
  const viewportCenterY = typeof window === "undefined" ? 0 : window.innerHeight / 2;
  const fromX = entryPoint ? entryPoint.x - viewportCenterX : 0;
  const fromY = entryPoint ? entryPoint.y - viewportCenterY : 0;
  const fromScale = entryPoint ? clamp(Math.min(entryPoint.width / 680, entryPoint.height / 360), 0.42, 0.76) : 0.58;
  const popupMotionStyle = {
    opacity: entered ? 1 : 0.74,
    transform: entered ? "translate3d(0px, 0px, 0px) scale(1)" : `translate3d(${fromX}px, ${fromY}px, 0px) scale(${fromScale})`,
    transition: "transform 460ms cubic-bezier(0.22,1,0.36,1), opacity 360ms cubic-bezier(0.22,1,0.36,1)",
    willChange: "transform, opacity"
  };
  const cutoutMotionStyle = {
    ...popupMotionStyle,
    opacity: entered ? 1 : 0
  };
  const previewKind = activeProject.heroMediaKind ?? "image";
  const previewMediaSrc =
    previewKind === "video"
      ? activeProject.heroMediaSrc
      : activeProject.heroMediaSrc ?? activeProject.cardMediaSrc;
  const previewMediaPoster =
    previewKind === "video"
      ? activeProject.heroMediaPoster ?? activeProject.heroMediaSrc ?? activeProject.cardMediaSrc
      : undefined;
  const previewRole = activeProject.roles[0] ?? "Independent contributor";
  const previewTeam = activeProject.team ?? "Solo project";
  const previewTimeline = activeProject.timeline ?? `${activeProject.year}`;
  const previewTools = activeProject.tools.join(" ");
  const blockInsideScroll = (event: WheelEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const modal = open ? (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-3 md:p-6" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close project preview"
        className="no-glass-hover absolute inset-0 bg-transparent backdrop-blur-[3px]"
        style={{
          opacity: entered ? 1 : 0,
          transition: "opacity 320ms cubic-bezier(0.22,1,0.36,1)"
        }}
        onClick={() => setOpen(false)}
      />
      <div className="relative z-10 w-full max-w-4xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 rounded-card shadow-[0_0_36px_100vmax_rgba(0,0,0,0.64)]"
          style={cutoutMotionStyle}
        />
        {canNavigate ? (
          <button
            type="button"
            aria-label={`Preview previous project${previousProject ? `: ${previousProject.title}` : ""}`}
            className="no-glass-hover absolute left-0 top-1/2 z-30 flex h-11 w-11 -translate-x-[130%] -translate-y-1/2 items-center justify-center text-[1.6rem] leading-none text-[#b7bfcc] transition-colors hover:text-[#f8fafc]"
            onClick={() => navigatePreview(-1)}
          >
            &lt;
          </button>
        ) : null}
        {canNavigate ? (
          <button
            type="button"
            aria-label={`Preview next project${nextProject ? `: ${nextProject.title}` : ""}`}
            className="no-glass-hover absolute right-0 top-1/2 z-30 flex h-11 w-11 translate-x-[130%] -translate-y-1/2 items-center justify-center text-[1.6rem] leading-none text-[#b7bfcc] transition-colors hover:text-[#f8fafc]"
            onClick={() => navigatePreview(1)}
          >
            &gt;
          </button>
        ) : null}

        <div
          className="relative z-10 max-h-[90vh] overflow-hidden rounded-card border border-white/62 bg-white/[0.54] p-4 shadow-[0_28px_58px_-36px_rgba(0,0,0,0.56),inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(152,164,182,0.18)] backdrop-blur-[20px] md:p-6"
          style={popupMotionStyle}
          onWheelCapture={blockInsideScroll}
          onTouchMoveCapture={blockInsideScroll}
        >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_100%_at_0%_0%,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.28)_48%,rgba(255,255,255,0.08)_100%),linear-gradient(156deg,rgba(255,255,255,0.56)_0%,rgba(244,248,253,0.38)_56%,rgba(228,235,245,0.3)_100%)]"
        />
        <button
          type="button"
          aria-label="Close project preview"
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full text-base text-[#4e5666] transition-colors hover:text-[#f8fafc] md:right-4 md:top-4"
          onClick={() => setOpen(false)}
        >
          X
        </button>

        <div className="relative z-10 grid grid-cols-[0.86fr_1.14fr] items-stretch gap-3 md:gap-6">
          <div className="w-full">
            <MediaBlock
              label={activeProject.heroLabel}
              kind={previewKind}
              ratio="square"
              className="h-full w-full"
              src={previewMediaSrc}
              poster={previewMediaPoster}
            />
          </div>

          <div className="min-w-0">
            <div className="flex h-full min-h-0 flex-col gap-3.5 md:gap-4">
              <div>
              <p className="kicker">Project Preview</p>
              <h3 className="display-type text-clamp-2 mt-2 text-[1.2rem] font-semibold leading-tight text-[#161c24] md:text-[2rem]">
                {activeProject.title}
              </h3>
              <p className="text-clamp-1 mt-1 text-xs text-[#6d7687] md:text-sm">
                {activeProject.year} | {activeProject.type}
              </p>
            </div>

            <p className="text-clamp-2 text-xs leading-relaxed text-[#4f5868] md:text-base">{activeProject.oneLiner}</p>

              <dl className="space-y-2.5 rounded-soft bg-white/44 p-4">
                <div className="grid grid-cols-[4.9rem_1fr] gap-3">
                  <dt className="kicker">Role</dt>
                  <dd className="text-clamp-1 text-sm leading-relaxed text-[#596173]">{previewRole}</dd>
                </div>
                <div className="grid grid-cols-[4.9rem_1fr] gap-3">
                  <dt className="kicker">Team</dt>
                  <dd className="text-clamp-1 text-sm leading-relaxed text-[#596173]">{previewTeam}</dd>
                </div>
                <div className="grid grid-cols-[4.9rem_1fr] gap-3">
                  <dt className="kicker">INSTITUTION / YEAR</dt>
                  <dd className="text-clamp-1 text-sm leading-relaxed text-[#596173]">{previewTimeline}</dd>
                </div>
                <div className="grid grid-cols-[4.9rem_1fr] gap-3">
                  <dt className="kicker">Tools</dt>
                  <dd className="text-clamp-2 text-sm leading-relaxed text-[#596173]">{previewTools}</dd>
                </div>
              </dl>

            <TagList tags={activeProject.tags.slice(0, 3)} size="compact" />

            <div className="mt-auto flex justify-end pt-1">
              <Link
                href={previewHref}
                className="rounded-full px-3 py-2 text-xs font-semibold text-[#1a2029] transition-colors hover:text-[#f8fafc] md:px-4 md:py-2.5 md:text-sm"
              >
                  View Full Project
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <Link href={href} onClick={onTriggerClick} className={cn("block", className)}>
        {children}
      </Link>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
