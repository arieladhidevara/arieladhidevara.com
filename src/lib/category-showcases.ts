import {
  featuredProjectByCategory,
  practiceCategories,
  projectInCategory,
  type PlaceholderProject,
  type PracticeCategory
} from "@/lib/placeholder-data";

export type CategoryShowcase = {
  category: PracticeCategory;
  featured?: PlaceholderProject;
  projects: PlaceholderProject[];
  others: PlaceholderProject[];
};

type BuildCategoryShowcasesOptions = {
  otherLimit?: number;
  orderedCategories?: PracticeCategory[];
  othersOrder?: Partial<Record<PracticeCategory, string[]>>;
};

function normalizeCategoryOrder(orderedCategories?: PracticeCategory[]): PracticeCategory[] {
  if (!orderedCategories || orderedCategories.length === 0) {
    return practiceCategories;
  }

  const normalized: PracticeCategory[] = [];
  for (const category of orderedCategories) {
    if (normalized.includes(category)) continue;
    normalized.push(category);
  }

  for (const category of practiceCategories) {
    if (normalized.includes(category)) continue;
    normalized.push(category);
  }

  return normalized;
}

export function buildCategoryShowcases(
  projects: PlaceholderProject[],
  options: BuildCategoryShowcasesOptions = {}
): CategoryShowcase[] {
  const orderedCategories = normalizeCategoryOrder(options.orderedCategories);

  return orderedCategories.map((category) => {
    const projectsInCategory = projects.filter((project) => projectInCategory(project, category));
    const featuredSlug = featuredProjectByCategory[category];
    const featured = projects.find((project) => project.slug === featuredSlug) ?? projectsInCategory[0];
    const customOrder = options.othersOrder?.[category];
    let others: PlaceholderProject[];
    if (customOrder) {
      others = customOrder
        .map((slug) => projects.find((p) => p.slug === slug))
        .filter((p): p is PlaceholderProject => !!p && p.slug !== featured?.slug);
    } else {
      const remainingProjects = projectsInCategory.filter((project) => project.slug !== featured?.slug);
      others = typeof options.otherLimit === "number" ? remainingProjects.slice(0, Math.max(0, options.otherLimit)) : remainingProjects;
    }

    return {
      category,
      featured,
      projects: projectsInCategory,
      others
    };
  });
}
