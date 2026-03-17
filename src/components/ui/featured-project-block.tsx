"use client";

import { motion } from "framer-motion";
import { PlaceholderProject } from "@/lib/placeholder-data";
import { MediaBlock } from "@/components/ui/media-block";
import { TagList } from "@/components/ui/tag-list";
import { ProjectPreviewLink } from "@/components/ui/project-preview-link";

type FeaturedProjectBlockProps = {
  project: PlaceholderProject;
};

export function FeaturedProjectBlock({ project }: FeaturedProjectBlockProps) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="surface-panel rounded-card p-5 md:p-7"
    >
      <ProjectPreviewLink project={project} className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-end">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <p className="kicker">Featured Project</p>
            <span className="rounded-full bg-black/[0.045] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[#707887]">
              {project.category}
            </span>
          </div>
          <h3 className="display-type text-3xl font-semibold text-[#151a22] md:text-4xl">{project.title}</h3>
          <p className="text-sm leading-relaxed text-[#5a6272]">{project.oneLiner}</p>
          <div className="pt-1">
            <TagList tags={project.tags.slice(0, 5)} />
          </div>
        </div>

        <MediaBlock
          label={project.heroLabel}
          kind={project.heroMediaKind ?? "image"}
          ratio="wide"
          src={project.heroMediaSrc}
          poster={project.heroMediaPoster}
        />
      </ProjectPreviewLink>
    </motion.article>
  );
}
