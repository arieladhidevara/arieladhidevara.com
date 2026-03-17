"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PlaceholderProject } from "@/lib/placeholder-data";
import { ProjectCard } from "@/components/ui/project-card";
import { cn } from "@/lib/utils";

type WorkLibraryProps = {
  projects: PlaceholderProject[];
  categories: string[];
  initialCategory?: string;
};

export function WorkLibrary({ projects, categories, initialCategory = "All Works" }: WorkLibraryProps) {
  const safeInitial = categories.includes(initialCategory) ? initialCategory : "All Works";
  const [activeCategory, setActiveCategory] = useState<string>(safeInitial);

  useEffect(() => {
    const next = categories.includes(initialCategory) ? initialCategory : "All Works";
    setActiveCategory(next);
  }, [initialCategory, categories]);

  const filtered = useMemo(() => {
    if (activeCategory === "All Works") return projects;
    return projects.filter((project) => project.category === activeCategory);
  }, [activeCategory, projects]);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap gap-2.5">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "rounded-full px-4 py-2 text-[11px] font-medium tracking-[0.14em] transition-colors",
              activeCategory === category
                ? "bg-black/[0.12] text-[#20262f]"
                : "bg-black/[0.04] text-[#60697a] hover:bg-black/[0.08] hover:text-[#323946]"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <motion.div layout className="grid gap-8 md:grid-cols-2">
        {filtered.map((project, index) => {
          const isWide = index % 3 === 0;

          return (
            <motion.div
              key={project.slug}
              layout
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={cn(isWide && "md:col-span-2")}
            >
              <ProjectCard project={project} compact={!isWide} />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
