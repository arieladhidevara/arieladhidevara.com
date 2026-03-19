import { promises as fs } from "node:fs";
import path from "node:path";
import { uploadProjectAssets } from "./upload-assets";

const INBOX_ROOT = path.resolve("project-inbox");
const ASSETS_ROOT = path.resolve("assets-local");
const CONTENT_ROOT = path.resolve("content/projects");

const SECTION_FOLDERS = ["thumbnails", "overview", "background", "concept", "the-project", "process", "reflection", "documentation"] as const;
const LEGACY_ASSET_FOLDERS = ["videos", "images", "scripts", "models", "documents"] as const;
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const VIDEO_EXT = new Set([".mp4", ".mov", ".mkv", ".webm", ".m4v"]);
const MODEL_EXT = new Set([".glb", ".gltf", ".obj", ".fbx", ".stl", ".ply", ".3dm", ".step", ".stp"]);
const SCRIPT_EXT = new Set([".js", ".ts", ".jsx", ".tsx", ".py", ".cs", ".json", ".html", ".css", ".shader", ".hlsl", ".glsl", ".wasm", ".gz", ".data"]);
const DOC_EXT = new Set([".pdf", ".txt", ".md", ".doc", ".docx", ".rtf", ".csv", ".xlsx", ".xls", ".ppt", ".pptx"]);
const RESERVED_INBOX = new Set(["project.txt", "meta.json"]);
const IGNORE_FILES = new Set(["thumbs.db", ".ds_store", "desktop.ini"]);
const CATEGORIES = ["Interactive Systems", "AI & Software", "Spatial & Architectural Design", "Objects & Product", "Visual & Media"] as const;
const FIELD_MAP: Record<string, string> = {
  TITLE: "title",
  YEAR: "year",
  CATEGORY: "category",
  TYPE: "type",
  TAGS: "tags",
  ONELINER: "oneLiner",
  OVERVIEW: "overview",
  BACKGROUND: "background",
  CONCEPT: "concept",
  THEPROJECT: "theProject",
  PROCESS: "process",
  REFLECTION: "reflectionImpact",
  IMPACT: "reflectionImpact",
  REFLECTIONIMPACT: "reflectionImpact",
  DOCUMENTATION: "documentation",
  SUMMARY: "summary",
  CONTEXT: "background",
  CHALLENGE: "concept",
  APPROACH: "process",
  OUTCOME: "reflectionImpact",
  MYROLE: "roles",
  ROLE: "roles",
  ROLES: "roles",
  TOOLS: "tools",
};

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

type SectionFolder = (typeof SECTION_FOLDERS)[number];
 type LegacyAssetFolder = (typeof LEGACY_ASSET_FOLDERS)[number];
 type PracticeCategory = (typeof CATEGORIES)[number];
 type AssetKind = "image" | "video" | "script" | "model" | "document" | "other";
 type AssetRole = "cover" | "card" | "demo" | "teaser" | "none";
 type SequentialNameKey = "image" | "video" | "script" | "model" | "document" | "asset";
 type ProcessOptions = { uploadAssets?: boolean; writeOutput?: boolean };
 type UploadSummary = { attempted: boolean; success: boolean; uploadedCount: number; skippedCount: number; failedReason?: string };
 type ProjectSections = {
   overview: string;
   background: string;
   concept: string;
   theProject: string;
   process: string;
   reflectionImpact: string;
   documentation: string;
 };
 type ProjectAssets = { videos: string[]; images: string[]; scripts: string[]; models: string[]; documents: string[] };
 type ProjectAssetsBySection = Record<SectionFolder, string[]>;
 type MediaFile = { fileName: string; relative: string; normalized: string; section: SectionFolder; kind: AssetKind };
 type PortfolioProject = {
   slug: string;
   title: string;
   year: number;
   category: PracticeCategory;
   type: string;
   tags: string[];
   summaryShort: string;
   summaryMedium: string;
   summaryLong: string;
   sections: ProjectSections;
   roles: string[];
   tools: string[];
   heroImage: string;
   coverImage: string;
   cardImage: string;
   primaryVideo: string;
   primaryMedia: string;
   gallery: string[];
   galleryImages: string[];
   videos: string[];
   assets: ProjectAssets;
   assetsBySection: ProjectAssetsBySection;
   relatedProjects: string[];
   seoTitle: string;
   seoDescription: string;
   openGraphImage: string;
   socialPreviewText: string;
   featured: boolean;
   status: "draft" | "published";
   order: number;
   source: { projectTxt: string; metaJson: string | null };
   upload: UploadSummary;
 };
 type ProcessResult = { project: PortfolioProject; report: { slug: string; category: PracticeCategory; outputPath: string; heroImage: string; cardImage: string; primaryVideo: string; gallerySize: number; tags: string[]; relatedProjects: string[] } };
 
 type NamingState = { counters: Record<SectionFolder, Record<SequentialNameKey, number>> };
 
 const LEGACY_FOLDER_TO_SECTION: Record<LegacyAssetFolder, SectionFolder> = {
   videos: "the-project",
   images: "overview",
   scripts: "documentation",
   models: "documentation",
   documents: "documentation",
 };
 
 const SECTION_ALIASES: Record<SectionFolder, string[]> = {
   thumbnails: ["thumbnails", "thumbnail", "thumb", "thumbs", "cover", "card"],
   overview: ["overview", "intro", "introduction"],
   background: ["background", "context"],
   concept: ["concept", "challenge"],
   "the-project": ["the-project", "the project", "project", "theproject"],
   process: ["process", "workflow", "development", "iteration"],
   reflection: ["reflection", "impact", "outcome"],
   documentation: ["documentation", "documents", "document", "docs", "doc"],
 };

