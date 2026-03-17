import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type InteractiveSectionProps = {
  kicker: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

export function InteractiveSection({ kicker, title, description, children, className }: InteractiveSectionProps) {
  return (
    <section className={cn("surface-panel rounded-card p-7 md:p-10", className)}>
      <div className="mb-7 space-y-3 md:mb-9">
        <p className="kicker">{kicker}</p>
        <h3 className="display-type text-2xl font-semibold leading-tight text-[#141921] md:text-4xl">{title}</h3>
        <p className="max-w-3xl text-sm leading-relaxed text-[#596173] md:text-base">{description}</p>
      </div>
      {children}
    </section>
  );
}
