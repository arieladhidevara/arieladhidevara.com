import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-black/[0.07] py-10">
      <div className="mx-auto flex w-full max-w-layout flex-col gap-5 px-6 text-sm text-subtext md:flex-row md:items-center md:justify-between md:px-10">
        <p>Ariel Adhidevara Portfolio | Interactive Systems, AI & Software, Spatial Design</p>
        <div className="flex items-center gap-5">
          <Link href="/about" className="transition-colors hover:text-text">
            About
          </Link>
          <Link href="/work" className="transition-colors hover:text-text">
            All Works
          </Link>
          <Link href="/work?category=Interactive%20Systems" className="transition-colors hover:text-text">
            Interactive Systems
          </Link>
        </div>
      </div>
    </footer>
  );
}
