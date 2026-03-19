import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";
import { resolveAssetUrl } from "@/lib/asset-url";
import type {
  PlaceholderMedia,
  PlaceholderProject,
  PracticeCategory,
  ProjectDocumentationLink
} from "@/lib/placeholder-data";
import { placeholderProjects, practiceCategories } from "@/lib/placeholder-data";

const CONTENT_ROOT = path.resolve(process.cwd(), "content/projects");
const CATEGORY_ALIASES: Record<string, PracticeCategory> = {
  "interactive systems": "Interactive Systems",
  "ai & software": "AI & Software",
  "spatial & architecture design": "Spatial & Architectural Design",
  "spatial & architectural design": "Spatial & Architectural Design",
  "objects & products": "Objects & Product",
  "objects & product": "Objects & Product",
  "visual & media": "Visual & Media"
};

type ContentSections = {
  overview?: unknown;
  background?: unknown;
  concept?: unknown;
  theProject?: unknown;
  process?: unknown;
  reflectionImpact?: unknown;
  documentation?: unknown;
};

type ContentAssets = {
  images?: unknown;
  videos?: unknown;
  scripts?: unknown;
  models?: unknown;
  documents?: unknown;
};

type ContentProjectRecord = {
  slug?: unknown;
  title?: unknown;
  year?: unknown;
  institutionYear?: unknown;
  contributors?: unknown;
  category?: unknown;
  type?: unknown;
  tags?: unknown;
  oneLiner?: unknown;
  summaryShort?: unknown;
  summaryMedium?: unknown;
  sections?: ContentSections;
  roles?: unknown;
  tools?: unknown;
  heroImage?: unknown;
  coverImage?: unknown;
  cardImage?: unknown;
  primaryVideo?: unknown;
  primaryMedia?: unknown;
  gallery?: unknown;
  galleryImages?: unknown;
  videos?: unknown;
  assets?: ContentAssets;
  relatedProjects?: unknown;
  links?: unknown;
  demoUrl?: unknown;
  featured?: unknown;
  order?: unknown;
};

type MappedProject = {
  project: PlaceholderProject;
  order: number;
};

const VIDEO_EXT = new Set([".mp4", ".mov", ".m4v", ".webm", ".mkv"]);

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.floor(value);
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.floor(parsed);
  }
  return null;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return unique(value.map((item) => asString(item)).filter(Boolean));
  if (typeof value === "string") {
    return unique(
      value
        .split(/[,;|\n]/g)
        .map((item) => item.trim())
        .filter(Boolean)
    );
  }
  return [];
}

