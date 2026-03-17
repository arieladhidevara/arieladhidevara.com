import { Section } from "@/components/layout/section";
import { FadeIn } from "@/components/motion/fade-in";
import { WorkLibrary } from "@/components/work/work-library";
import { allCategories, placeholderProjects } from "@/lib/placeholder-data";

type WorkIndexPageProps = {
  searchParams?: {
    category?: string | string[];
  };
};

export default function WorkIndexPage({ searchParams }: WorkIndexPageProps) {
  const categories = allCategories();
  const requestedCategory = Array.isArray(searchParams?.category)
    ? searchParams?.category[0]
    : searchParams?.category;
  const initialCategory = requestedCategory && categories.includes(requestedCategory) ? requestedCategory : "All Works";

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
        <WorkLibrary projects={placeholderProjects} categories={categories} initialCategory={initialCategory} />
      </Section>
    </main>
  );
}
