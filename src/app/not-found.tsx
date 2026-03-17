import Link from "next/link";
import { Section } from "@/components/layout/section";

export default function NotFoundPage() {
  return (
    <Section className="min-h-[56vh]">
      <div className="surface-panel rounded-card p-10">
        <p className="kicker">Page Not Found</p>
        <h1 className="display-type mt-4 text-4xl font-bold text-[#10151c]">This page is not available.</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#667083]">
          The URL you entered does not currently map to a published page in the portfolio.
        </p>
        <Link href="/work" className="mt-7 inline-block rounded-full bg-black/[0.06] px-5 py-2.5 text-sm font-semibold text-[#1b212b]">
          Back to All Works
        </Link>
      </div>
    </Section>
  );
}
