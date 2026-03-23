import { Section } from "@/components/layout/section";
import { FadeIn } from "@/components/motion/fade-in";
import { FadeGroup } from "@/components/motion/fade-group";
import { MediaBlock } from "@/components/ui/media-block";
import { PhysicadProcessBackdrop } from "@/components/project/physicad-process-backdrop";
import { ProjectPreviewLink } from "@/components/ui/project-preview-link";
import { InteractiveModuleRenderer } from "@/components/interactive/interactive-module-renderer";
import { resolveAssetUrl } from "@/lib/asset-url";
import { getProjectCardImageSrc } from "@/lib/project-media";
import {
  PROJECT_FADE_VIEWPORT,
  TITLE_MEDIA_DELAY,
  BODY_TEXT_DELAY,
  BODY_META_DELAY,
  getSectionAssetData,
  renderMediaLayout,
  renderMediaColumn,
  type ProjectLayoutProps,
  type SectionMediaCarouselItem
} from "./shared";

export function PhysicadLayout({
  project,
  relatedProjects,
  allProjects,
  afterOverviewModules,
  afterConceptModules,
  afterProjectModules,
  beforeDocumentationModules
}: ProjectLayoutProps) {
  const overviewAssets = getSectionAssetData(project, "overview");
  const conceptAssets = getSectionAssetData(project, "concept");
  const conceptImageItems = conceptAssets.mediaItems.filter((item) => item.kind === "image");
  const processAssets = getSectionAssetData(project, "process");
  const documentationAssets = getSectionAssetData(project, "documentation");
  const documentationMediaItems = documentationAssets.mediaItems.filter(
    (item) => !item.key.includes("/scripts/")
  );

  const physiCADBackgroundMediaItems: SectionMediaCarouselItem[] = [
    {
      key: "physicad-background-local-video",
      kind: "video",
      label: `${project.title} - Background video`,
      src: "/api/assets/physicad/background/video-01.mp4?v=2",
      poster: project.heroMediaPoster ?? project.heroMediaSrc
    }
  ];

  const physicadProjectVideos: SectionMediaCarouselItem[] = [
    { key: "physicad-project-vid-1", kind: "video", label: `${project.title} - Demo 1`, src: resolveAssetUrl("physicad/the-project/1.mp4") },
    { key: "physicad-project-vid-2", kind: "video", label: `${project.title} - Demo 2`, src: resolveAssetUrl("physicad/the-project/2.mp4") },
    { key: "physicad-project-vid-3", kind: "video", label: `${project.title} - Demo 3`, src: resolveAssetUrl("physicad/the-project/3.mp4") },
    { key: "physicad-project-vid-4", kind: "video", label: `${project.title} - Demo 4`, src: resolveAssetUrl("physicad/the-project/4.mp4") }
  ];

  return (
    <main className="relative project-glass physicad-theme bg-white">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-white" />
      <PhysicadProcessBackdrop startId="physicad-concept" endId="physicad-reflection" />

      <div className="relative z-[1]">
        {/* ── Hero ── */}
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
            <FadeIn {...PROJECT_FADE_VIEWPORT} delay={TITLE_MEDIA_DELAY}>
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
            </FadeIn>
          </div>
        </Section>

        {/* ── Overview ── */}
        <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
          {overviewAssets.mediaItems.length > 0 ? (
            <FadeGroup {...PROJECT_FADE_VIEWPORT} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
              <article className="space-y-5 lg:sticky lg:top-24 lg:pr-4">
                <FadeIn {...PROJECT_FADE_VIEWPORT}>
                  <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">Overview</h2>
                </FadeIn>
                <FadeIn {...PROJECT_FADE_VIEWPORT} delay={BODY_TEXT_DELAY}>
                  <p className="max-w-3xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.overview}</p>
                </FadeIn>
                <FadeIn {...PROJECT_FADE_VIEWPORT} delay={BODY_META_DELAY}>
                  <div className="grid gap-5 pt-1 sm:grid-cols-2">
                    <div><p className="kicker">Role</p><p className="mt-1.5 text-sm leading-relaxed text-[#596173]">{project.roles.join(" | ")}</p></div>
                    <div><p className="kicker">Team</p><p className="mt-1.5 text-sm leading-relaxed text-[#596173]">{project.team ?? "Solo project"}</p></div>
                    <div><p className="kicker">Institution / Year</p><p className="mt-1.5 text-sm leading-relaxed text-[#596173]">{project.timeline ?? `${project.year}`}</p></div>
                    <div><p className="kicker">Tools</p><p className="mt-1.5 text-sm leading-relaxed text-[#596173]">{project.tools.join(" | ")}</p></div>
                  </div>
                </FadeIn>
              </article>
              {renderMediaLayout("overview", overviewAssets.mediaItems)}
            </FadeGroup>
          ) : (
            <FadeGroup {...PROJECT_FADE_VIEWPORT}>
              <article className="space-y-5">
                <FadeIn {...PROJECT_FADE_VIEWPORT}>
                  <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">Overview</h2>
                </FadeIn>
                <FadeIn {...PROJECT_FADE_VIEWPORT} delay={BODY_TEXT_DELAY}>
                  <p className="max-w-4xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.overview}</p>
                </FadeIn>
                <FadeIn {...PROJECT_FADE_VIEWPORT} delay={BODY_META_DELAY}>
                  <div className="grid gap-5 pt-1 sm:grid-cols-2 md:grid-cols-4">
                    <div><p className="kicker">Role</p><p className="mt-1.5 text-sm leading-relaxed text-[#596173]">{project.roles.join(" | ")}</p></div>
                    <div><p className="kicker">Team</p><p className="mt-1.5 text-sm leading-relaxed text-[#596173]">{project.team ?? "Solo project"}</p></div>
                    <div><p className="kicker">Institution / Year</p><p className="mt-1.5 text-sm leading-relaxed text-[#596173]">{project.timeline ?? `${project.year}`}</p></div>
                    <div><p className="kicker">Tools</p><p className="mt-1.5 text-sm leading-relaxed text-[#596173]">{project.tools.join(" | ")}</p></div>
                  </div>
                </FadeIn>
              </article>
            </FadeGroup>
          )}
        </Section>

        {afterOverviewModules.length > 0 ? (
          <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
            <div className="space-y-6">
              {afterOverviewModules.map((module, index) => (
                <FadeIn {...PROJECT_FADE_VIEWPORT} key={module.id} delay={index * 0.05}>
                  <InteractiveModuleRenderer module={module} />
                </FadeIn>
              ))}
            </div>
          </Section>
        ) : null}

        {/* ── Background ── */}
        {project.sections.background.trim().length > 0 ? (
          <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
            <FadeGroup {...PROJECT_FADE_VIEWPORT} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
              <article className="space-y-5 lg:pr-4">
                <FadeIn {...PROJECT_FADE_VIEWPORT}>
                  <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">Background</h2>
                </FadeIn>
                <FadeIn {...PROJECT_FADE_VIEWPORT} delay={BODY_TEXT_DELAY}>
                  <p className="max-w-3xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.background}</p>
                </FadeIn>
              </article>
              <FadeIn {...PROJECT_FADE_VIEWPORT} delay={TITLE_MEDIA_DELAY}>
                {renderMediaColumn("background", physiCADBackgroundMediaItems)}
              </FadeIn>
            </FadeGroup>
          </Section>
        ) : null}

        {/* ── Concept ── */}
        {project.sections.concept.trim().length > 0 ? (
          <Section id="physicad-concept" className="border-t border-white/10 pt-10 pb-14">
            <div className="space-y-8 physicad-dark-section">
              <FadeGroup {...PROJECT_FADE_VIEWPORT}>
                <article className="space-y-5">
                  <FadeIn {...PROJECT_FADE_VIEWPORT}>
                    <h2 className="display-type text-3xl font-semibold md:text-5xl">Concept</h2>
                  </FadeIn>
                  <FadeIn {...PROJECT_FADE_VIEWPORT} delay={BODY_TEXT_DELAY}>
                    <p className="max-w-4xl text-base leading-relaxed text-white/70 md:text-[1.03rem]">{project.sections.concept}</p>
                  </FadeIn>
                </article>
              </FadeGroup>
              {conceptImageItems.length > 0 && (
                <FadeIn {...PROJECT_FADE_VIEWPORT}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={conceptImageItems[0].src}
                    alt={conceptImageItems[0].label}
                    className="w-full h-auto block"
                  />
                </FadeIn>
              )}
            </div>
          </Section>
        ) : null}

        {afterConceptModules.length > 0 ? (
          <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
            <div className="space-y-6">
              {afterConceptModules.map((module, index) => (
                <FadeIn {...PROJECT_FADE_VIEWPORT} key={module.id} delay={index * 0.05}>
                  <InteractiveModuleRenderer module={module} />
                </FadeIn>
              ))}
            </div>
          </Section>
        ) : null}

        {/* ── The Project ── */}
        {project.sections.theProject.trim().length > 0 ? (
          <Section id="physicad-the-project" className="border-t border-white/10 pt-10 pb-14">
            <div className="physicad-dark-section">
              <FadeGroup {...PROJECT_FADE_VIEWPORT} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
                <article className="space-y-5 lg:pr-4">
                  <FadeIn {...PROJECT_FADE_VIEWPORT}>
                    <h2 className="display-type text-3xl font-semibold md:text-5xl">The Project</h2>
                  </FadeIn>
                  <FadeIn {...PROJECT_FADE_VIEWPORT} delay={BODY_TEXT_DELAY}>
                    <p className="max-w-3xl text-base leading-relaxed text-white/70 md:text-[1.03rem]">{project.sections.theProject}</p>
                  </FadeIn>
                </article>
                <FadeIn {...PROJECT_FADE_VIEWPORT} delay={TITLE_MEDIA_DELAY}>
                  <MediaBlock
                    kind="video"
                    ratio="wide"
                    label={`${project.title} - Demo`}
                    src={resolveAssetUrl("physicad/the-project/all.mp4")}
                    className="w-full min-h-[320px] lg:min-h-[420px] lg:aspect-auto !rounded-none"
                  />
                </FadeIn>
              </FadeGroup>
              {physicadProjectVideos.length > 0 && (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {physicadProjectVideos.map((item) => (
                    <MediaBlock key={item.key} kind="video" ratio="square" label={item.label} src={item.src} className="!rounded-none" />
                  ))}
                </div>
              )}
            </div>
          </Section>
        ) : null}

        {afterProjectModules.length > 0 ? (
          <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
            <div className="space-y-6">
              {afterProjectModules.map((module, index) => (
                <FadeIn {...PROJECT_FADE_VIEWPORT} key={module.id} delay={index * 0.05}>
                  <InteractiveModuleRenderer module={module} />
                </FadeIn>
              ))}
            </div>
          </Section>
        ) : null}

        {/* ── Process ── */}
        {project.sections.process.trim().length > 0 ? (
          <Section id="physicad-process" className="border-t border-white/10 pt-10 pb-14">
            <FadeGroup {...PROJECT_FADE_VIEWPORT} className="space-y-7">
              <article className="surface-panel rounded-card p-8 md:p-10">
                <FadeIn {...PROJECT_FADE_VIEWPORT}>
                  <h2 className="display-type text-3xl font-semibold text-white md:text-5xl">Process</h2>
                </FadeIn>
                <FadeIn {...PROJECT_FADE_VIEWPORT} delay={BODY_TEXT_DELAY}>
                  <p className="mt-5 max-w-4xl text-base leading-relaxed text-white/70 md:text-[1.03rem]">{project.sections.process}</p>
                </FadeIn>
              </article>

              {processAssets.mediaItems.length > 0 ? (
                <div className="physicad-process-media-list space-y-5">
                  {processAssets.mediaItems.map((item, index) => (
                    <FadeIn {...PROJECT_FADE_VIEWPORT} key={item.key} delay={TITLE_MEDIA_DELAY + index * 0.05}>
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
                <FadeIn {...PROJECT_FADE_VIEWPORT} delay={BODY_META_DELAY}>
                  <div className="flex flex-wrap gap-2.5">
                    {processAssets.fileAssets.map((assetPath) => (
                      <a
                        key={`process-file-${assetPath}`}
                        href={`/api/assets/${assetPath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-white/24 bg-white/8 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.13em] text-white/90 transition-colors hover:bg-white/14 hover:text-white"
                      >
                        {assetPath.split("/").pop()?.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim() ?? assetPath}
                      </a>
                    ))}
                  </div>
                </FadeIn>
              ) : null}
            </FadeGroup>
          </Section>
        ) : null}

        {/* ── Reflection / Impact ── */}
        {project.sections.reflectionImpact.trim().length > 0 ? (
          <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
            <FadeGroup {...PROJECT_FADE_VIEWPORT}>
              <article className="tone-layer rounded-card p-8 md:p-10">
                <FadeIn {...PROJECT_FADE_VIEWPORT}>
                  <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">Reflection / Impact</h2>
                </FadeIn>
                <FadeIn {...PROJECT_FADE_VIEWPORT} delay={BODY_TEXT_DELAY}>
                  <p className="mt-5 max-w-4xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.reflectionImpact}</p>
                </FadeIn>
              </article>
            </FadeGroup>
          </Section>
        ) : null}

        {beforeDocumentationModules.length > 0 ? (
          <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
            <div className="space-y-6">
              {beforeDocumentationModules.map((module, index) => (
                <FadeIn {...PROJECT_FADE_VIEWPORT} key={module.id} delay={index * 0.05}>
                  <InteractiveModuleRenderer module={module} />
                </FadeIn>
              ))}
            </div>
          </Section>
        ) : null}

        {/* ── Documentation ── */}
        {documentationMediaItems.length > 0 ? (
          <Section id="physicad-reflection" className="border-t border-[#d7dbe2] pt-10 pb-14">
            <FadeGroup {...PROJECT_FADE_VIEWPORT}>
              <FadeIn {...PROJECT_FADE_VIEWPORT}>
                <article className="space-y-6">
                  <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">Documentation</h2>
                  {renderMediaLayout("documentation", documentationMediaItems)}
                </article>
              </FadeIn>
            </FadeGroup>
          </Section>
        ) : null}

        {/* ── Continue Exploring ── */}
        <Section className="border-t border-[#d7dbe2]">
          <FadeIn {...PROJECT_FADE_VIEWPORT}>
            <div className="mb-8">
              <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">Continue exploring</h2>
            </div>
          </FadeIn>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {relatedProjects.map((item, index) => (
              <FadeIn {...PROJECT_FADE_VIEWPORT} key={item.slug} delay={index * 0.05} className="mx-auto flex w-full max-w-[14.25rem]">
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
