import type { PlaceholderProject } from "@/lib/placeholder-data";

export function getProjectCardImageSrc(project: Pick<PlaceholderProject, "heroMediaKind" | "heroMediaSrc" | "cardMediaSrc">): string | undefined {
  if (project.heroMediaKind === "image" && project.heroMediaSrc) {
    return project.heroMediaSrc;
  }

  return project.cardMediaSrc ?? project.heroMediaSrc;
}

