export type PracticeCategory =
  | "Interactive Systems"
  | "AI & Software"
  | "Spatial & Architectural Design"
  | "Objects & Product"
  | "Visual & Media";

export type ProjectMeta = {
  slug: string;
  category: PracticeCategory;
  type: string;
  tags: string[];
  featured: boolean;
  status: "draft" | "published";
  order: number;
  coverImage: string;
  cardImage: string;
  primaryMedia: string;
};

export type ProjectRecord = ProjectMeta & {
  title: string;
  year: number;
  oneLiner: string;
  summary: string;
};

export function sortProjectsForListing(projects: ProjectMeta[]): ProjectMeta[] {
  return [...projects].sort((a, b) => a.order - b.order);
}