const norm = (v: string) => v.replace(/\s+/g, " ").trim();
const sentence = (v: string) => { const x = norm(v); return x ? (/[.!?]$/.test(x) ? x : `${x}.`) : ""; };
const list = (v?: string) => (v ? v.split(/[,;|\n]/g).map((x) => norm(x)).filter(Boolean) : []);
const uniq = (arr: string[]) => { const s = new Set<string>(); const o: string[] = []; for (const i of arr) { const k = i.toLowerCase(); if (!k || s.has(k)) continue; s.add(k); o.push(i); } return o; };
const slugTitle = (slug: string) => slug.split(/[-_]/g).filter(Boolean).map((p) => p[0].toUpperCase() + p.slice(1)).join(" ");
const toPosix = (v: string) => v.replace(/\\/g, "/");
const mediaPath = (slug: string, rel: string) => `${slug}/${toPosix(rel)}`;
const stripExt = (v: string) => v.replace(/\.[^/.]+$/, "");
const isCategory = (v: string): v is PracticeCategory => CATEGORIES.includes(v as PracticeCategory);
const status = (v?: string): "draft" | "published" => (v?.toLowerCase() === "published" ? "published" : "draft");
const trunc = (v: string, n: number) => (norm(v).length <= n ? norm(v) : `${norm(v).slice(0, n - 3).trimEnd()}...`);

async function exists(p: string): Promise<boolean> { try { await fs.access(p); return true; } catch { return false; } }
async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full))); else out.push(full);
  }
  return out;
}

function parseProjectText(raw: string): { fields: Record<string, string>; narrative: string } {
  const fields: Record<string, string> = {};
  const narrative: string[] = [];
  const lines = raw.split(/\r?\n/);
  let active: string | null = null;

  for (const line of lines) {
    const m = line.match(/^([A-Za-z][A-Za-z0-9 _\/-]{0,60}):\s*(.*)$/);
    if (m) {
      const key = FIELD_MAP[m[1].toUpperCase().replace(/[^A-Z0-9]/g, "")];
      if (key) { fields[key] = fields[key] ? `${fields[key]} ${m[2]}`.trim() : m[2].trim(); active = key; continue; }
    }

    const t = line.trim();
    if (active && t) { fields[active] = fields[active] ? `${fields[active]} ${t}`.trim() : t; continue; }
    if (t) narrative.push(t);
    if (!t) active = null;
  }

  return { fields, narrative: norm(narrative.join(" ")) };
}

async function readMetaJson(projectDir: string): Promise<Record<string, unknown>> {
  const p = path.join(projectDir, "meta.json");
  if (!(await exists(p))) return {};
  try {
    const v = JSON.parse(await fs.readFile(p, "utf8")) as unknown;
    if (!v || typeof v !== "object" || Array.isArray(v)) return {};
    return v as Record<string, unknown>;
  } catch { return {}; }
}

const metaString = (meta: Record<string, unknown>, ...keys: string[]) => {
  for (const k of keys) { const v = meta[k]; if (typeof v === "string" && v.trim()) return v.trim(); }
  return "";
};
const metaNumber = (meta: Record<string, unknown>, ...keys: string[]) => {
  for (const k of keys) { const v = meta[k]; if (typeof v === "number" && Number.isFinite(v)) return v; if (typeof v === "string") { const n = Number(v); if (Number.isFinite(n)) return n; } }
  return null;
};
const metaArray = (meta: Record<string, unknown>, ...keys: string[]) => {
  for (const k of keys) { const v = meta[k]; if (Array.isArray(v)) return v.map((x) => norm(String(x))).filter(Boolean); if (typeof v === "string") { const a = list(v); if (a.length) return a; } }
  return [] as string[];
};

function inferYear(fieldYear: string, metaYear: number | null, text: string): number {
  const p = Number(fieldYear); if (Number.isFinite(p) && p >= 1900 && p <= 3000) return Math.floor(p);
  if (metaYear !== null && metaYear >= 1900 && metaYear <= 3000) return Math.floor(metaYear);
  const years = (text.match(/\b(19|20)\d{2}\b/g) ?? []).map((y) => Number(y)).filter(Number.isFinite);
  return years.length ? Math.max(...years) : new Date().getFullYear();
}

function inferType(fieldType: string, metaType: string, text: string): string {
  if (fieldType) return fieldType;
  if (metaType) return metaType;
  const l = text.toLowerCase();
  if (/(interactive|installation|sensor|projection)/.test(l)) return "Interactive Installation";
  if (/(ai|software|agent|platform|web|app)/.test(l)) return "Software Project";
  if (/(architecture|spatial|urban|pavilion)/.test(l)) return "Spatial Design Project";
  if (/(product|wearable|device|hardware)/.test(l)) return "Product Concept";
  return "Creative Technology Project";
}

