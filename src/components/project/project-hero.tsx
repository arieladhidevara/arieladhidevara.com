import { PlaceholderProject } from "@/lib/placeholder-data";
import { MediaBlock } from "@/components/ui/media-block";
import { TagList } from "@/components/ui/tag-list";

type ProjectHeroProps = {
  project: PlaceholderProject;
};

export function ProjectHero({ project }: ProjectHeroProps) {
  const infoRows = [
    { label: "Role", value: project.roles[0] ?? "Interaction Designer" },
    { label: "Team", value: project.team ?? "Solo project" },
    { label: "INSTITUTION / YEAR", value: project.timeline ?? `${project.year}` },
    { label: "Tools", value: project.tools.join(" ") }
  ];

  const heroContent = (
    <section className="grid gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-stretch">
      <div className="space-y-7">
        <p className="kicker">Project Case Study</p>
        <h1 className="display-type max-w-3xl text-4xl font-semibold leading-[1.03] text-[#11151c] md:text-6xl">
          {project.title}
        </h1>

        <p className="max-w-2xl text-base leading-relaxed text-[#4d5565] md:text-lg">{project.oneLiner}</p>

        <div className="tone-layer rounded-soft p-5 md:p-6">
          <dl className="space-y-3.5">
            {infoRows.map((row) => (
              <div key={row.label} className="grid grid-cols-[5.4rem_1fr] gap-3">
                <dt className="kicker pt-0.5">{row.label}</dt>
                <dd className="text-clamp-2 text-sm leading-relaxed text-[#4d5565]">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <TagList tags={project.tags} size="compact" />
      </div>

      <MediaBlock
        label={project.heroLabel}
        kind={project.heroMediaKind ?? "image"}
        ratio="wide"
        className="rounded-soft lg:h-full lg:aspect-auto"
        src={project.heroMediaSrc}
        poster={project.heroMediaPoster}
        loading="eager"
        fetchPriority="high"
      />
    </section>
  );

  return <div className="surface-panel rounded-card p-6 md:p-8">{heroContent}</div>;
}
