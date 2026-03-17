"use client";

import { useEffect, useState } from "react";

type ProjectDemoWindowProps = {
  title: string;
  demoUrl: string;
};

export function ProjectDemoWindow({ title, demoUrl }: ProjectDemoWindowProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);
  }, [demoUrl]);

  return (
    <article className="surface-panel rounded-card p-8 md:p-10">
      <p className="kicker">Live Demo</p>
      <h3 className="display-type mt-3 text-2xl font-semibold text-[#171c24] md:text-3xl">{title}</h3>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#5c6474] md:text-base">
        Demo langsung dimuat otomatis di halaman ini.
      </p>

      <div className="relative mt-6 overflow-hidden rounded-soft border border-black/[0.08] bg-black/[0.03] aspect-[16/10]">
        {!isReady ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/55 text-sm text-white/90">
            Loading InMySkin WebGL...
          </div>
        ) : null}

        <iframe
          title={title}
          src={demoUrl}
          className="h-full w-full bg-black"
          allowFullScreen
          loading="eager"
          onLoad={() => setIsReady(true)}
        />
      </div>
    </article>
  );
}