function inferCategory(params: { explicit: string; type: string; tags: string[]; tools: string[]; text: string }): PracticeCategory {
  if (params.explicit && isCategory(params.explicit)) return params.explicit;
  const l = `${params.type} ${params.tags.join(" ")} ${params.tools.join(" ")} ${params.text}`.toLowerCase();
  if (/(sensor|installation|projection|interactive|embodied)/.test(l)) return "Interactive Systems";
  if (/(ai|software|agent|api|platform|frontend|backend)/.test(l)) return "AI & Software";
  if (/(architecture|spatial|urban|pavilion|exhibition)/.test(l)) return "Spatial & Architectural Design";
  if (/(product|wearable|device|hardware)/.test(l)) return "Objects & Product";
  return "Visual & Media";
}

function inferKind(ext: string): AssetKind {
  if (IMAGE_EXT.has(ext)) return "image";
  if (VIDEO_EXT.has(ext)) return "video";
  if (MODEL_EXT.has(ext)) return "model";
  if (SCRIPT_EXT.has(ext)) return "script";
  if (DOC_EXT.has(ext)) return "document";
  return "other";
}

const normalizeKey = (v: string) => v.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
 
 const SECTION_KEY_LOOKUP = (() => {
   const map = new Map<string, SectionFolder>();
   for (const section of SECTION_FOLDERS) {
     map.set(normalizeKey(section), section);
     for (const alias of SECTION_ALIASES[section]) map.set(normalizeKey(alias), section);
   }
   return map;
 })();
 
 const LEGACY_KEY_LOOKUP = (() => {
   const map = new Map<string, LegacyAssetFolder>();
   for (const folder of LEGACY_ASSET_FOLDERS) {
     map.set(normalizeKey(folder), folder);
     if (folder.endsWith("s")) map.set(normalizeKey(folder.slice(0, -1)), folder);
   }
   return map;
 })();
 
 function resolveSectionFromSegment(segment: string): SectionFolder | null {
   return SECTION_KEY_LOOKUP.get(normalizeKey(segment)) ?? null;
 }
 
 function resolveLegacyFolderFromSegment(segment: string): LegacyAssetFolder | null {
   return LEGACY_KEY_LOOKUP.get(normalizeKey(segment)) ?? null;
 }
 
 function inferSection(rel: string, kind: AssetKind, role: AssetRole): SectionFolder {
   const segments = toPosix(rel).split("/").filter(Boolean);
 
   for (let i = 0; i < segments.length; i += 1) {
     if (normalizeKey(segments[i]) !== "assets") continue;
     const nestedSection = segments[i + 1] ? resolveSectionFromSegment(segments[i + 1]) : null;
     if (nestedSection) return nestedSection;
   }
 
   for (const segment of segments) {
     const section = resolveSectionFromSegment(segment);
     if (section) return section;
   }
 
   for (const segment of segments) {
     const legacyFolder = resolveLegacyFolderFromSegment(segment);
     if (!legacyFolder) continue;
     if (role === "cover" || role === "card") return "thumbnails";
     return LEGACY_FOLDER_TO_SECTION[legacyFolder];
   }
 
   if (role === "cover" || role === "card") return "thumbnails";
   if (role === "demo" || role === "teaser") return "the-project";
   if (kind === "image") return "overview";
   if (kind === "video") return "the-project";
   return "documentation";
 }
 
 function inferRole(stem: string, kind: AssetKind): AssetRole {
   if (kind === "image") {
     if (/(^|[-_\s])(cover|hero|key|main)([-_\s]|$)/.test(stem)) return "cover";
     if (/(^|[-_\s])(card|thumb|thumbnail|listing|preview)([-_\s]|$)/.test(stem)) return "card";
   }
   if (kind === "video") {
     if (/(^|[-_\s])(demo|main)([-_\s]|$)/.test(stem)) return "demo";
     if (/(^|[-_\s])(teaser|trailer|preview|short)([-_\s]|$)/.test(stem)) return "teaser";
   }
   return "none";
 }
 
 function countersDefault(): Record<SectionFolder, Record<SequentialNameKey, number>> {
   const counters = {} as Record<SectionFolder, Record<SequentialNameKey, number>>;
   for (const section of SECTION_FOLDERS) {
     counters[section] = { image: 1, video: 1, script: 1, model: 1, document: 1, asset: 1 };
   }
   return counters;
 }
 
 function seqBase(kind: SequentialNameKey, index: number): string {
   const padded = String(index).padStart(2, "0");
   if (kind === "image") return "image-" + padded;
   if (kind === "video") return "video-" + padded;
   if (kind === "script") return "script-" + padded;
   if (kind === "model") return "model-" + padded;
   if (kind === "document") return "document-" + padded;
   return "asset-" + padded;
 }
 
 function keyForKind(kind: AssetKind): SequentialNameKey {
   if (kind === "image") return "image";
   if (kind === "video") return "video";
   if (kind === "script") return "script";
   if (kind === "model") return "model";
   if (kind === "document") return "document";
   return "asset";
 }
 
 async function loadState(destRoot: string): Promise<NamingState> {
   const state: NamingState = { counters: countersDefault() };
   if (!(await exists(destRoot))) return state;
 
   for (const filePath of await walk(destRoot)) {
     const rel = toPosix(path.relative(destRoot, filePath));
     const [first] = rel.split("/");
     const section = first ? resolveSectionFromSegment(first) : null;
     if (!section) continue;
 
     const stem = path.parse(filePath).name.toLowerCase();
     const match = stem.match(/^(image|video|script|model|document|asset)-(\d+)$/);
     if (!match) continue;
 
     const kind = match[1] as SequentialNameKey;
     const value = Number(match[2]);
     if (!Number.isFinite(value)) continue;
     if (value >= state.counters[section][kind]) {
       state.counters[section][kind] = value + 1;
     }
   }
 
   return state;
 }
 
 const nextName = (section: SectionFolder, kind: SequentialNameKey, state: NamingState) => {
   const current = state.counters[section][kind];
   state.counters[section][kind] += 1;
   return seqBase(kind, current);
 };

