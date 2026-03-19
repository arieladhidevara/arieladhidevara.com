import { notFound } from "next/navigation";
import { Section } from "@/components/layout/section";
import { FadeIn } from "@/components/motion/fade-in";
import { ProjectHero } from "@/components/project/project-hero";
import { MediaBlock } from "@/components/ui/media-block";
import { ProjectCard } from "@/components/ui/project-card";
import { ProjectDemoWindow } from "@/components/project/project-demo-window";
import { ProjectScrollBackdrop } from "@/components/project/project-scroll-backdrop";
import {
  InteractiveModulePosition,
  PlaceholderInteractiveModule
} from "@/lib/placeholder-data";
import { InteractiveModuleRenderer } from "@/components/interactive/interactive-module-renderer";
import { loadPortfolioProjects } from "@/lib/portfolio-projects";
import { resolveAssetUrl } from "@/lib/asset-url";

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

  const renderSectionAssets = (sectionKey: NarrativeSectionKey) => {
    const folder = SECTION_TO_ASSET_FOLDER[sectionKey];
    const sectionAssets = (project.assetsBySection?.[folder] ?? []).filter((assetPath) => Boolean(assetPath));
    const fallbackGallery = sectionKey === "process" && sectionAssets.length === 0 ? project.gallery.filter((item) => Boolean(item.src)) : [];
    if (sectionAssets.length === 0 && fallbackGallery.length === 0) return null;

    const mediaAssets = sectionAssets.filter((assetPath) => isImageAsset(assetPath) || isVideoAsset(assetPath));
    const fileAssets = sectionAssets.filter((assetPath) => !isImageAsset(assetPath) && !isVideoAsset(assetPath));

    if (mediaAssets.length === 0 && fileAssets.length === 0 && fallbackGallery.length === 0) return null;

    return (
      <div className="mt-7 space-y-5">
        {mediaAssets.length > 0 || fallbackGallery.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-12">
            {mediaAssets.length > 0
              ? mediaAssets.map((assetPath, index) => {
                  const kind = isVideoAsset(assetPath) ? "video" : "image";
                  const ratio = kind === "video" ? "wide" : index % 3 === 1 ? "square" : "wide";
                  const spanClass = index % 3 === 0 ? "md:col-span-7" : "md:col-span-5";
                  return (
                    <FadeIn key={`${sectionKey}-${assetPath}`} delay={index * 0.03} className={spanClass}>
                      <MediaBlock
                        kind={kind}
                        ratio={ratio}
                        label={`${project.title} - ${assetLabel(assetPath)}`}
                        src={resolveAssetUrl(assetPath)}
                      />
                    </FadeIn>
                  );
                })
              : fallbackGallery.map((item, index) => {
                  const spanClass = index === 0 ? "md:col-span-7" : index === 1 ? "md:col-span-5" : "md:col-span-6";
                  return (
                    <FadeIn key={`${sectionKey}-gallery-${item.id}`} delay={index * 0.05} className={spanClass}>
                      <MediaBlock kind={item.kind} ratio={item.ratio} label={item.label} src={item.src} poster={item.poster} />
                    </FadeIn>
                  );
                })}
          </div>
        ) : null}

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

  return (
    <main className={`relative project-glass${isPhysiCAD ? " physicad-theme" : ""}`}>
      {isInMySkin ? <ProjectScrollBackdrop slug={project.slug} category={project.category} /> : null}
      {isPhysiCAD ? (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute inset-0 bg-[radial-gradient(64%_36%_at_50%_0%,rgba(0,255,221,0.26)_0%,rgba(0,255,221,0.08)_32%,rgba(0,0,0,0)_72%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,255,221,0.1)_0%,rgba(0,0,0,0)_30%,rgba(0,0,0,0.92)_100%)]" />
        </div>
      ) : null}

      <div className={isInMySkin || isPhysiCAD ? "relative z-[1]" : undefined}>
        <Section
          disableDefaultSpacing
          className="min-h-[calc(100svh-6.5rem)] md:min-h-[calc(100svh-7rem)] flex items-center -translate-y-[15px]"
        >
          <ProjectHero project={project} />
        </Section>

        <Section className="pt-0 pb-14">
          <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr] lg:items-start">
            <FadeIn>
              <article className="surface-panel rounded-card p-8 md:p-10">
                <p className="kicker">01 / Overview</p>
                <h2 className="display-type mt-3 text-3xl font-semibold text-[#141921] md:text-5xl">Overview</h2>
                <p className="mt-5 text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.overview}</p>
                {renderSectionAssets("overview")}
              </article>
            </FadeIn>

            <div className="space-y-5">
              <FadeIn delay={0.08}>
                <article className="surface-panel rounded-card p-8">
                  <p className="kicker">Role</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#596173]">{project.roles.join(" | ")}</p>

                  <p className="kicker mt-6">Team</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#596173]">{project.team ?? "Solo project"}</p>

                  <p className="kicker mt-6">INSTITUTION / YEAR</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#596173]">{project.timeline ?? `${project.year}`}</p>
                </article>
              </FadeIn>
            </div>
          </div>
        </Section>

        {afterOverviewModules.length > 0 ? (
          <Section className="pt-2 pb-14">
            <div className="space-y-6">
              {afterOverviewModules.map((module, index) => (
                <FadeIn key={module.id} delay={index * 0.05}>
                  <InteractiveModuleRenderer module={module} />
                </FadeIn>
              ))}
            </div>
          </Section>
        ) : null}

        <Section className="pt-2 pb-14">
          <FadeIn>
            <article className="tone-layer rounded-card p-8 md:p-10">
              <p className="kicker">02 / Background</p>
              <h2 className="display-type mt-3 text-3xl font-semibold text-[#141921] md:text-5xl">Background</h2>
              <p className="mt-5 max-w-4xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.background}</p>
              {renderSectionAssets("background")}
            </article>
          </FadeIn>
        </Section>

        <Section className="pt-2 pb-14">
          <FadeIn>
            <article className="surface-panel rounded-card p-8 md:p-10">
              <p className="kicker">03 / Concept</p>
              <h2 className="display-type mt-3 text-3xl font-semibold text-[#141921] md:text-5xl">Concept</h2>
              <p className="mt-5 max-w-4xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.concept}</p>
              {renderSectionAssets("concept")}
            </article>
          </FadeIn>
        </Section>

        {afterConceptModules.length > 0 ? (
          <Section className="pt-2 pb-14">
            <div className="space-y-6">
              {afterConceptModules.map((module, index) => (
                <FadeIn key={module.id} delay={index * 0.05}>
                  <InteractiveModuleRenderer module={module} />
                </FadeIn>
              ))}
            </div>
          </Section>
        ) : null}

        <Section className="pt-2 pb-14">
          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <FadeIn>
              <article className="surface-panel rounded-card p-8 md:p-10">
                <p className="kicker">04 / The Project</p>
                <h2 className="display-type mt-3 text-3xl font-semibold text-[#141921] md:text-5xl">The Project</h2>
                <p className="mt-5 max-w-4xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.theProject}</p>
                {renderSectionAssets("theProject")}
              </article>
            </FadeIn>

            <FadeIn delay={0.08}>
              <article className="tone-layer rounded-card p-8">
                <p className="kicker">Tools</p>
                <p className="mt-3 text-sm leading-relaxed text-[#5c6474]">{project.tools.join(" | ")}</p>
              </article>
            </FadeIn>
          </div>
        </Section>

        {afterProjectModules.length > 0 ? (
          <Section className="pt-2 pb-14">
            <div className="space-y-6">
              {afterProjectModules.map((module, index) => (
                <FadeIn key={module.id} delay={index * 0.05}>
                  <InteractiveModuleRenderer module={module} />
                </FadeIn>
              ))}
            </div>
          </Section>
        ) : null}

        {project.demoUrl ? (
          <Section className="pt-2 pb-14">
            <FadeIn>
              <ProjectDemoWindow title={`${project.title} WebGL Demo`} demoUrl={project.demoUrl} />
            </FadeIn>
          </Section>
        ) : null}

        <Section className="pt-2 pb-14">
          <FadeIn>
            <article className="surface-panel rounded-card p-8 md:p-10">
              <p className="kicker">05 / Process</p>
              <h2 className="display-type mt-3 text-3xl font-semibold text-[#141921] md:text-5xl">Process</h2>
              <p className="mt-5 max-w-4xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.process}</p>
              {renderSectionAssets("process")}
            </article>
          </FadeIn>
        </Section>

        <Section className="pt-2 pb-14">
          <FadeIn>
            <article className="tone-layer rounded-card p-8 md:p-10">
              <p className="kicker">06 / Reflection / Impact</p>
              <h2 className="display-type mt-3 text-3xl font-semibold text-[#141921] md:text-5xl">Reflection / Impact</h2>
              <p className="mt-5 max-w-4xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.reflectionImpact}</p>
              {renderSectionAssets("reflectionImpact")}
            </article>
          </FadeIn>
        </Section>

        {beforeDocumentationModules.length > 0 ? (
          <Section className="pt-2 pb-14">
            <div className="space-y-6">
              {beforeDocumentationModules.map((module, index) => (
                <FadeIn key={module.id} delay={index * 0.05}>
                  <InteractiveModuleRenderer module={module} />
                </FadeIn>
              ))}
            </div>
          </Section>
        ) : null}

        <Section className="pt-2 pb-14">
          <FadeIn>
            <article className="surface-panel rounded-card p-8 md:p-10">
              <p className="kicker">07 / Documentation</p>
              <h2 className="display-type mt-3 text-3xl font-semibold text-[#141921] md:text-5xl">Documentation</h2>
              <p className="mt-5 max-w-4xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.documentation}</p>
              {renderSectionAssets("documentation")}

              {project.documentationLinks && project.documentationLinks.length > 0 ? (
                <div className="mt-7 flex flex-wrap gap-2.5">
                  {project.documentationLinks.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="rounded-full bg-black/[0.06] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.13em] text-[#495162] transition-colors hover:bg-black/[0.1] hover:text-[#1d232d]"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          </FadeIn>
        </Section>

        <Section>
          <FadeIn>
            <div className="mb-8">
              <p className="kicker">Related Projects</p>
              <h2 className="display-type mt-3 text-3xl font-semibold text-[#141921] md:text-5xl">Continue exploring</h2>
            </div>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-2">
            {relatedProjects.map((item, index) => (
              <FadeIn key={item.slug} delay={index * 0.05}>
                <ProjectCard project={item} compact projectPool={allProjects} />
              </FadeIn>
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}
