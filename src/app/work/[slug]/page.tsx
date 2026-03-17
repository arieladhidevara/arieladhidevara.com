import { notFound } from "next/navigation";
import { Section } from "@/components/layout/section";
import { FadeIn } from "@/components/motion/fade-in";
import { ProjectHero } from "@/components/project/project-hero";
import { MediaBlock } from "@/components/ui/media-block";
import { ProjectCard } from "@/components/ui/project-card";
import { ProjectDemoWindow } from "@/components/project/project-demo-window";
import { ProjectScrollBackdrop } from "@/components/project/project-scroll-backdrop";
import {
  getPlaceholderProjectBySlug,
  InteractiveModulePosition,
  placeholderProjects,
  PlaceholderInteractiveModule
} from "@/lib/placeholder-data";
import { InteractiveModuleRenderer } from "@/components/interactive/interactive-module-renderer";

type ProjectPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return placeholderProjects.map((project) => ({ slug: project.slug }));
}

function getModulesAtPosition(
  modules: PlaceholderInteractiveModule[] | undefined,
  position: InteractiveModulePosition
): PlaceholderInteractiveModule[] {
  return (modules ?? []).filter((module) => module.position === position);
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const project = getPlaceholderProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const related = project.related
    .map((slug) => getPlaceholderProjectBySlug(slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const afterOverviewModules = getModulesAtPosition(project.interactiveModules, "after-overview");
  const afterConceptModules = getModulesAtPosition(project.interactiveModules, "after-concept");
  const afterProjectModules = getModulesAtPosition(project.interactiveModules, "after-project");
  const beforeDocumentationModules = getModulesAtPosition(project.interactiveModules, "before-documentation");
  const isInMySkin = project.slug === "inmyskin";

  return (
    <main className="relative project-glass">
      {isInMySkin ? <ProjectScrollBackdrop slug={project.slug} category={project.category} /> : null}

      <div className={isInMySkin ? "relative z-[1]" : undefined}>
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
              </article>
            </FadeIn>

            <div className="space-y-5">
              <FadeIn delay={0.08}>
                <article className="surface-panel rounded-card p-8">
                  <p className="kicker">Role</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#596173]">{project.roles.join(" | ")}</p>

                  <p className="kicker mt-6">Team</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#596173]">{project.team ?? "Solo project"}</p>

                  <p className="kicker mt-6">Timeline</p>
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
            </article>
          </FadeIn>
        </Section>

        <Section className="pt-2 pb-14">
          <FadeIn>
            <article className="surface-panel rounded-card p-8 md:p-10">
              <p className="kicker">03 / Concept</p>
              <h2 className="display-type mt-3 text-3xl font-semibold text-[#141921] md:text-5xl">Concept</h2>
              <p className="mt-5 max-w-4xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.concept}</p>
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
            </article>
          </FadeIn>
        </Section>

        <Section className="pt-2 pb-14">
          <FadeIn>
            <div className="mb-8">
              <p className="kicker">Process Media</p>
              <h3 className="display-type mt-3 text-2xl font-semibold text-[#141921] md:text-4xl">Editorial sequence</h3>
            </div>
          </FadeIn>

          <div className="grid gap-4 md:grid-cols-12">
            {project.gallery.map((item, index) => {
              const spanClass = index === 0 ? "md:col-span-7" : index === 1 ? "md:col-span-5" : "md:col-span-6";

              return (
                <FadeIn key={item.id} delay={index * 0.05} className={spanClass}>
                  <MediaBlock kind={item.kind} ratio={item.ratio} label={item.label} src={item.src} poster={item.poster} />
                </FadeIn>
              );
            })}
          </div>
        </Section>

        <Section className="pt-2 pb-14">
          <FadeIn>
            <article className="tone-layer rounded-card p-8 md:p-10">
              <p className="kicker">06 / Reflection / Impact</p>
              <h2 className="display-type mt-3 text-3xl font-semibold text-[#141921] md:text-5xl">Reflection / Impact</h2>
              <p className="mt-5 max-w-4xl text-base leading-relaxed text-[#4d5565] md:text-[1.03rem]">{project.sections.reflectionImpact}</p>
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
            {related.map((item, index) => (
              <FadeIn key={item.slug} delay={index * 0.05}>
                <ProjectCard project={item} compact />
              </FadeIn>
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}
