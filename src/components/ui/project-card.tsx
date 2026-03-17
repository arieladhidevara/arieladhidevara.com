"use client";

import { motion } from "framer-motion";
import { PlaceholderProject, isFeaturedProject } from "@/lib/placeholder-data";
import { TagList } from "@/components/ui/tag-list";
import { MediaBlock } from "@/components/ui/media-block";
import { ProjectPreviewLink } from "@/components/ui/project-preview-link";

type ProjectCardProps = {
  project: PlaceholderProject;
  compact?: boolean;
};

export function ProjectCard({ project, compact = false }: ProjectCardProps) {
  const featured = isFeaturedProject(project);
  const cardImageSrc =
    project.heroMediaKind === "image" && project.heroMediaSrc
      ? project.heroMediaSrc
      : project.cardMediaSrc ?? project.heroMediaSrc;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="group h-full rounded-card p-3 md:p-4"
    >
      <ProjectPreviewLink project={project} className="h-full space-y-5">
        <MediaBlock
          label={project.heroLabel}
          kind="image"
          ratio={compact ? "square" : "wide"}
          src={cardImageSrc}
        />

        <div className="space-y-3 px-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="display-type text-clamp-2 text-[1.4rem] font-semibold leading-tight text-[#181d25]">{project.title}</h3>
              <p className="text-clamp-1 mt-1 text-sm text-[#687081]">
                {project.year} | {project.type}
              </p>
            </div>
            <div className="mt-1 flex shrink-0 items-center gap-1.5">
              {featured ? (
                <span className="rounded-full border border-black/[0.08] bg-black/[0.08] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[#434b5b]">
                  Featured
                </span>
              ) : null}
              <span className="text-clamp-1 max-w-[9.25rem] rounded-full bg-black/[0.045] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[#707887]">
                {project.category}
              </span>
            </div>
          </div>

          <p className="text-clamp-2 text-sm leading-relaxed text-[#505868]">{project.oneLiner}</p>
          <TagList tags={project.tags.slice(0, compact ? 3 : 4)} />
        </div>
      </ProjectPreviewLink>
    </motion.article>
  );
}
