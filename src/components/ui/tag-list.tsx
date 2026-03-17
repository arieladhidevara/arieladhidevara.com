import { cn } from "@/lib/utils";

type TagListProps = {
  tags: string[];
  className?: string;
  size?: "default" | "compact";
};

export function TagList({ tags, className, size = "default" }: TagListProps) {
  const compact = size === "compact";

  return (
    <ul className={cn("flex flex-wrap overflow-hidden", compact ? "gap-2" : "gap-2.5", className)}>
      {tags.map((tag) => (
        <li
          key={tag}
          className={cn(
            "text-clamp-1 max-w-full rounded-full bg-black/[0.045] font-medium tracking-[0.08em] text-[#4a5160]",
            compact ? "px-2.5 py-1 text-[10px]" : "px-3.5 py-1.5 text-[11px]"
          )}
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
