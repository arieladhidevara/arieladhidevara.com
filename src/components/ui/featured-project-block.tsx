"use client";

import { motion } from "framer-motion";
import { PlaceholderProject } from "@/lib/placeholder-data";
import { MediaBlock } from "@/components/ui/media-block";
import { TagList } from "@/components/ui/tag-list";
import { ProjectPreviewLink } from "@/components/ui/project-preview-link";
import { getProjectCardImageSrc } from "@/lib/project-media";
import { cn } from "@/lib/utils";

type FeaturedProjectBlockProps = {
  project: PlaceholderProject;
  projectPool?: PlaceholderProject[];
  categoryLabel?: string;
  showFeaturedLabel?: boolean;
  emphasizeMedia?: boolean;
  glassTone?: boolean;
};

export function FeaturedProjectBlock({
  project,
  projectPool,
  categoryLabel,
  showFeaturedLabel = true,
  emphasizeMedia = false,
  glassTone = false
}: FeaturedProjectBlockProps) {
  const cardImageSrc = getProjectCardImageSrc(project);

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-card p-5 md:p-7",
        glassTone
          ? "border border-black/[0.08] bg-white/[0.56] shadow-[0_24px_42px_-34px_rgba(14,20,29,0.42),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px]"
          : "surface-panel"
      )}
    >
      <ProjectPreviewLink
        project={project}
        allProjects={projectPool}
        className={cn("grid gap-6 md:items-end", emphasizeMedia ? "md:grid-cols-[1fr_2fr] md:items-stretch" : "md:grid-cols-[1.1fr_1fr]")}
      >
        <div className={cn("space-y-4", emphasizeMedia && "md:col-span-1 md:flex md:h-full md:flex-col")}>
          <div className="flex items-center gap-3">
            {showFeaturedLabel ? <p className="kicker">Featured Project</p> : null}
            <span className="rounded-full bg-black/[0.045] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[#707887]">
              {categoryLabel ?? project.category}
            </span>
          </div>
          <h3 className="display-type text-3xl font-semibold text-[#151a22] md:text-4xl">{project.title}</h3>
          <p className={cn("text-sm leading-relaxed text-[#5a6272]", emphasizeMedia && "md:text-base")}>{project.oneLiner}</p>
          <div className={cn("pt-1", emphasizeMedia && "md:mt-auto")}>
            <TagList tags={project.tags.slice(0, 5)} />
          </div>
        </div>

        <MediaBlock
          label={project.heroLabel}
          kind="image"
          ratio="wide"
          className={cn(emphasizeMedia && "md:col-span-1 md:aspect-[19/9]")}
          src={cardImageSrc}
        />
      </ProjectPreviewLink>
    </motion.article>
  );
}