function unique(items: string[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const item of items) {
    const normalized = item.trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(normalized);
  }
  return output;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function withSentenceEnding(value: string, fallback = ""): string {
  const text = (value || fallback).trim();
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function firstSentence(value: string): string {
  const text = value.trim();
  if (!text) return "";
  const parts = text.split(/(?<=[.!?])\s+/);
  return parts[0]?.trim() ?? text;
}

function parseYear(record: ContentProjectRecord, textBlob: string): number {
  const direct = asNumber(record.year);
  if (direct && direct >= 1900 && direct <= 3000) return direct;

  const source = `${asString(record.institutionYear)} ${textBlob}`;
  const years = Array.from(source.matchAll(/\b(19|20)\d{2}\b/g))
    .map((match) => Number(match[0]))
    .filter((year) => Number.isFinite(year));

  if (years.length > 0) return Math.max(...years);
  return new Date().getFullYear();
}

function normalizeCategory(explicit: string, textBlob: string): PracticeCategory {
  const normalized = explicit.toLowerCase().trim();
  if (CATEGORY_ALIASES[normalized]) return CATEGORY_ALIASES[normalized];

  const explicitCandidates = unique(
    explicit
      .split(/[,;]/g)
      .map((entry) => entry.trim())
      .filter(Boolean)
  );

  for (const candidate of explicitCandidates) {
    const alias = CATEGORY_ALIASES[candidate.toLowerCase()];
    if (alias) return alias;
  }

  const haystack = textBlob.toLowerCase();
  if (/(interactive|sensor|projection|embodied|vr|ar|xr|gesture|installation)/.test(haystack)) {
    return "Interactive Systems";
  }
  if (/(ai|software|algorithm|app|platform|web|agent|backend|frontend|coding)/.test(haystack)) {
    return "AI & Software";
  }
  if (/(spatial|architecture|architectural|urban|pavilion|exhibition|interior)/.test(haystack)) {
    return "Spatial & Architectural Design";
  }
  if (/(product|object|wearable|device|hardware|prototype|biometric)/.test(haystack)) {
    return "Objects & Product";
  }
  return "Visual & Media";
}

function findMedia(paths: string[], priorities: string[]): string {
  const lower = paths.map((pathValue) => ({ raw: pathValue, lower: pathValue.toLowerCase() }));
  for (const priority of priorities) {
    const target = priority.toLowerCase();
    const exact = lower.find((entry) => entry.lower === target || entry.lower.startsWith(`${target}.`));
    if (exact) return exact.raw;
  }
  return paths[0] ?? "";
}

function getArrayFromAssets(assets: Record<string, unknown>, key: string): string[] {
  return asStringArray(assets[key]);
}

function toMediaKind(pathValue: string): "image" | "video" {
  const ext = path.extname(pathValue).toLowerCase();
  if (VIDEO_EXT.has(ext)) return "video";
  return "image";
}

function toDemoUrl(record: ContentProjectRecord, scriptAssets: string[]): string | undefined {
  const configured = asString(record.demoUrl);
  if (configured) {
    if (/^https?:\/\//i.test(configured) || configured.startsWith("/")) return configured;
    return `/api/assets/${configured.replace(/^\/+/, "")}`;
  }

  const htmlScript = scriptAssets.find((item) => item.toLowerCase().endsWith("index.html"));
  if (!htmlScript) return undefined;
  return `/api/assets/${htmlScript}`;
}

function buildDocumentationLinks(record: ContentProjectRecord, assets: Record<string, unknown>): ProjectDocumentationLink[] {
  const links: ProjectDocumentationLink[] = [];
  const scriptAssets = getArrayFromAssets(assets, "scripts");
  const imageAssets = getArrayFromAssets(assets, "images");
  const videoAssets = getArrayFromAssets(assets, "videos");
  const modelAssets = getArrayFromAssets(assets, "models");
  const documentAssets = getArrayFromAssets(assets, "documents");

  const demoUrl = toDemoUrl(record, scriptAssets);
  if (demoUrl) {
    links.push({ label: "Interactive Demo", href: demoUrl, type: "demo" });
  }

  if (imageAssets[0]) {
    links.push({ label: "Hero Image", href: resolveAssetUrl(imageAssets[0]), type: "image" });
  }
  if (videoAssets[0]) {
    links.push({ label: "Primary Video", href: resolveAssetUrl(videoAssets[0]), type: "video" });
  }
  if (scriptAssets[0]) {
    links.push({ label: "Project Script", href: resolveAssetUrl(scriptAssets[0]), type: "script" });
  }
  if (modelAssets[0]) {
    links.push({ label: "3D Model", href: resolveAssetUrl(modelAssets[0]), type: "model" });
  }
  if (documentAssets[0]) {
    links.push({ label: "Documentation File", href: resolveAssetUrl(documentAssets[0]), type: "document" });
  }

  const externalLinks = asStringArray(record.links);
  for (const linkValue of externalLinks) {
    const href = linkValue.trim();
    if (!href) continue;
    links.push({ label: "External Link", href, type: "document" });
  }

  return links.slice(0, 6);
}

function buildGallery(
  slug: string,
  title: string,
  imagePaths: string[],
  videoPath: string,
  posterPath: string
): PlaceholderMedia[] {
  const images = imagePaths.map((item) => resolveAssetUrl(item)).filter(Boolean);
  const video = videoPath ? resolveAssetUrl(videoPath) : "";
  const poster = posterPath ? resolveAssetUrl(posterPath) : undefined;

  const gallery: PlaceholderMedia[] = [];

  if (images[0]) {
    gallery.push({
      id: `${slug}-overview`,
      kind: "image",
      label: `${title} - Overview`,
      ratio: "wide",
      src: images[0]
    });
  }

  if (images[1]) {
    gallery.push({
      id: `${slug}-detail`,
      kind: "image",
      label: `${title} - Detail`,
      ratio: "square",
      src: images[1]
    });
  }

  if (video) {
    gallery.push({
      id: `${slug}-motion`,
      kind: "video",
      label: `${title} - Motion`,
      ratio: "wide",
      src: video,
      poster
    });
  } else if (images[2]) {
    gallery.push({
      id: `${slug}-process`,
      kind: "image",
      label: `${title} - Process`,
      ratio: "wide",
      src: images[2]
    });
  }

  if (gallery.length === 0) {
    return [
      { id: `${slug}-overview`, kind: "image", label: `${title} - Overview`, ratio: "wide" },
      { id: `${slug}-detail`, kind: "image", label: `${title} - Detail`, ratio: "square" },
      { id: `${slug}-motion`, kind: "video", label: `${title} - Motion`, ratio: "wide" }
    ];
  }

  return gallery;
}

function mapRecord(raw: ContentProjectRecord, fileName: string): MappedProject | null {
  const fallbackSlug = slugify(path.basename(fileName, ".json"));
  const sectionsRecord = asRecord(raw.sections);
  const assetsRecord = asRecord(raw.assets);

  const title = asString(raw.title) || path.basename(fileName, ".json");
  const slug = slugify(asString(raw.slug) || title || fallbackSlug);
  if (!slug) return null;

  const summaryShort = asString(raw.summaryShort);
  const summaryMedium = asString(raw.summaryMedium);
  const overview = withSentenceEnding(asString(sectionsRecord.overview), summaryShort);
  const background = withSentenceEnding(asString(sectionsRecord.background), "Background section pending.");
  const concept = withSentenceEnding(asString(sectionsRecord.concept), "Concept section pending.");
  const theProject = withSentenceEnding(asString(sectionsRecord.theProject), overview || summaryShort);
  const process = withSentenceEnding(asString(sectionsRecord.process), "Process section pending.");
  const reflectionImpact = withSentenceEnding(
    asString(sectionsRecord.reflectionImpact),
    "Reflection / impact notes will be expanded."
  );
  const documentation = withSentenceEnding(
    asString(sectionsRecord.documentation),
    "Documentation links and assets are being prepared."
  );

  const oneLiner = withSentenceEnding(
    asString(raw.oneLiner),
    firstSentence(summaryShort || overview || `${title} project overview`)
  );

  const roles = asStringArray(raw.roles);
  const tools = asStringArray(raw.tools);
  const tags = asStringArray(raw.tags);
  const contributors = asString(raw.contributors);
  const timeline = asString(raw.institutionYear);

  const imageAssets = unique(
    [
      ...asStringArray(raw.galleryImages),
      ...asStringArray(raw.gallery),
      ...getArrayFromAssets(assetsRecord, "images")
    ].filter(Boolean)
  );
  const videoAssets = unique(
    [
      ...asStringArray(raw.videos),
      ...getArrayFromAssets(assetsRecord, "videos")
    ].filter(Boolean)
  );
  const scriptAssets = getArrayFromAssets(assetsRecord, "scripts");

  const heroImagePath = findMedia(
    unique([asString(raw.heroImage), asString(raw.coverImage), asString(raw.cardImage), ...imageAssets].filter(Boolean)),
    ["images/cover", "images/card", "images/image-01"]
  );
  const cardImagePath = findMedia(
    unique([asString(raw.cardImage), asString(raw.coverImage), heroImagePath, ...imageAssets].filter(Boolean)),
    ["images/card", "images/cover", "images/image-01"]
  );
  const primaryVideoPath = findMedia(
    unique([asString(raw.primaryVideo), asString(raw.primaryMedia), ...videoAssets].filter(Boolean)),
    ["videos/demo", "videos/teaser", "videos/video-01"]
  );

  const mediaKind = heroImagePath ? "image" : primaryVideoPath ? toMediaKind(primaryVideoPath) : "image";
  const heroMediaSrc = mediaKind === "video" ? resolveAssetUrl(primaryVideoPath) : resolveAssetUrl(heroImagePath);
  const heroMediaPoster = mediaKind === "video" ? resolveAssetUrl(heroImagePath || cardImagePath) : undefined;
  const cardMediaSrc = resolveAssetUrl(cardImagePath || heroImagePath);

  const textBlob = [title, oneLiner, overview, background, concept, process, tools.join(" "), tags.join(" ")].join(" ");
  const year = parseYear(raw, textBlob);
  const category = normalizeCategory(asString(raw.category), textBlob);
  const type = asString(raw.type) || "Project";
  const summary = withSentenceEnding(summaryMedium, summaryShort || overview);

  const gallery = buildGallery(slug, title, imageAssets, primaryVideoPath, heroImagePath || cardImagePath);
  const related = asStringArray(raw.relatedProjects).map(slugify).filter(Boolean);
  const demoUrl = toDemoUrl(raw, scriptAssets);
  const documentationLinks = buildDocumentationLinks(raw, assetsRecord);

  const project: PlaceholderProject = {
    slug,
    title,
    year,
    category,
    type,
    team: contributors || undefined,
    timeline: timeline || undefined,
    tags,
    oneLiner,
    summary,
    context: background,
    challenge: concept,
    approach: process,
    outcome: reflectionImpact,
    roles: roles.length > 0 ? roles : ["Interaction & Technical Lead"],
    tools,
    heroLabel: `${title} - Key Visual`,
    heroMediaKind: mediaKind,
    heroMediaSrc: heroMediaSrc || undefined,
    heroMediaPoster: heroMediaPoster || undefined,
    cardMediaSrc: cardMediaSrc || heroMediaSrc || undefined,
    demoUrl,
    demoCtaLabel: demoUrl ? "Open Interactive Demo" : undefined,
    sections: {
      overview,
      background,
      concept,
      theProject,
      process,
      reflectionImpact,
      documentation
    },
    documentationLinks: documentationLinks.length > 0 ? documentationLinks : undefined,
    gallery,
    related
  };

  return {
    project,
    order: asNumber(raw.order) ?? Number.MAX_SAFE_INTEGER
  };
}

export const loadPortfolioProjects = cache(async (): Promise<PlaceholderProject[]> => {
  let files: string[] = [];
  try {
    const entries = await fs.readdir(CONTENT_ROOT, { withFileTypes: true });
    files = entries
      .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === ".json")
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
  } catch {
    return placeholderProjects;
  }

  const mapped: MappedProject[] = [];
  for (const fileName of files) {
    try {
      const fullPath = path.join(CONTENT_ROOT, fileName);
      const rawJson = await fs.readFile(fullPath, "utf8");
      const parsed = JSON.parse(rawJson.replace(/^\uFEFF/, "")) as ContentProjectRecord;
      const result = mapRecord(parsed, fileName);
      if (result) mapped.push(result);
    } catch {
      continue;
    }
  }

  if (mapped.length === 0) {
    return placeholderProjects;
  }

  mapped.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    if (a.project.year !== b.project.year) return b.project.year - a.project.year;
    return a.project.title.localeCompare(b.project.title, "en", { sensitivity: "base" });
  });

  const projects = mapped.map((entry) => entry.project);
  const indexBySlug = new Map(projects.map((project) => [project.slug, project]));

  for (const project of projects) {
    const explicitRelated = project.related
      .filter((slug) => slug !== project.slug)
      .filter((slug) => indexBySlug.has(slug));

    if (explicitRelated.length > 0) {
      project.related = unique(explicitRelated).slice(0, 4);
      continue;
    }

    project.related = projects
      .filter((candidate) => candidate.slug !== project.slug && candidate.category === project.category)
      .slice(0, 4)
      .map((candidate) => candidate.slug);
  }

  return projects;
});

export const loadPortfolioProjectBySlug = cache(async (slug: string): Promise<PlaceholderProject | undefined> => {
  const projects = await loadPortfolioProjects();
  return projects.find((project) => project.slug === slug);
});

export function categoriesForProjects(projects: PlaceholderProject[]): string[] {
  const available = practiceCategories.filter((category) => projects.some((project) => project.category === category));
  return ["All Works", ...available];
}