async function listInboxFiles(projectDir: string): Promise<string[]> {
  return (await walk(projectDir))
    .filter((filePath) => {
      const rel = toPosix(path.relative(projectDir, filePath));
      const base = path.basename(rel).toLowerCase();
      if (IGNORE_FILES.has(base)) return false;
      if (!rel.includes("/") && RESERVED_INBOX.has(base)) return false;
      return true;
    })
    .sort((a, b) => collator.compare(toPosix(path.relative(projectDir, a)), toPosix(path.relative(projectDir, b))));
}

async function resolvePath(destRoot: string, folder: SectionFolder, baseName: string, ext: string, replaceIfExists: boolean): Promise<string> {
  const out = path.join(destRoot, folder, `${baseName}${ext || ".bin"}`);
  await fs.mkdir(path.dirname(out), { recursive: true });

  if (replaceIfExists) {
    const entries = await fs.readdir(path.join(destRoot, folder), { withFileTypes: true });
    for (const e of entries) {
      if (!e.isFile()) continue;
      if (path.parse(e.name).name.toLowerCase() !== baseName.toLowerCase()) continue;
      await fs.rm(path.join(destRoot, folder, e.name), { force: true });
    }
    return out;
  }

  if (!(await exists(out))) return out;
  let i = 2;
  while (true) {
    const c = path.join(destRoot, folder, `${baseName}-${String(i).padStart(2, "0")}${ext || ".bin"}`);
    if (!(await exists(c))) return c;
    i += 1;
  }
}

function sanitizePathSegment(value: string): string {
   const cleaned = value.replace(/[<>:"|?*]/g, "").trim();
   return cleaned || "asset";
 }
 
 function extractTailSegments(rel: string, section: SectionFolder): string[] {
   const segments = toPosix(rel).split("/").filter(Boolean);
   if (segments.length === 0) return [];
 
   for (let i = 0; i < segments.length; i += 1) {
     if (normalizeKey(segments[i]) !== "assets") continue;
     const nestedSection = segments[i + 1] ? resolveSectionFromSegment(segments[i + 1]) : null;
     if (nestedSection === section) return segments.slice(i + 2);
   }
 
   for (let i = 0; i < segments.length; i += 1) {
     const directSection = resolveSectionFromSegment(segments[i]);
     if (directSection === section) return segments.slice(i + 1);
   }
 
   if (normalizeKey(segments[0]) === "assets" && segments[1]) {
     const nestedLegacy = resolveLegacyFolderFromSegment(segments[1]);
     if (nestedLegacy) return segments.slice(2);
   }
 
   const legacyRoot = resolveLegacyFolderFromSegment(segments[0]);
   if (legacyRoot) return segments.slice(1);
 
   return [segments[segments.length - 1]];
 }
 
 async function resolveNestedPath(destRoot: string, section: SectionFolder, tailSegments: string[], replaceIfExists: boolean): Promise<string> {
   const sanitizedTail = tailSegments.map((segment) => sanitizePathSegment(segment)).filter(Boolean);
   const candidateFile = sanitizedTail.pop() ?? "asset.bin";
   const parsed = path.parse(candidateFile);
   const fileBase = sanitizePathSegment(parsed.name || "asset");
   const ext = parsed.ext || ".bin";
   const dir = path.join(destRoot, section, ...sanitizedTail);
   await fs.mkdir(dir, { recursive: true });
 
   if (replaceIfExists) {
     const entries = await fs.readdir(dir, { withFileTypes: true });
     for (const entry of entries) {
       if (!entry.isFile()) continue;
       if (path.parse(entry.name).name.toLowerCase() !== fileBase.toLowerCase()) continue;
       await fs.rm(path.join(dir, entry.name), { force: true });
     }
     return path.join(dir, fileBase + ext);
   }
 
   const preferred = path.join(dir, fileBase + ext);
   if (!(await exists(preferred))) return preferred;
 
   let suffix = 2;
   while (true) {
     const collisionSafe = path.join(dir, fileBase + "-" + String(suffix).padStart(2, "0") + ext);
     if (!(await exists(collisionSafe))) return collisionSafe;
     suffix += 1;
   }
 }
 
 function documentationBucket(kind: AssetKind): string {
   if (kind === "script") return "scripts";
   if (kind === "model") return "models";
   return "documents";
 }
 
 async function migrateLegacyAssetsToSections(destRoot: string): Promise<void> {
   for (const legacyFolder of LEGACY_ASSET_FOLDERS) {
     const legacyRoot = path.join(destRoot, legacyFolder);
     if (!(await exists(legacyRoot))) continue;
 
     const legacyFiles = (await walk(legacyRoot)).sort((a, b) => collator.compare(toPosix(a), toPosix(b)));
     for (const sourcePath of legacyFiles) {
       const relInLegacy = toPosix(path.relative(legacyRoot, sourcePath));
       const ext = path.extname(sourcePath).toLowerCase();
       const stem = path.parse(sourcePath).name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "asset";
       const kind = inferKind(ext);
       const role = inferRole(stem, kind);
       const defaultSection = LEGACY_FOLDER_TO_SECTION[legacyFolder];
 
       let destination = "";
       if (role === "cover" || role === "card") {
         destination = await resolvePath(destRoot, "thumbnails", role, ext, true);
       } else if (role === "demo" || role === "teaser") {
         destination = await resolvePath(destRoot, "the-project", role, ext, true);
       } else if (legacyFolder === "scripts" || legacyFolder === "models" || legacyFolder === "documents") {
         destination = await resolveNestedPath(destRoot, defaultSection, [legacyFolder, ...relInLegacy.split("/").filter(Boolean)], false);
       } else {
         destination = await resolveNestedPath(destRoot, defaultSection, relInLegacy.split("/").filter(Boolean), false);
       }
 
       await moveFile(sourcePath, destination);
     }
 
     await fs.rm(legacyRoot, { recursive: true, force: true });
   }
 }
 
 async function moveFile(src: string, dst: string): Promise<void> {
  if (path.resolve(src).toLowerCase() === path.resolve(dst).toLowerCase()) return;
  await fs.mkdir(path.dirname(dst), { recursive: true });
  try { await fs.rename(src, dst); } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "EXDEV") throw error;
    await fs.copyFile(src, dst);
    await fs.unlink(src);
  }
}

