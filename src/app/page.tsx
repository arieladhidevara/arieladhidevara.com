import Link from "next/link";
import { Section } from "@/components/layout/section";
import { FadeIn } from "@/components/motion/fade-in";
import { HeroOpeningSection } from "@/components/home/hero-opening-section";
import { CvPreviewSection } from "@/components/home/cv-preview-section";
import { ScrollRainbowBackdrop } from "@/components/home/scroll-rainbow-backdrop";
import { ImmersiveBreak } from "@/components/three/immersive-break";
import { FeaturedProjectBlock } from "@/components/ui/featured-project-block";
import { MediaBlock } from "@/components/ui/media-block";
import { ProjectPreviewLink } from "@/components/ui/project-preview-link";
import {
  categoryDescriptions,
  featuredProjectByCategory,
  getProjectsByCategory,
  practiceCategories
} from "@/lib/placeholder-data";
import type { PracticeCategory, PlaceholderProject } from "@/lib/placeholder-data";

type CategoryShowcase = {
  category: PracticeCategory;
  featured: PlaceholderProject;
  others: PlaceholderProject[];
};

const categoryShowcases: CategoryShowcase[] = practiceCategories
  .map((category) => {
    const projects = getProjectsByCategory(category);
    const featuredSlug = featuredProjectByCategory[category];
    const orderedProjects = [...projects].sort((a, b) => {
      if (a.slug === featuredSlug) return -1;
      if (b.slug === featuredSlug) return 1;
      return 0;
    });
    const featured = orderedProjects[0];
    const others = orderedProjects.slice(1, 5);

    if (!featured || others.length < 4) {
      return null;
    }

    return {
      category,
      featured,
      others
    };
  })
  .filter((entry): entry is CategoryShowcase => Boolean(entry));

export default function HomePage() {
  return (
    <main className="relative">
      <ScrollRainbowBackdrop targetId="practice-focus-anchor" />
      <div className="relative z-10">
        <section className="relative -mt-20 h-[100svh] w-full overflow-hidden">
          <HeroOpeningSection />
        </section>

        <Section className="pb-14 pt-12">
          <FadeIn>
            <div
              id="practice-focus-anchor"
              className="tone-layer rounded-card p-8 md:grid md:grid-cols-[1.08fr_0.92fr] md:gap-8 md:p-11"
            >
              <div>
                <p className="kicker">Practice Focus</p>
                <h2 className="display-type mt-3 text-2xl font-semibold text-[#151a22] md:text-4xl">
                  Creative technology practice across interaction, software, space, products, and visual media.
                </h2>
              </div>
              <p className="editorial-copy mt-6 text-sm md:mt-0 md:text-base">
                Ariel Adhidevara works across physical and digital mediums to shape calm, precise, and memorable
                experiences. The portfolio is structured as a multidisciplinary system where each project connects
                concept, execution, and narrative clarity.
              </p>
            </div>
          </FadeIn>
        </Section>

        <Section id="selected-works" className="pt-0">
          <FadeIn>
            <div className="mb-12">
              <p className="kicker">Selected Works</p>
              <h2 className="display-type mt-3 text-3xl font-semibold text-[#131820] md:text-5xl">
                Featured by practice category
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#596173] md:text-base">
                Each domain highlights one featured project and four related works so you can explore Ariel&apos;s practice
                through a clear editorial structure.
              </p>
            </div>
          </FadeIn>

          <div className="space-y-20">
            {categoryShowcases.map(({ category, featured, others }, categoryIndex) => (
              <div key={category} className="space-y-8">
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

                <FadeIn delay={0.04}>
                  <FeaturedProjectBlock project={featured} />
                </FadeIn>

                <div className="overflow-x-auto pb-2">
                  <div className="flex w-max items-stretch gap-4 pr-2">
                    {others.map((project, index) => (
                      <FadeIn key={project.slug} delay={index * 0.04} className="flex w-[15.25rem] shrink-0">
                        <ProjectPreviewLink
                          project={project}
                          className="group flex h-full flex-col rounded-soft bg-black/[0.03] p-3.5 transition-colors hover:bg-black/[0.06]"
                        >
                          <MediaBlock
                            label={project.heroLabel}
                            kind="image"
                            ratio="wide"
                            className="rounded-soft"
                            src={project.cardMediaSrc ?? project.heroMediaSrc}
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
              </div>
            ))}
          </div>
        </Section>

        <Section>
          <ImmersiveBreak />
        </Section>

        <Section id="cv-system" noContainer className="py-0 md:py-0">
          <CvPreviewSection />
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
