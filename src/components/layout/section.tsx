import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  noContainer?: boolean;
  disableDefaultSpacing?: boolean;
};

export function Section({ id, children, className, noContainer = false, disableDefaultSpacing = false }: SectionProps) {
  return (
    <section id={id} className={cn("relative w-full", !disableDefaultSpacing && "py-24 md:py-32", className)}>
      {noContainer ? (
        children
      ) : (
        <div className="mx-auto w-full max-w-layout px-6 md:px-10">{children}</div>
      )}
    </section>
  );
}