async function cleanupEmptyDirs(rootDir: string, current: string = rootDir): Promise<boolean> {
  const entries = await fs.readdir(current, { withFileTypes: true });
  let hasContent = false;
  for (const e of entries) {
    const full = path.join(current, e.name);
    if (e.isDirectory()) {
      const child = await cleanupEmptyDirs(rootDir, full);
      if (!child) await fs.rmdir(full); else hasContent = true;
      continue;
    }
    const isRootControl = current === rootDir && RESERVED_INBOX.has(e.name.toLowerCase());
    if (!isRootControl) hasContent = true;
  }
  return hasContent;
}

async function syncToAssetsLocal(slug: string, projectDir: string): Promise<void> {
   const destRoot = path.join(ASSETS_ROOT, slug);
   await fs.mkdir(destRoot, { recursive: true });
   await migrateLegacyAssetsToSections(destRoot);
   const state = await loadState(destRoot);
 
   for (const sourcePath of await listInboxFiles(projectDir)) {
     const rel = toPosix(path.relative(projectDir, sourcePath));
     const ext = path.extname(sourcePath).toLowerCase();
     const stem = path.parse(sourcePath).name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "asset";
     const kind = inferKind(ext);
     const role = inferRole(stem, kind);
     const inferredSection = inferSection(rel, kind, role);
 
     let destination = "";
 
     if (role === "cover" || role === "card") {
       destination = await resolvePath(destRoot, "thumbnails", role, ext, true);
     } else if (role === "demo" || role === "teaser") {
       const targetSection = inferredSection === "thumbnails" ? "the-project" : inferredSection;
       destination = await resolvePath(destRoot, targetSection, role, ext, true);
     } else if (kind === "script" || kind === "model" || kind === "document") {
       const tail = extractTailSegments(rel, inferredSection);
       const resolvedTail = tail.length > 0 ? tail : [path.basename(sourcePath)];
       if (inferredSection === "documentation") {
         const bucket = documentationBucket(kind);
         const firstTail = resolvedTail[0] ? normalizeKey(resolvedTail[0]) : "";
         if (firstTail !== normalizeKey(bucket)) {
           resolvedTail.unshift(bucket);
         }
       }
       destination = await resolveNestedPath(destRoot, inferredSection, resolvedTail, false);
     } else {
       const baseName = nextName(inferredSection, keyForKind(kind), state);
       destination = await resolvePath(destRoot, inferredSection, baseName, ext, false);
     }
 
     await moveFile(sourcePath, destination);
   }
 
   await cleanupEmptyDirs(projectDir);
 }
 
 function assetBucketFromPath(rel: string, kind: AssetKind): keyof ProjectAssets {
   const lower = rel.toLowerCase();
   if (/(^|\/)documentation\/scripts(\/|$)/.test(lower) || /(^|\/)scripts(\/|$)/.test(lower)) return "scripts";
   if (/(^|\/)documentation\/models(\/|$)/.test(lower) || /(^|\/)models(\/|$)/.test(lower)) return "models";
   if (/(^|\/)documentation\/(documents|docs)(\/|$)/.test(lower) || /(^|\/)(documents|docs)(\/|$)/.test(lower)) return "documents";
   if (kind === "image") return "images";
   if (kind === "video") return "videos";
   if (kind === "script") return "scripts";
   if (kind === "model") return "models";
   return "documents";
 }
 
 function createSectionAssets(): ProjectAssetsBySection {
   const bySection = {} as ProjectAssetsBySection;
   for (const section of SECTION_FOLDERS) bySection[section] = [];
   return bySection;
 }
 
 async function scanAssets(slug: string): Promise<{ images: MediaFile[]; videos: MediaFile[]; assets: ProjectAssets; assetsBySection: ProjectAssetsBySection }> {
   const projectDir = path.join(ASSETS_ROOT, slug);
   const images: MediaFile[] = [];
   const videos: MediaFile[] = [];
   const assets: ProjectAssets = { videos: [], images: [], scripts: [], models: [], documents: [] };
   const assetsBySection = createSectionAssets();
   if (!(await exists(projectDir))) return { images, videos, assets, assetsBySection };
 
   for (const filePath of await walk(projectDir)) {
     const rel = toPosix(path.relative(projectDir, filePath));
     const base = path.basename(rel).toLowerCase();
     if (IGNORE_FILES.has(base)) continue;
 
     const ext = path.extname(filePath).toLowerCase();
     const kind = inferKind(ext);
     const stem = path.parse(filePath).name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "asset";
     const role = inferRole(stem, kind);
     const section = inferSection(rel, kind, role);
     const normalized = mediaPath(slug, rel);
     const bucket = assetBucketFromPath(rel, kind);
 
     assetsBySection[section].push(normalized);
     assets[bucket].push(normalized);
 
     const mediaFile: MediaFile = { fileName: path.basename(filePath), relative: rel, normalized, section, kind };
 
     if (bucket === "images") {
       images.push(mediaFile);
       continue;
     }
     if (bucket === "videos") {
       videos.push(mediaFile);
       continue;
     }
   }
 
   images.sort((a, b) => collator.compare(a.relative, b.relative));
   videos.sort((a, b) => collator.compare(a.relative, b.relative));
   assets.videos.sort((a, b) => collator.compare(a, b));
   assets.images.sort((a, b) => collator.compare(a, b));
   assets.scripts.sort((a, b) => collator.compare(a, b));
   assets.models.sort((a, b) => collator.compare(a, b));
   assets.documents.sort((a, b) => collator.compare(a, b));
   for (const section of SECTION_FOLDERS) assetsBySection[section].sort((a, b) => collator.compare(a, b));
 
   return { images, videos, assets, assetsBySection };
 }

