export type MediaKind = "image" | "video" | "document";

export type ProjectMediaItem = {
  kind: MediaKind;
  path: string;
  alt?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
};

export function isVideoPath(pathname: string): boolean {
  return /\.(mp4|mov|webm|mkv)$/i.test(pathname);
}

export function isImagePath(pathname: string): boolean {
  return /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(pathname);
}
