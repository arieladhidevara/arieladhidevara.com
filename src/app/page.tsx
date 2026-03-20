import Link from "next/link";
import { Section } from "@/components/layout/section";
import { FadeIn } from "@/components/motion/fade-in";
import { HeroOpeningSection } from "@/components/home/hero-opening-section";
import { CvPreviewSection } from "@/components/home/cv-preview-section";
import { ScrollRainbowBackdrop } from "@/components/home/scroll-rainbow-backdrop";
import { CategoryVideoBackdrop } from "@/components/home/category-video-backdrop";
import { IntroVideoBackdrop } from "@/components/home/intro-video-backdrop";
import { ImmersiveBreak } from "@/components/three/immersive-break";
import { FeaturedProjectBlock } from "@/components/ui/featured-project-block";
import { MediaBlock } from "@/components/ui/media-block";
import { ProjectPreviewLink } from "@/components/ui/project-preview-link";
import { categoryDescriptions, type PracticeCategory } from "@/lib/placeholder-data";
import { buildCategoryShowcases } from "@/lib/category-showcases";
import { loadPortfolioProjects } from "@/lib/portfolio-projects";
import { getProjectCardImageSrc } from "@/lib/project-media";
import { resolveAssetUrl } from "@/lib/asset-url";

const homeCategoryVideoSources: Record<PracticeCategory, string> = {
  "Interactive Systems": resolveAssetUrl("ui-graphics/InteractiveSystems.mp4"),
  "AI & Software": resolveAssetUrl("ui-graphics/AIandSoftwares.mp4"),
  "Spatial & Architectural Design": resolveAssetUrl("ui-graphics/SpatialandArchitecture.mp4"),
  "Objects & Product": resolveAssetUrl("ui-graphics/ObjectsandProduct.mp4"),
  "Visual & Media": resolveAssetUrl("ui-graphics/VisualandMedia.mp4")
};
const homeIntroVideoSrc = resolveAssetUrl("ui-graphics/background-video.mp4");