function chooseByPriority(files: MediaFile[], priorities: string[]): MediaFile | null {
  for (const p of priorities) {
    const low = p.toLowerCase();
    const exact = files.find((f) => stripExt(f.relative).toLowerCase() === low);
    if (exact) return exact;
    const pref = files.find((f) => stripExt(f.relative).toLowerCase().startsWith(low));
    if (pref) return pref;
  }
  return null;
}

const pickHero = (images: MediaFile[]) => chooseByPriority(images, ["thumbnails/cover", "thumbnails/hero", "overview/cover", "images/cover", "overview/image-01", "images/image-01"])?.normalized ?? images[0]?.normalized ?? "";
const pickCard = (images: MediaFile[]) => chooseByPriority(images, ["thumbnails/card", "thumbnails/cover", "images/card", "images/cover"])?.normalized ?? images[0]?.normalized ?? "";
const pickDemo = (videos: MediaFile[]) => chooseByPriority(videos, ["the-project/demo", "overview/demo", "videos/demo", "the-project/teaser", "videos/teaser", "the-project/video-01", "videos/video-01"])?.normalized ?? videos[0]?.normalized ?? "";
const buildGallery = (images: MediaFile[]) =>
  images
    .filter((item) => !/(^|\/)(thumbnails|images)\/(cover|card)\.[^\/]+$/i.test(item.relative))
    .map((item) => item.normalized);

function buildSections(params: {
  title: string; oneLiner: string; summary: string; overview: string; background: string; concept: string; theProject: string; process: string; reflectionImpact: string; documentation: string; narrative: string; roles: string[]; tools: string[];
}): ProjectSections {
  const s = params.narrative ? params.narrative.split(/(?<=[.!?])\s+/).map((x) => sentence(x)).filter(Boolean) : [];
  return {
    overview: sentence(params.overview || params.summary || params.oneLiner || `${params.title} explores a clear narrative direction.`),
    background: sentence(params.background || s[0] || `Background context for ${params.title}.`),
    concept: sentence(params.concept || s[1] || "The concept defines the project intent and framework."),
    theProject: sentence(params.theProject || params.summary || params.oneLiner || `${params.title} is presented as a complete project case study.`),
    process: sentence(params.process || s[2] || "Process documentation captures iteration and implementation milestones."),
    reflectionImpact: sentence(params.reflectionImpact || s[3] || "The project demonstrates clear outcomes and impact."),
    documentation: sentence(params.documentation || `Produced by ${params.roles.join(", ") || "the project team"} using ${params.tools.join(", ") || "a multidisciplinary toolkit"}.`),
  };
}

function summarize(sections: ProjectSections) {
  const short = sentence(sections.overview);
  const medium = [sections.overview, sections.background, sections.concept].map(sentence).filter(Boolean).slice(0, 3).join(" ");
  const long = [sections.overview, sections.background, sections.concept, sections.theProject, sections.process, sections.reflectionImpact].map(sentence).filter(Boolean).join(" ");
  return { summaryShort: short, summaryMedium: medium || short, summaryLong: long || medium || short };
}

