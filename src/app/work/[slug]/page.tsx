import { notFound } from "next/navigation";
import { Section } from "@/components/layout/section";
import { FadeIn } from "@/components/motion/fade-in";
import { MediaBlock } from "@/components/ui/media-block";
import { ProjectDemoWindow } from "@/components/project/project-demo-window";
import { ProjectScrollBackdrop } from "@/components/project/project-scroll-backdrop";
import { SectionMediaCarousel, type SectionMediaCarouselItem } from "@/components/project/section-media-carousel";
import { ProjectMediaScrollSequence } from "@/components/project/project-media-scroll-sequence";
import { PhysicadProcessBackdrop } from "@/components/project/physicad-process-backdrop";
import { ProjectPreviewLink } from "@/components/ui/project-preview-link";
import {
  InteractiveModulePosition,
  PlaceholderInteractiveModule
} from "@/lib/placeholder-data";
import { InteractiveModuleRenderer } from "@/components/interactive/interactive-module-renderer";
import { loadPortfolioProjects } from "@/lib/portfolio-projects";
import { resolveAssetUrl } from "@/lib/asset-url";
import { getProjectCardImageSrc } from "@/lib/project-media";

type ProjectPageProps = {
  params: {
    slug: string;
  };
};

type NarrativeSectionKey =
  | "overview"
  | "background"
  | "concept"
  | "theProject"
  | "process"
  | "reflectionImpact"
  | "documentation";

