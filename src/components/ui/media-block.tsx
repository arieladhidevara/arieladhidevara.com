"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type MediaBlockProps = {
  label: string;
  kind?: "image" | "video";
  ratio?: "wide" | "tall" | "square";
  className?: string;
  src?: string;
  poster?: string;
  showMeta?: boolean;
  loading?: "lazy" | "eager";
  fetchPriority?: "auto" | "high" | "low";
};

const ratioClasses: Record<NonNullable<MediaBlockProps["ratio"]>, string> = {
  wide: "aspect-[16/10]",
  square: "aspect-square",
  tall: "aspect-[3/4]"
};

export function MediaBlock({
  label,
  kind = "image",
  ratio = "wide",
  className,
  src,
  poster,
  showMeta = false,
  loading = "lazy",
  fetchPriority = "auto"
}: MediaBlockProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const hasSource = Boolean(src) && !failed;
  const showFallback = !hasSource || !loaded;

  useEffect(() => {
    setFailed(false);
    setLoaded(false);

    const rafId = window.requestAnimationFrame(() => {
      if (kind === "image") {
        const imageElement = imageRef.current;
        if (imageElement?.complete && imageElement.naturalWidth > 0) {
          setLoaded(true);
        }
        return;
      }

      const videoElement = videoRef.current;
      if (videoElement && videoElement.readyState >= 2) {
        setLoaded(true);
      }
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [kind, src]);

  return (
    <div
      className={cn(
        "group media-integrated relative overflow-hidden rounded-card",
        ratioClasses[ratio],
        className
      )}
    >
      {hasSource ? (
        kind === "video" ? (
          <video
            ref={videoRef}
            className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-smooth", loaded ? "opacity-100" : "opacity-0")}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={poster}
            aria-label={label}
            onLoadedData={() => setLoaded(true)}
            onCanPlay={() => setLoaded(true)}
            onError={() => setFailed(true)}
          >
            <source src={src} />
          </video>
        ) : (
          <img
            ref={imageRef}
            src={src}
            alt={label}
            loading={loading}
            fetchPriority={fetchPriority}
            className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-smooth", loaded ? "opacity-100" : "opacity-0")}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        )
      ) : null}

      {showFallback ? (
        <>
          <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_20%_14%,rgba(255,255,255,0.7)_0%,transparent_46%),radial-gradient(circle_at_76%_80%,rgba(170,178,194,0.28)_0%,transparent_48%)]" />
          <div className="absolute inset-0 rounded-[inherit] bg-soft-grid bg-[size:18px_18px] opacity-20" />
        </>
      ) : null}

      {hasSource && showMeta ? (
        <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-t from-black/34 via-black/12 to-transparent" />
      ) : null}

      {showMeta ? (
        <div className="relative flex h-full flex-col justify-between p-5">
          <span className={cn("text-[10px] font-medium uppercase tracking-[0.18em]", hasSource ? "text-white/82" : "text-[#8c939f]")}>
            {kind === "video" ? "Video" : "Image"}
          </span>
          <p className={cn("max-w-[17rem] text-sm leading-relaxed", hasSource ? "text-white" : "text-[#4c5360]")}>{label}</p>
        </div>
      ) : null}

    </div>
  );
}