function generateTags(params: { explicitTags: string[]; type: string; tools: string[]; text: string }): string[] {
  const tags = [...params.explicitTags, params.type];
  const l = params.text.toLowerCase();
  if (/(interactive|sensor|realtime)/.test(l)) tags.push("Interactive");
  if (/(ai|machine learning|llm|gpt)/.test(l)) tags.push("AI");
  if (/(xr|vr|ar|webgl|unity)/.test(l)) tags.push("XR");
  if (/(architecture|spatial|urban)/.test(l)) tags.push("Architecture");
  if (/(motion|video|cinematic)/.test(l)) tags.push("Motion");
  for (const t of params.tools) {
    const lt = t.toLowerCase();
    if (/touchdesigner|unity|unreal/.test(lt)) tags.push("Real-Time");
    if (/blender|rhino|maya/.test(lt)) tags.push("3D");
    if (/python|typescript|javascript/.test(lt)) tags.push("Creative Coding");
  }
  return uniq(tags).slice(0, 10);
}

function overlap(a: Set<string>, b: Set<string>): number { let c = 0; for (const i of a) if (b.has(i)) c += 1; return c; }

async function findRelated(current: { slug: string; category: PracticeCategory; type: string; tags: string[] }): Promise<string[]> {
  if (!(await exists(CONTENT_ROOT))) return [];
  const tagSet = new Set(current.tags.map((t) => t.toLowerCase()));
  const scores: Array<{ slug: string; score: number }> = [];

  for (const e of await fs.readdir(CONTENT_ROOT, { withFileTypes: true })) {
    if (!e.isFile() || path.extname(e.name).toLowerCase() !== ".json") continue;
    const fp = path.join(CONTENT_ROOT, e.name);
    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(await fs.readFile(fp, "utf8")) as Record<string, unknown>; } catch { continue; }
    const slug = typeof parsed.slug === "string" ? parsed.slug : path.basename(e.name, ".json");
    if (!slug || slug === current.slug) continue;

    const cat = typeof parsed.category === "string" && isCategory(parsed.category) ? parsed.category : null;
    const type = typeof parsed.type === "string" ? parsed.type : "";
    const tags = Array.isArray(parsed.tags) ? parsed.tags.map((x) => String(x).toLowerCase()).filter(Boolean) : [];

    const score = (cat === current.category ? 4 : 0) + (type.toLowerCase() === current.type.toLowerCase() ? 3 : 0) + overlap(tagSet, new Set(tags)) * 2;
    if (score > 0) scores.push({ slug, score });
  }

  return scores.sort((a, b) => (b.score !== a.score ? b.score - a.score : collator.compare(a.slug, b.slug))).slice(0, 4).map((x) => x.slug);
}

function validateProject(project: PortfolioProject): PortfolioProject {
  const fallbackTitle = project.title || slugTitle(project.slug);
  const fallbackSummary = project.summaryShort || sentence(`${fallbackTitle} is a ${project.type.toLowerCase()}.`);
  return {
    ...project,
    title: fallbackTitle,
    year: Number.isFinite(project.year) ? project.year : new Date().getFullYear(),
    category: isCategory(project.category) ? project.category : "AI & Software",
    type: project.type || "Creative Technology Project",
    tags: uniq(project.tags).slice(0, 10),
    summaryShort: fallbackSummary,
    summaryMedium: project.summaryMedium || fallbackSummary,
    summaryLong: project.summaryLong || project.summaryMedium || fallbackSummary,
    sections: {
      overview: project.sections.overview || fallbackSummary,
      background: project.sections.background || sentence("Background section pending."),
      concept: project.sections.concept || sentence("Concept section pending."),
      theProject: project.sections.theProject || fallbackSummary,
      process: project.sections.process || sentence("Process section pending."),
      reflectionImpact: project.sections.reflectionImpact || sentence("Reflection section pending."),
      documentation: project.sections.documentation || sentence("Documentation section pending."),
    },
  };
}

