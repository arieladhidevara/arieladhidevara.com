import type { PlaceholderProject } from "@/lib/placeholder-data";

export function getProjectCardImageSrc(project: Pick<PlaceholderProject, "heroMediaKind" | "heroMediaSrc" | "cardMediaSrc">): string | undefined {
  return project.cardMediaSrc ?? project.heroMediaSrc;
}
