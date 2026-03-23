import { Section } from "@/components/layout/section";
import { FadeIn } from "@/components/motion/fade-in";
import { FadeGroup } from "@/components/motion/fade-group";
import { MediaBlock } from "@/components/ui/media-block";
import { ProjectDemoWindow } from "@/components/project/project-demo-window";
import { ProjectScrollBackdrop } from "@/components/project/project-scroll-backdrop";
import { OverviewScrollGallery } from "@/components/project/overview-scroll-gallery";
import { SectionSlideshow } from "@/components/project/section-slideshow";
import { ProjectPreviewLink } from "@/components/ui/project-preview-link";
import { InteractiveModuleRenderer } from "@/components/interactive/interactive-module-renderer";
import { getProjectCardImageSrc } from "@/lib/project-media";
import {
  PROJECT_FADE_VIEWPORT,
  TITLE_MEDIA_DELAY,
  BODY_TEXT_DELAY,
  BODY_META_DELAY,
  getSectionAssetData,
  renderMediaLayout,
  renderSectionAssets,
  renderMediaColumn,
  type ProjectLayoutProps
} from "./shared";

export function InMySkinLayout({
  project,
  relatedProjects,
  allProjects,
  afterOverviewModules,
  afterConceptModules,
  afterProjectModules,
  beforeDocumentationModules
}: ProjectLayoutProps) {
  const overviewAssets = getSectionAssetData(project, "overview");
  const backgroundAssets = getSectionAssetData(project, "background");
  const conceptAssets = getSectionAssetData(project, "concept");
  const theProjectAssets = getSectionAssetData(project, "theProject");
  const documentationAssets = getSectionAssetData(project, "documentation");
  const documentationMediaItems = documentationAssets.mediaItems.filter(
    (item) => !item.key.includes("/scripts/")
  );

  return (
    <main className="relative project-glass">
      <ProjectScrollBackdrop slug={project.slug} category={project.category} />

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

        {/* ── Overview ── with OverviewScrollGallery */}
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
              <OverviewScrollGallery items={overviewAssets.mediaItems} />
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
            {backgroundAssets.mediaItems.length > 0 ? (
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
                  {renderMediaColumn("background", backgroundAssets.mediaItems)}
                </FadeIn>
              </FadeGroup>
            ) : (
              <FadeGroup {...PROJECT_FADE_VIEWPORT}>
                <article className="space-y-5">
                  <FadeIn {...PROJECT_FADE_VIEWPORT}>
                    <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">Background</h2>
                  </FadeIn>
                  <FadeIn {...PROJECT_FADE_VIEWPORT} delay={BODY_TEXT_DELAY}>
                    <p className="max-w-4xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.background}</p>
                  </FadeIn>
                </article>
              </FadeGroup>
            )}
          </Section>
        ) : null}

        {/* ── Concept ── with SectionSlideshow */}
        {project.sections.concept.trim().length > 0 ? (
          <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
            {conceptAssets.mediaItems.length > 0 ? (
              <FadeGroup {...PROJECT_FADE_VIEWPORT} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
                <article className="space-y-5 lg:pr-4">
                  <FadeIn {...PROJECT_FADE_VIEWPORT}>
                    <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">Concept</h2>
                  </FadeIn>
                  <FadeIn {...PROJECT_FADE_VIEWPORT} delay={BODY_TEXT_DELAY}>
                    <p className="max-w-3xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.concept}</p>
                  </FadeIn>
                </article>
                <FadeIn {...PROJECT_FADE_VIEWPORT} delay={TITLE_MEDIA_DELAY}>
                  <SectionSlideshow items={conceptAssets.mediaItems} autoLoop autoLoopInterval={3000} fill />
                </FadeIn>
              </FadeGroup>
            ) : (
              <FadeGroup {...PROJECT_FADE_VIEWPORT}>
                <article className="space-y-5">
                  <FadeIn {...PROJECT_FADE_VIEWPORT}>
                    <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">Concept</h2>
                  </FadeIn>
                  <FadeIn {...PROJECT_FADE_VIEWPORT} delay={BODY_TEXT_DELAY}>
                    <p className="max-w-4xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.concept}</p>
                  </FadeIn>
                </article>
              </FadeGroup>
            )}
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
          <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
            {theProjectAssets.mediaItems.length > 0 ? (
              <FadeGroup {...PROJECT_FADE_VIEWPORT} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch">
                <article className="space-y-5 lg:sticky lg:top-24 lg:h-[64svh] lg:min-h-[520px] lg:pr-4">
                  <FadeIn {...PROJECT_FADE_VIEWPORT}>
                    <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">The Project</h2>
                  </FadeIn>
                  <FadeIn {...PROJECT_FADE_VIEWPORT} delay={BODY_TEXT_DELAY}>
                    <p className="max-w-3xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.theProject}</p>
                  </FadeIn>
                </article>
                <FadeIn {...PROJECT_FADE_VIEWPORT} delay={TITLE_MEDIA_DELAY}>
                  {renderMediaColumn("theProject", theProjectAssets.mediaItems)}
                </FadeIn>
              </FadeGroup>
            ) : (
              <FadeGroup {...PROJECT_FADE_VIEWPORT}>
                <article className="space-y-5">
                  <FadeIn {...PROJECT_FADE_VIEWPORT}>
                    <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">The Project</h2>
                  </FadeIn>
                  <FadeIn {...PROJECT_FADE_VIEWPORT} delay={BODY_TEXT_DELAY}>
                    <p className="max-w-4xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.theProject}</p>
                  </FadeIn>
                </article>
              </FadeGroup>
            )}
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

        {project.demoUrl ? (
          <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
            <FadeIn {...PROJECT_FADE_VIEWPORT}>
              <ProjectDemoWindow title={`${project.title} WebGL Demo`} demoUrl={project.demoUrl} />
            </FadeIn>
          </Section>
        ) : null}

        {/* ── Process ── */}
        {project.sections.process.trim().length > 0 ? (
          <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
            <FadeGroup {...PROJECT_FADE_VIEWPORT}>
              <article className="space-y-5">
                <FadeIn {...PROJECT_FADE_VIEWPORT}>
                  <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">Process</h2>
                </FadeIn>
                <FadeIn {...PROJECT_FADE_VIEWPORT} delay={BODY_TEXT_DELAY}>
                  <p className="max-w-4xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.process}</p>
                </FadeIn>
                <FadeIn {...PROJECT_FADE_VIEWPORT} delay={TITLE_MEDIA_DELAY}>{renderSectionAssets(project, "process")}</FadeIn>
              </article>
            </FadeGroup>
          </Section>
        ) : null}

        {/* ── Reflection / Impact ── */}
        {project.sections.reflectionImpact.trim().length > 0 ? (
          <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
            <FadeGroup {...PROJECT_FADE_VIEWPORT}>
              <article className="space-y-5">
                <FadeIn {...PROJECT_FADE_VIEWPORT}>
                  <h2 className="display-type text-3xl font-semibold text-[#141921] md:text-5xl">Reflection / Impact</h2>
                </FadeIn>
                <FadeIn {...PROJECT_FADE_VIEWPORT} delay={BODY_TEXT_DELAY}>
                  <p className="max-w-4xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.reflectionImpact}</p>
                </FadeIn>
                <FadeIn {...PROJECT_FADE_VIEWPORT} delay={TITLE_MEDIA_DELAY}>
                  {renderSectionAssets(project, "reflectionImpact")}
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
          <Section className="border-t border-[#d7dbe2] pt-10 pb-14">
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