export async function processProject(input: string, options: ProcessOptions = {}): Promise<ProcessResult> {
  const cleaned = input.trim().replace(/^['\"]|['\"]$/g, "");
  const normalized = cleaned.replace(/\\/g, "/").replace(/\/+$/, "");
  const marker = "project-inbox/";
  const idx = normalized.toLowerCase().indexOf(marker);
  const slug = idx >= 0 ? normalized.slice(idx + marker.length).split("/")[0].trim() : normalized.split("/").filter(Boolean).pop() || "";

  if (!slug) throw new Error("Usage: ts-node scripts/process-project.ts <project-slug|project-inbox/<slug>> [--upload]");

  const projectDir = path.join(INBOX_ROOT, slug);
  if (!(await exists(projectDir))) throw new Error(`Project folder not found: ${projectDir}`);

  const projectTxtPath = path.join(projectDir, "project.txt");
  if (!(await exists(projectTxtPath))) throw new Error(`Missing project description: ${projectTxtPath}`);

  const raw = await fs.readFile(projectTxtPath, "utf8");
  const parsed = parseProjectText(raw);
  const fields = parsed.fields;
  const meta = await readMetaJson(projectDir);

  const title = fields.title || metaString(meta, "title") || slugTitle(slug);
  const year = inferYear(fields.year || "", metaNumber(meta, "year"), `${raw}\n${JSON.stringify(meta)}`);
  const type = inferType(fields.type || "", metaString(meta, "type"), `${raw}\n${JSON.stringify(meta)}`);
  const roles = uniq([...list(fields.roles), ...metaArray(meta, "roles", "myRole")]);
  const tools = uniq([...list(fields.tools), ...metaArray(meta, "tools")]);
  const explicitTags = uniq([...list(fields.tags), ...metaArray(meta, "tags")]);

  const sections = buildSections({
    title,
    oneLiner: fields.oneLiner || "",
    summary: fields.summary || "",
    overview: fields.overview || "",
    background: fields.background || "",
    concept: fields.concept || "",
    theProject: fields.theProject || "",
    process: fields.process || "",
    reflectionImpact: fields.reflectionImpact || "",
    documentation: fields.documentation || "",
    narrative: parsed.narrative,
    roles,
    tools,
  });
  const summaries = summarize(sections);

  const inferenceText = [title, type, sections.overview, sections.background, sections.concept, sections.theProject, sections.process, sections.reflectionImpact, parsed.narrative, roles.join(" "), tools.join(" "), explicitTags.join(" ")].join(" ");
  const tags = generateTags({ explicitTags, type, tools, text: inferenceText });
  const category = inferCategory({ explicit: fields.category || metaString(meta, "category"), type, tags, tools, text: inferenceText });

  await syncToAssetsLocal(slug, projectDir);
  const scanned = await scanAssets(slug);
  const heroImage = pickHero(scanned.images);
  const cardImage = pickCard(scanned.images);
  const primaryVideo = pickDemo(scanned.videos);
  const gallery = buildGallery(scanned.images);
  const relatedProjects = await findRelated({ slug, category, type, tags });

  let upload: UploadSummary = { attempted: false, success: false, uploadedCount: 0, skippedCount: 0 };
  if (options.uploadAssets) {
    upload.attempted = true;
    try {
      const results = await uploadProjectAssets(slug);
      upload.success = true;
      upload.uploadedCount = results.filter((x) => x.uploaded).length;
      upload.skippedCount = results.filter((x) => !x.uploaded).length;
    } catch (error) {
      upload.success = false;
      upload.failedReason = error instanceof Error ? error.message : "Unknown upload error";
    }
  }

  const project = validateProject({
    slug,
    title,
    year,
    category,
    type,
    tags,
    summaryShort: summaries.summaryShort,
    summaryMedium: summaries.summaryMedium,
    summaryLong: summaries.summaryLong,
    sections,
    roles,
    tools,
    heroImage,
    coverImage: heroImage,
    cardImage,
    primaryVideo,
    primaryMedia: primaryVideo || heroImage,
    gallery,
    galleryImages: gallery,
    videos: scanned.assets.videos,
    assets: scanned.assets,
    assetsBySection: scanned.assetsBySection,
    relatedProjects,
    seoTitle: `${title} (${year}) | Ariel Adhidevara`,
    seoDescription: trunc(summaries.summaryShort, 155),
    openGraphImage: cardImage || heroImage,
    socialPreviewText: trunc(summaries.summaryMedium, 180),
    featured: typeof meta.featured === "boolean" ? meta.featured : false,
    status: status(metaString(meta, "status") || undefined),
    order: Math.max(0, Math.floor(metaNumber(meta, "order") ?? 0)),
    source: { projectTxt: `project-inbox/${slug}/project.txt`, metaJson: (await exists(path.join(projectDir, "meta.json"))) ? `project-inbox/${slug}/meta.json` : null },
    upload,
  });

  await fs.mkdir(CONTENT_ROOT, { recursive: true });
  const outputPath = path.join(CONTENT_ROOT, `${slug}.json`);
  if (options.writeOutput !== false) await fs.writeFile(outputPath, `${JSON.stringify(project, null, 2)}\n`, "utf8");

  return { project, report: { slug, category: project.category, outputPath, heroImage: project.heroImage, cardImage: project.cardImage, primaryVideo: project.primaryVideo, gallerySize: project.gallery.length, tags: project.tags, relatedProjects: project.relatedProjects } };
}

function parseCliArgs(argv: string[]): { input: string; uploadAssets: boolean } {
  const args = argv.slice(2);
  return { input: args.find((x) => x !== "--upload") ?? "", uploadAssets: args.includes("--upload") };
}

async function main(): Promise<void> {
  const { input, uploadAssets } = parseCliArgs(process.argv);
  if (!input) throw new Error("Usage: ts-node scripts/process-project.ts <project-slug|project-inbox/<slug>> [--upload]");
  const result = await processProject(input, { uploadAssets, writeOutput: true });

  console.log(`Project processed: ${result.report.slug}`);
  console.log(`Category selected: ${result.report.category}`);
  console.log(`Hero image selected: ${result.report.heroImage || "none"}`);
  console.log(`Card image selected: ${result.report.cardImage || "none"}`);
  console.log(`Primary video selected: ${result.report.primaryVideo || "none"}`);
  console.log(`Gallery size: ${result.report.gallerySize}`);
  console.log(`Tags generated: ${result.report.tags.join(", ")}`);
  console.log(`Related projects found: ${result.report.relatedProjects.length > 0 ? result.report.relatedProjects.join(", ") : "none"}`);

  if (result.project.upload.attempted) {
    if (result.project.upload.success) console.log(`Assets uploaded: ${result.project.upload.uploadedCount} uploaded, ${result.project.upload.skippedCount} skipped`);
    else console.log(`Assets upload failed: ${result.project.upload.failedReason || "Unknown error"}`);
  } else {
    console.log("Assets upload skipped (use --upload to enable Blob upload)");
  }

  console.log(`Output written: ${result.report.outputPath}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
