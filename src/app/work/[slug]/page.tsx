import { notFound } from "next/navigation";
import { loadPortfolioProjects } from "@/lib/portfolio-projects";
import type { InteractiveModulePosition, PlaceholderInteractiveModule } from "@/lib/placeholder-data";
import { DefaultProjectLayout } from "@/components/project/layouts/DefaultProjectLayout";
import { PhysicadLayout } from "@/components/project/layouts/PhysicadLayout";
import { EphemeraLayout } from "@/components/project/layouts/EphemeraLayout";
import { InMySkinLayout } from "@/components/project/layouts/InMySkinLayout";

type ProjectPageProps = {
  params: {
    slug: string;
  };
};

function getModulesAtPosition(
  modules: PlaceholderInteractiveModule[] | undefined,
  position: InteractiveModulePosition
): PlaceholderInteractiveModule[] {
  return (modules ?? []).filter((module) => module.position === position);
}

export async function generateStaticParams() {
  const projects = await loadPortfolioProjects();
  return projects.map((project) => ({ slug: project.slug }));
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

  const layoutProps = {
    project,
    relatedProjects,
    allProjects,
    afterOverviewModules: getModulesAtPosition(project.interactiveModules, "after-overview"),
    afterConceptModules: getModulesAtPosition(project.interactiveModules, "after-concept"),
    afterProjectModules: getModulesAtPosition(project.interactiveModules, "after-project"),
    beforeDocumentationModules: getModulesAtPosition(project.interactiveModules, "before-documentation")
  };

  if (project.slug === "physicad") return <PhysicadLayout {...layoutProps} />;
  if (project.slug === "ephemera-of-existence") return <EphemeraLayout {...layoutProps} />;
  if (project.slug === "inmyskin") return <InMySkinLayout {...layoutProps} />;
  return <DefaultProjectLayout {...layoutProps} />;
}
