import { FeaturedProjectBlock } from "@/components/ui/featured-project-block";
import { MediaBlock } from "@/components/ui/media-block";
import { ProjectPreviewLink } from "@/components/ui/project-preview-link";
import { Section } from "@/components/layout/section";
import { FadeIn } from "@/components/motion/fade-in";
import { buildCategoryShowcases } from "@/lib/category-showcases";
import { categoryDescriptions, practiceCategories } from "@/lib/placeholder-data";
import { loadPortfolioProjects } from "@/lib/portfolio-projects";
import { getProjectCardImageSrc } from "@/lib/project-media";

type WorkIndexPageProps = {
  searchParams?: {
    category?: string | string[];
  };
};

export default async function WorkIndexPage({ searchParams }: WorkIndexPageProps) {
  const projects = await loadPortfolioProjects();
  const requestedCategory = Array.isArray(searchParams?.category)
    ? searchParams?.category[0]
    : searchParams?.category;
  const prioritizedCategory = practiceCategories.find((category) => category === requestedCategory);
  const orderedCategories = prioritizedCategory
    ? [prioritizedCategory, ...practiceCategories.filter((category) => category !== prioritizedCategory)]
    : practiceCategories;
  const categoryShowcases = buildCategoryShowcases(projects, { orderedCategories });

  return (
    <main>
      <Section className="pb-14 pt-24">
        <FadeIn>
          <p className="kicker">Project Library</p>
          <h1 className="display-type mt-4 max-w-4xl text-4xl font-semibold text-[#12171f] md:text-6xl">All Works</h1>
          <p className="editorial-copy mt-5 text-sm md:text-base">
            Browse projects by practice domain, from interactive installations and AI products to spatial design,
            physical objects, and visual media.
          </p>
        </FadeIn>
      </Section>

      <Section className="pt-0">
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
                  />
                </FadeIn>
              ) : (
                <FadeIn delay={0.04}>
                  <div className="tone-layer rounded-card p-6 text-sm text-[#5a6272]">Featured project coming soon.</div>
                </FadeIn>
              )}

              {others.length > 0 ? (
                <div className="overflow-x-auto pb-2">
                  <div className="flex w-max items-stretch gap-4 pr-2">
                    {others.map((project, index) => (
                      <FadeIn key={`${category}-${project.slug}`} delay={index * 0.04} className="w-[15.25rem] shrink-0">
                        <ProjectPreviewLink
                          project={project}
                          allProjects={projects}
                          className="no-glass-hover group flex h-[18rem] flex-col rounded-soft bg-black/[0.03] p-3.5 transition-colors hover:bg-white/[0.88]"
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
                </div>
              ) : (
                <p className="text-sm text-[#6b7383]">No additional projects in this category yet.</p>
              )}
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