const SECTION_TO_ASSET_FOLDER: Record<NarrativeSectionKey, "overview" | "background" | "concept" | "the-project" | "process" | "reflection" | "documentation"> = {
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

function extensionOf(assetPath: string): string {
  const normalized = assetPath.replace(/\\/g, "/");
  const fileName = normalized.split("/").pop() ?? "";
  const index = fileName.lastIndexOf(".");
  return index >= 0 ? fileName.slice(index).toLowerCase() : "";
}

function isVideoAsset(assetPath: string): boolean {
  return VIDEO_EXTENSIONS.has(extensionOf(assetPath));
}

function isImageAsset(assetPath: string): boolean {
  return IMAGE_EXTENSIONS.has(extensionOf(assetPath));
}

function assetLabel(assetPath: string): string {
  const normalized = assetPath.replace(/\\/g, "/");
  const fileName = normalized.split("/").pop() ?? assetPath;
  const stem = fileName.replace(/\.[^/.]+$/, "");
  return stem.replace(/[-_]+/g, " ").trim() || fileName;
}

export async function generateStaticParams() {
  const projects = await loadPortfolioProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

function getModulesAtPosition(
  modules: PlaceholderInteractiveModule[] | undefined,
  position: InteractiveModulePosition
): PlaceholderInteractiveModule[] {
  return (modules ?? []).filter((module) => module.position === position);
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const allProjects = await loadPortfolioProjects();
  const project = allProjects.find((item) => item.slug === params.slug);

  if (!project) {
    notFound();
  }

  const related = project.related
    .map((slug) => allProjects.find((item) => item.slug === slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const relatedProjects =
    related.length > 0
      ? related
      : allProjects.filter((item) => item.slug !== project.slug && item.category === project.category).slice(0, 4);

  const afterOverviewModules = getModulesAtPosition(project.interactiveModules, "after-overview");
  const afterConceptModules = getModulesAtPosition(project.interactiveModules, "after-concept");
  const afterProjectModules = getModulesAtPosition(project.interactiveModules, "after-project");
  const beforeDocumentationModules = getModulesAtPosition(project.interactiveModules, "before-documentation");
  const isInMySkin = project.slug === "inmyskin";
  const isPhysiCAD = project.slug === "physicad";

  const getSectionAssetData = (sectionKey: NarrativeSectionKey) => {
    const folder = SECTION_TO_ASSET_FOLDER[sectionKey];
    const sectionAssets = (project.assetsBySection?.[folder] ?? []).filter((assetPath) => Boolean(assetPath));
    const fallbackGallery = sectionKey === "process" && sectionAssets.length === 0 ? project.gallery.filter((item) => Boolean(item.src)) : [];
    const mediaAssets = sectionAssets.filter((assetPath) => isImageAsset(assetPath) || isVideoAsset(assetPath));
    const fileAssets = sectionAssets.filter((assetPath) => !isImageAsset(assetPath) && !isVideoAsset(assetPath));
    const mediaItems: SectionMediaCarouselItem[] =
      mediaAssets.length > 0
        ? mediaAssets.map((assetPath) => ({
            key: `${sectionKey}-${assetPath}`,
            kind: isVideoAsset(assetPath) ? "video" : "image",
            label: `${project.title} - ${assetLabel(assetPath)}`,
            src: resolveAssetUrl(assetPath)
          }))
        : fallbackGallery.map((item) => ({
            key: `${sectionKey}-gallery-${item.id}`,
            kind: item.kind,
            label: item.label,
            src: item.src,
            poster: item.poster
          }));

    return { mediaItems, fileAssets };
  };

  const renderMediaLayout = (sectionKey: NarrativeSectionKey, mediaItems: SectionMediaCarouselItem[]) => {
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
            <FadeIn key={item.key} delay={index * 0.03} className={spanClass}>
              <MediaBlock kind={item.kind} ratio={ratio} label={item.label} src={item.src} poster={item.poster} />
            </FadeIn>
          );
        })}
      </div>
    );
  };

  const renderSectionAssets = (sectionKey: NarrativeSectionKey) => {
    const { mediaItems, fileAssets } = getSectionAssetData(sectionKey);
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
  };

  const overviewAssets = getSectionAssetData("overview");
  const backgroundAssets = getSectionAssetData("background");
  const conceptAssets = getSectionAssetData("concept");
  const theProjectAssets = getSectionAssetData("theProject");
  const processAssets = getSectionAssetData("process");
  const documentationAssets = getSectionAssetData("documentation");
  const documentationImageItems = documentationAssets.mediaItems.filter((item) => item.kind === "image");
  const physiCADBackgroundMediaItems: SectionMediaCarouselItem[] = isPhysiCAD
    ? [
        {
          key: "physicad-background-local-video",
          kind: "video",
          label: `${project.title} - Background video`,
          src: "/api/assets/physicad/background/video-01.mp4?v=2",
          poster: project.heroMediaPoster ?? project.heroMediaSrc
        }
      ]
    : [];

  const renderPhysicadMediaColumn = (
    sectionKey: NarrativeSectionKey,
    mediaItems: SectionMediaCarouselItem[],
    options?: {
      projectSequence?: boolean;
      mediaClassName?: string;
      sequenceClassName?: string;
      showFooter?: boolean;
      fadeOutOnLastScroll?: boolean;
    }
  ) => {
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
          <FadeIn key={item.key} delay={index * 0.03}>
            <MediaBlock kind={item.kind} ratio="wide" label={item.label} src={item.src} poster={item.poster} />
          </FadeIn>
        ))}
      </div>
    );
  };

  return (
    <main className={`relative project-glass${isPhysiCAD ? " physicad-theme bg-white" : ""}`}>
      {isInMySkin ? <ProjectScrollBackdrop slug={project.slug} category={project.category} /> : null}
      {isPhysiCAD ? (
        <>
          <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-white" />
          <PhysicadProcessBackdrop startId="physicad-process" endId="physicad-reflection" />
        </>
      ) : null}

      <div className={isInMySkin || isPhysiCAD ? "relative z-[1]" : undefined}>
        <>
            <Section
              disableDefaultSpacing
              className="min-h-[calc(100svh-6.5rem)] md:min-h-[calc(100svh-7rem)] flex items-center -translate-y-[15px]"
            >
              <div className="w-full space-y-8">
                <div className="space-y-4">
                  <h1 className="display-type max-w-4xl text-4xl font-semibold leading-[1.03] text-[#11151c] md:text-6xl">
                    {project.title}
                  </h1>
                  <p className="max-w-3xl text-base leading-relaxed text-[#4d5565] md:text-lg">{project.oneLiner}</p>
                </div>

                <MediaBlock
                  label={project.heroLabel}
                  kind={project.heroMediaKind ?? "image"}
                  ratio="wide"
                  src={project.heroMediaSrc}
                  poster={project.heroMediaPoster}
                  loading="eager"
                  fetchPriority="high"
                  className="w-full min-h-[360px] md:min-h-[460px] lg:h-[72svh] lg:min-h-[560px] lg:aspect-auto"
                />
              </div>
            </Section>

            <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
                <FadeIn>
                  <article className="space-y-5 lg:pr-4">
                    <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">Overview</h2>
                    <p className="max-w-3xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.overview}</p>

                    <div className="grid gap-5 pt-1 sm:grid-cols-2">
                      <div>
                        <p className="kicker">Role</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#596173]">{project.roles.join(" | ")}</p>
                      </div>
                      <div>
                        <p className="kicker">Team</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#596173]">{project.team ?? "Solo project"}</p>
                      </div>
                      <div>
                        <p className="kicker">Institution / Year</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#596173]">{project.timeline ?? `${project.year}`}</p>
                      </div>
                      <div>
                        <p className="kicker">Tools</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#596173]">{project.tools.join(" | ")}</p>
                      </div>
                    </div>
                  </article>
                </FadeIn>

                {overviewAssets.mediaItems.length > 0 ? (
                  <FadeIn delay={0.06}>
                    {renderPhysicadMediaColumn("overview", overviewAssets.mediaItems)}
                  </FadeIn>
                ) : null}
              </div>
            </Section>

            {afterOverviewModules.length > 0 ? (
              <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
                <div className="space-y-6">
                  {afterOverviewModules.map((module, index) => (
                    <FadeIn key={module.id} delay={index * 0.05}>
                      <InteractiveModuleRenderer module={module} />
                    </FadeIn>
                  ))}
                </div>
              </Section>
            ) : null}

            <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
                <FadeIn>
                  <article className="space-y-5 lg:pr-4">
                    <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">Background</h2>
                    <p className="max-w-3xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.background}</p>
                  </article>
                </FadeIn>

                {(isPhysiCAD ? physiCADBackgroundMediaItems : backgroundAssets.mediaItems).length > 0 ? (
                  <FadeIn delay={0.06}>
                    {renderPhysicadMediaColumn(
                      "background",
                      isPhysiCAD ? physiCADBackgroundMediaItems : backgroundAssets.mediaItems
                    )}
                  </FadeIn>
                ) : null}
              </div>
            </Section>

            <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
                <FadeIn>
                  <article className="space-y-5 lg:pr-4">
                    <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">Concept</h2>
                    <p className="max-w-3xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.concept}</p>
                  </article>
                </FadeIn>

                {conceptAssets.mediaItems.length > 0 ? (
                  <FadeIn delay={0.06}>
                    {renderPhysicadMediaColumn("concept", conceptAssets.mediaItems)}
                  </FadeIn>
                ) : null}
              </div>
            </Section>

            {afterConceptModules.length > 0 ? (
              <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
                <div className="space-y-6">
                  {afterConceptModules.map((module, index) => (
                    <FadeIn key={module.id} delay={index * 0.05}>
                      <InteractiveModuleRenderer module={module} />
                    </FadeIn>
                  ))}
                </div>
              </Section>
            ) : null}

            <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch">
                <FadeIn>
                  <article className="space-y-5 lg:sticky lg:top-24 lg:h-[64svh] lg:min-h-[520px] lg:pr-4">
                    <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">The Project</h2>
                    <p className="max-w-3xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.theProject}</p>
                  </article>
                </FadeIn>

                {theProjectAssets.mediaItems.length > 0 ? (
                  <FadeIn delay={0.06}>
                    {renderPhysicadMediaColumn("theProject", theProjectAssets.mediaItems, {
                      projectSequence: isPhysiCAD,
                      sequenceClassName: isPhysiCAD ? "w-full" : undefined,
                      mediaClassName: isPhysiCAD
                        ? "h-full min-h-[360px] md:min-h-[460px] lg:h-full lg:min-h-0 lg:aspect-auto"
                        : undefined,
                      showFooter: isPhysiCAD ? false : undefined,
                      fadeOutOnLastScroll: isPhysiCAD ? true : undefined
                    })}
                  </FadeIn>
                ) : null}
              </div>
            </Section>

            {afterProjectModules.length > 0 ? (
              <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
                <div className="space-y-6">
                  {afterProjectModules.map((module, index) => (
                    <FadeIn key={module.id} delay={index * 0.05}>
                      <InteractiveModuleRenderer module={module} />
                    </FadeIn>
                  ))}
                </div>
              </Section>
            ) : null}
          </>

        {project.demoUrl ? (
          <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
            <FadeIn>
              <ProjectDemoWindow title={`${project.title} WebGL Demo`} demoUrl={project.demoUrl} />
            </FadeIn>
          </Section>
        ) : null}

        <Section
          id={isPhysiCAD ? "physicad-process" : undefined}
          className="border-t border-[#d7dbe2] pt-10 pb-14"
        >
          {isPhysiCAD ? (
            <div className="space-y-7">
              <FadeIn>
                <article className="surface-panel rounded-card p-8 md:p-10">
                  <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">Process</h2>
                  <p className="mt-5 max-w-4xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.process}</p>
                </article>
              </FadeIn>

              {processAssets.mediaItems.length > 0 ? (
                <div className="physicad-process-media-list space-y-5">
                  {processAssets.mediaItems.map((item, index) => (
                    <FadeIn key={item.key} delay={index * 0.05}>
                      <MediaBlock
                        kind={item.kind}
                        ratio="wide"
                        label={item.label}
                        src={item.src}
                        poster={item.poster}
                        className="physicad-process-media !rounded-none"
                      />
                    </FadeIn>
                  ))}
                </div>
              ) : null}

              {processAssets.fileAssets.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {processAssets.fileAssets.map((assetPath) => (
                    <a
                      key={`process-file-${assetPath}`}
                      href={resolveAssetUrl(assetPath)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/24 bg-white/8 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.13em] text-white/90 transition-colors hover:bg-white/14 hover:text-white"
                    >
                      {assetLabel(assetPath)}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <FadeIn>
              <article className="surface-panel rounded-card p-8 md:p-10">
                <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">Process</h2>
                <p className="mt-5 max-w-4xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.process}</p>
                {renderSectionAssets("process")}
              </article>
            </FadeIn>
          )}
        </Section>

        <Section
          id={isPhysiCAD ? "physicad-reflection" : undefined}
          className="border-t border-[#d7dbe2] pt-10 pb-14"
        >
          <FadeIn>
            <article className="tone-layer rounded-card p-8 md:p-10">
              <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">Reflection / Impact</h2>
              <p className="mt-5 max-w-4xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.reflectionImpact}</p>
              {renderSectionAssets("reflectionImpact")}
            </article>
          </FadeIn>
        </Section>

        {beforeDocumentationModules.length > 0 ? (
          <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
            <div className="space-y-6">
              {beforeDocumentationModules.map((module, index) => (
                <FadeIn key={module.id} delay={index * 0.05}>
                  <InteractiveModuleRenderer module={module} />
                </FadeIn>
              ))}
            </div>
          </Section>
        ) : null}

        <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
          <FadeIn>
            <article className="space-y-6">
              <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">Documentation</h2>
              {documentationImageItems.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {documentationImageItems.map((item) => (
                    <MediaBlock
                      key={item.key}
                      kind={item.kind}
                      ratio="wide"
                      label={item.label}
                      src={item.src}
                      poster={item.poster}
                      className="min-h-[220px]"
                    />
                  ))}
                </div>
              ) : null}
            </article>
          </FadeIn>
        </Section>

        <Section className="border-t border-[#d7dbe2]">
          <FadeIn>
            <div className="mb-8">
              <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">Continue exploring</h2>
            </div>
          </FadeIn>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {relatedProjects.map((item, index) => (
              <FadeIn key={item.slug} delay={index * 0.05} className="mx-auto flex w-full max-w-[14.25rem]">
                <ProjectPreviewLink
                  project={item}
                  allProjects={allProjects}
                  className="group flex h-full w-full flex-col rounded-soft bg-black/[0.03] p-3 transition-colors hover:bg-black/[0.06]"
                >
                  <MediaBlock
                    label={item.heroLabel}
                    kind="image"
                    ratio="wide"
                    className="rounded-soft"
                    src={getProjectCardImageSrc(item)}
                  />
                  <div className="mt-3 flex flex-1 flex-col gap-1.5 overflow-hidden">
                    <p className="display-type overflow-hidden text-lg font-semibold leading-tight text-[#171c24] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                      {item.title}
                    </p>
                    <p className="truncate text-xs text-[#677082]">
                      {item.year} | {item.type}
                    </p>
                    <p className="overflow-hidden text-xs leading-relaxed text-[#505868] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                      {item.oneLiner}
                    </p>
                  </div>
                </ProjectPreviewLink>
              </FadeIn>
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}