function getHomeCategoryAnchorId(category: PracticeCategory) {
  return `home-category-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export default async function HomePage() {
  const projects = await loadPortfolioProjects();
  const categoryShowcases = buildCategoryShowcases(projects, { otherLimit: 4 });
  const categoryVideoTargets = categoryShowcases.map(({ category }) => ({
    id: getHomeCategoryAnchorId(category),
    videoSrc: homeCategoryVideoSources[category]
  }));

  return (
    <main className="relative">
      <ScrollRainbowBackdrop targetId="practice-focus-anchor" />
      <IntroVideoBackdrop endId="selected-works" videoSrc={homeIntroVideoSrc} />
      <CategoryVideoBackdrop targets={categoryVideoTargets} />
      <div className="relative z-10">
        <section className="relative -mt-20 h-[100svh] w-full overflow-hidden">
          <HeroOpeningSection />
        </section>

        <Section className="pb-[400px] pt-14">
          <div
            id="practice-focus-anchor"
            className="tone-layer rounded-card p-8 md:grid md:grid-cols-[1.08fr_0.92fr] md:gap-8 md:p-11"
          >
            <FadeIn delay={0.12} amount={0} margin="-44% 0px -44% 0px">
              <div>
                <p className="kicker">Practice Focus</p>
                <h2 className="display-type mt-3 text-2xl font-semibold text-[#151a22] md:text-4xl">
                  Creative technology practice across interaction, software, space, products, and visual media.
                </h2>
              </div>
            </FadeIn>
            <FadeIn delay={0.36} amount={0} margin="-44% 0px -44% 0px" className="mt-6 md:mt-0">
              <p className="editorial-copy text-sm md:text-base">
                Ariel Adhidevara works across physical and digital mediums to shape calm, precise, and memorable
                experiences. The portfolio is structured as a multidisciplinary system where each project connects
                concept, execution, and narrative clarity.
              </p>
            </FadeIn>
          </div>
        </Section>

        <Section id="selected-works" className="pt-[300px] md:pt-[300px]">
          <FadeIn>
            <div className="mb-12">
              <h2 className="display-type text-3xl font-semibold text-[#131820] md:text-5xl">Selected Works:</h2>
            </div>
          </FadeIn>

          <div className="space-y-20">
            {categoryShowcases.map(({ category, featured, others }, categoryIndex) => (
              <div key={category} id={getHomeCategoryAnchorId(category)} className="space-y-8">
                <FadeIn delay={categoryIndex * 0.03}>
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="kicker">{category}</p>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5a6272] md:text-base">
                        {categoryDescriptions[category]}
                      </p>
                    </div>
                    <Link
                      href={{ pathname: "/work", query: { category } }}
                      className="text-sm text-[#596173] transition-colors hover:text-[#1a2029]"
                    >
                      View all in {category} -&gt;
                    </Link>
                  </div>
                </FadeIn>

                {featured ? (
                  <FadeIn delay={0.04}>
                    <FeaturedProjectBlock
                      project={featured}
                      projectPool={projects}
                      categoryLabel={category}
                      showFeaturedLabel={false}
                      emphasizeMedia
                      glassTone
                    />
                  </FadeIn>
                ) : (
                  <FadeIn delay={0.04}>
                    <div className="tone-layer rounded-card p-6 text-sm text-[#5a6272]">Featured project coming soon.</div>
                  </FadeIn>
                )}

                {others.length > 0 ? (
                  <div className="pb-2">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      {others.map((project, index) => (
                        <FadeIn key={project.slug} delay={index * 0.04} className="h-full min-w-0">
                          <ProjectPreviewLink
                            project={project}
                            allProjects={projects}
                            className="group flex h-full min-h-[20.5rem] flex-col rounded-soft border border-black/[0.08] bg-white/[0.52] p-3.5 shadow-[0_18px_34px_-30px_rgba(14,20,29,0.4),inset_0_1px_0_rgba(255,255,255,0.68)] backdrop-blur-[14px] transition-colors hover:bg-white/[0.62]"
                          >
                            <MediaBlock
                              label={project.heroLabel}
                              kind="image"
                              ratio="wide"
                              className="rounded-soft"
                              src={getProjectCardImageSrc(project)}
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
                  </div>
                ) : (
                  <p className="text-sm text-[#6b7383]">No additional projects in this category yet.</p>
                )}
              </div>
            ))}
          </div>
        </Section>

        <Section>
          <ImmersiveBreak />
        </Section>

        <Section id="cv-system" noContainer className="py-0 md:py-0">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_bottom,rgba(241,242,244,0.05)_0%,rgba(244,246,249,0.16)_24%,rgba(246,248,251,0.22)_50%,rgba(244,246,249,0.16)_76%,rgba(241,242,244,0.05)_100%)]"
          />
          <div
            className="relative z-10 [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
          >
            <CvPreviewSection />
          </div>
        </Section>

        <Section id="contact" className="pt-10">
          <FadeIn>
            <div className="surface-panel rounded-card p-10 text-center md:p-14">
              <p className="kicker">Collaboration</p>
              <h3 className="display-type mt-4 text-3xl font-semibold text-[#131820] md:text-5xl">
                Let&apos;s build the next spatial narrative.
              </h3>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#5a6272] md:text-base">
                Open to collaborations across interactive systems, AI products, and spatial storytelling projects.
              </p>
              <div className="mt-8 flex justify-center gap-3">
                <Link href="/about" className="rounded-full bg-black/[0.06] px-5 py-2.5 text-sm font-semibold text-[#1b212b]">
                  About Ariel
                </Link>
                <Link href="/work" className="rounded-full bg-black/[0.06] px-5 py-2.5 text-sm text-[#485060]">
                  All Works
                </Link>
              </div>
            </div>
          </FadeIn>
        </Section>
      </div>
    </main>
  );
}
