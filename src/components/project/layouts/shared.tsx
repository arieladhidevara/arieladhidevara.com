import type { ReactNode } from "react";
import { FadeIn } from "@/components/motion/fade-in";
import { MediaBlock } from "@/components/ui/media-block";
import { SectionMediaCarousel, type SectionMediaCarouselItem } from "@/components/project/section-media-carousel";
import { ProjectMediaScrollSequence } from "@/components/project/project-media-scroll-sequence";
import { resolveAssetUrl } from "@/lib/asset-url";
import type { PlaceholderProject, PlaceholderInteractiveModule } from "@/lib/placeholder-data";

export type { SectionMediaCarouselItem };

export type NarrativeSectionKey =
  | "overview"
  | "background"
  | "concept"
  | "theProject"
  | "process"
  | "reflectionImpact"
  | "documentation";

export const SECTION_TO_ASSET_FOLDER: Record<
  NarrativeSectionKey,
  "overview" | "background" | "concept" | "the-project" | "process" | "reflection" | "documentation"
> = {
  overview: "overview",
  background: "background",
  concept: "concept",
  theProject: "the-project",
  process: "process",
  reflectionImpact: "reflection",
  documentation: "documentation"
};

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".m4v", ".webm", ".mkv"]);

export const TITLE_MEDIA_DELAY = 0.04;
export const BODY_TEXT_DELAY = 0.2;
export const BODY_META_DELAY = 0.26;
export const PROJECT_FADE_VIEWPORT = {
  once: false,
  amount: 0,
  margin: "-49% 0px -49% 0px"
} as const;

export type ProjectLayoutProps = {
  project: PlaceholderProject;
  relatedProjects: PlaceholderProject[];
  allProjects: PlaceholderProject[];
  afterOverviewModules: PlaceholderInteractiveModule[];
  afterConceptModules: PlaceholderInteractiveModule[];
  afterProjectModules: PlaceholderInteractiveModule[];
  beforeDocumentationModules: PlaceholderInteractiveModule[];
};

function extensionOf(assetPath: string): string {
  const normalized = assetPath.replace(/\\/g, "/");
  const fileName = normalized.split("/").pop() ?? "";
  const index = fileName.lastIndexOf(".");
  return index >= 0 ? fileName.slice(index).toLowerCase() : "";
}

export function isVideoAsset(assetPath: string): boolean {
  return VIDEO_EXTENSIONS.has(extensionOf(assetPath));
}

export function isImageAsset(assetPath: string): boolean {
  return IMAGE_EXTENSIONS.has(extensionOf(assetPath));
}

export function assetLabel(assetPath: string): string {
  const normalized = assetPath.replace(/\\/g, "/");
  const fileName = normalized.split("/").pop() ?? assetPath;
  const stem = fileName.replace(/\.[^/.]+$/, "");
  return stem.replace(/[-_]+/g, " ").trim() || fileName;
}

export function getSectionAssetData(project: PlaceholderProject, sectionKey: NarrativeSectionKey) {
  const folder = SECTION_TO_ASSET_FOLDER[sectionKey];
  const sectionAssets = (project.assetsBySection?.[folder] ?? []).filter(Boolean);
  const mediaAssets = sectionAssets.filter((p) => isImageAsset(p) || isVideoAsset(p));
  const fileAssets = sectionAssets.filter((p) => !isImageAsset(p) && !isVideoAsset(p));
  const mediaItems: SectionMediaCarouselItem[] = mediaAssets.map((assetPath) => ({
    key: `${sectionKey}-${assetPath}`,
    kind: isVideoAsset(assetPath) ? "video" : ("image" as "video" | "image"),
    label: `${project.title} - ${assetLabel(assetPath)}`,
    src: resolveAssetUrl(assetPath)
  }));
  return { mediaItems, fileAssets };
}

export function renderMediaLayout(sectionKey: NarrativeSectionKey, mediaItems: SectionMediaCarouselItem[]): ReactNode {
  if (mediaItems.length === 0) return null;

  const useCarousel = (sectionKey === "documentation" && mediaItems.length > 1) || mediaItems.length > 3;
  if (useCarousel) {
    return <SectionMediaCarousel items={mediaItems} />;
  }

  return (
    <div className={mediaItems.length === 1 ? "grid gap-4" : "grid gap-4 md:grid-cols-2"}>
      {mediaItems.map((item, index) => {
        const spanClass = mediaItems.length === 3 && index === 0 ? "md:col-span-2" : "";
        const ratio = mediaItems.length === 1 ? "wide" : mediaItems.length === 3 && index > 0 ? "square" : "wide";
        return (
          <FadeIn {...PROJECT_FADE_VIEWPORT} key={item.key} delay={index * 0.03} className={spanClass}>
            <MediaBlock kind={item.kind} ratio={ratio} label={item.label} src={item.src} poster={item.poster} />
          </FadeIn>
        );
      })}
    </div>
  );
}

export function renderSectionAssets(project: PlaceholderProject, sectionKey: NarrativeSectionKey): ReactNode {
  const { mediaItems, fileAssets } = getSectionAssetData(project, sectionKey);
  if (mediaItems.length === 0 && fileAssets.length === 0) return null;

  return (
    <div className="mt-7 space-y-5">
      {renderMediaLayout(sectionKey, mediaItems)}
      {fileAssets.length > 0 ? (
        <div className="flex flex-wrap gap-2.5">
          {fileAssets.map((assetPath) => (
            <a
              key={`${sectionKey}-file-${assetPath}`}
              href={resolveAssetUrl(assetPath)}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-black/[0.06] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.13em] text-[#495162] transition-colors hover:bg-black/[0.1] hover:text-[#1d232d]"
            >
              {assetLabel(assetPath)}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function renderMediaColumn(
  sectionKey: NarrativeSectionKey,
  mediaItems: SectionMediaCarouselItem[],
  options?: {
    projectSequence?: boolean;
    mediaClassName?: string;
    sequenceClassName?: string;
    showFooter?: boolean;
    fadeOutOnLastScroll?: boolean;
  }
): ReactNode {
  if (mediaItems.length === 0) return null;

  if (options?.projectSequence) {
    return (
      <ProjectMediaScrollSequence
        items={mediaItems}
        syncToPageScroll
        className={options.sequenceClassName ?? "w-full"}
        mediaClassName={options.mediaClassName}
        showFooter={options.showFooter}
        fadeOutOnLastScroll={options.fadeOutOnLastScroll}
      />
    );
  }

  if (mediaItems.length === 1) {
    const media = mediaItems[0];
    return (
      <MediaBlock
        kind={media.kind}
        ratio="wide"
        label={media.label}
        src={media.src}
        poster={media.poster}
        className="w-full min-h-[320px] lg:min-h-[420px] lg:aspect-auto"
      />
    );
  }

  if (mediaItems.length > 3 || sectionKey === "documentation") {
    return <SectionMediaCarousel items={mediaItems} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {mediaItems.map((item, index) => (
        <FadeIn {...PROJECT_FADE_VIEWPORT} key={item.key} delay={index * 0.03}>
          <MediaBlock kind={item.kind} ratio="wide" label={item.label} src={item.src} poster={item.poster} />
        </FadeIn>
      ))}
    </div>
  );
}
