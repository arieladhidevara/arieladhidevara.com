import { Section } from "@/components/layout/section";
import { FadeIn } from "@/components/motion/fade-in";
import { MediaBlock } from "@/components/ui/media-block";
import { TagList } from "@/components/ui/tag-list";

const disciplines = ["Creative Technology", "Architecture", "Spatial Interfaces", "AI Product Design", "Media Art"];
const interests = ["Perception Design", "Embodied Interaction", "Narrative Systems", "Motion Language"];

export default function AboutPage() {
  return (
    <main>
      <Section className="pb-12 pt-24">
        <FadeIn>
          <p className="kicker">About</p>
          <h1 className="display-type mt-4 max-w-4xl text-4xl font-semibold text-[#11161d] md:text-6xl">
            A multidisciplinary practice across space, systems, and story.
          </h1>
        </FadeIn>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-8 lg:grid-cols-[0.84fr_1.16fr] lg:items-start">
          <FadeIn>
            <MediaBlock label="Ariel Adhidevara Portrait" ratio="tall" className="min-h-[430px]" />
          </FadeIn>

          <FadeIn delay={0.08}>
            <div className="surface-panel rounded-card p-8 md:p-10">
              <p className="editorial-copy text-sm md:text-base">
                Ariel Adhidevara develops work at the intersection of architecture, interaction design, and computational
                systems. The practice focuses on translating technical complexity into calm, human-centered experiences.
              </p>

              <div className="mt-8 space-y-4">
                <p className="kicker">Disciplines / Roles</p>
                <TagList tags={disciplines} />
              </div>

              <div className="mt-8 space-y-4">
                <p className="kicker">Selected Interests</p>
                <TagList tags={interests} />
              </div>
            </div>
          </FadeIn>
        </div>
      </Section>

      <Section>
        <FadeIn>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                phase: "2019-2021",
                title: "Architectural Foundations",
                copy: "Built core spatial design discipline through studio, representation, and material exploration."
              },
              {
                phase: "2022-2024",
                title: "Interactive + Computational Practice",
                copy: "Expanded into interactive media systems, prototyping, and software-led design workflows."
              },
              {
                phase: "2025-Present",
                title: "Multidisciplinary Portfolio Direction",
                copy: "Integrated architecture, AI software, and experiential systems into a unified practice."
              }
            ].map((entry) => (
              <article key={entry.phase} className="surface-panel rounded-soft p-6">
                <p className="kicker">{entry.phase}</p>
                <h3 className="mt-3 text-lg font-medium text-[#171c24]">{entry.title}</h3>
                <p className="mt-3 text-sm text-[#5b6374]">{entry.copy}</p>
              </article>
            ))}
          </div>
        </FadeIn>
      </Section>
    </main>
  );
}
