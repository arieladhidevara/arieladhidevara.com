export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-black/[0.07] py-10">
      <div className="mx-auto flex w-full max-w-layout flex-col items-center justify-center gap-4 px-6 text-center text-sm text-subtext md:px-10">
        <p>&copy; {currentYear} Ariel Adhidevara. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a
            href="https://www.instagram.com/arieladhidevara/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="transition-colors hover:text-text"
          >
            <span className="sr-only">Instagram</span>
            <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-current">
              <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5Zm9.75 1.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Z" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/ariel-adhidevara"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="transition-colors hover:text-text"
          >
            <span className="sr-only">LinkedIn</span>
            <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-current">
              <path d="M5.47 3A2.47 2.47 0 1 1 3 5.47 2.47 2.47 0 0 1 5.47 3ZM3.75 8.5h3.44V20.5H3.75Zm5.63 0h3.3v1.64h.05A3.62 3.62 0 0 1 16 8.14c3.5 0 4.14 2.3 4.14 5.3v7.06h-3.44v-6.26c0-1.5-.02-3.43-2.09-3.43s-2.41 1.63-2.41 3.32v6.37H9.38Z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
