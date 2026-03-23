# AGENTS.md

## PROJECT PURPOSE
This repository powers Ariel Adhidevara's long-term portfolio website and project archive.
It is designed so agents can ingest new project folders, normalize project metadata, upload large media to Blob storage, and output structured project content for shared rendering templates.

## CORE RULES
- Never store large media files in Git.
- Use Blob storage for videos and high-resolution project images.
- Only lightweight UI assets belong in `public/`.
- Keep project ingestion deterministic and repeatable.
- During ingestion, move project media from `project-inbox/<slug>/` into `assets-local/<slug>/` (do not duplicate large files).
- Treat `AGENTS.md`, `docs/`, and `templates/` as the source of truth for conventions.

## PROJECT INTAKE WORKFLOW
When asked to process a new project:
1. Inspect `project-inbox/<project-slug>/`.
2. Read `project.txt` as the primary narrative source.
3. Scan all media recursively (even if folder placement is messy).
4. Move media into `assets-local/<project-slug>/` with normalized section folders (`thumbnails`, `overview`, `background`, `concept`, `the-project`, `process`, `reflection`, `documentation`).
5. If file names are ambiguous, rename deterministically (for example `image-01.jpg`, `image-02.jpg`, `video-01.mp4`).
6. Identify hero image (`cover`), card image (`card`), and primary video (`demo`) using naming rules + fallback selection.
7. Upload large media to Blob storage.
8. Mirror pathnames from local folder structure.
9. Generate structured project JSON.
10. Save JSON into `content/projects/<project-slug>.json`.
11. Ensure the project uses the shared template and design system.

## MEDIA NAMING CONVENTIONS
- `thumbnails/cover.jpg` -> hero image
- `thumbnails/card.jpg` -> listing thumbnail
- `the-project/demo.mp4` -> primary video
- `the-project/teaser.mp4` -> secondary video
- Ambiguous names should be auto-normalized to deterministic names (for example `image-01.jpg`, `video-01.mp4`).

## IMAGE NAMING
Use sequential and descriptive naming:
- `setup-01.jpg`
- `setup-02.jpg`
- `detail-01.jpg`
- `process-01.jpg`

## MEDIA PATH RULE
Local structure must mirror Blob pathnames.

Example:
`assets-local/unseen-realities/the-project/demo.mp4`
-> Blob pathname
`unseen-realities/the-project/demo.mp4`

## PROJECT PAGE NARRATIVE STRUCTURE
All project pages and project JSON should follow this section order:
1. Overview
2. Background
3. Concept
4. The Project
5. Process
6. Reflection / Impact
7. Documentation

## PUBLIC ASSET RULES
- `public/` is only for lightweight site assets deployed with the app.
- Allowed examples: brand marks, favicon, OG image, profile photos, decorative UI graphics.
- Never place large project galleries or long-form videos in `public/`.

## PROJECT PAGE LAYOUT ARCHITECTURE
Project pages use a dispatcher pattern. `src/app/work/[slug]/page.tsx` loads data and routes to a layout component:
- `PhysicadLayout` → `physicad`
- `EphemeraLayout` → `ephemera-of-existence`
- `InMySkinLayout` → `inmyskin`
- `DefaultProjectLayout` → all other projects (including `seedifferent`, `mnemonic-mixology`)

All layout components live in `src/components/project/layouts/`. Shared helpers, types, and constants are in `layouts/shared.tsx`.

**To add a new project with a custom layout:**
1. Create `src/components/project/layouts/<ProjectName>Layout.tsx`
2. Add one dispatch line in `page.tsx`: `if (project.slug === "<slug>") return <ProjectNameLayout {...layoutProps} />;`
3. Do not modify the other layout files.

**Do not** put per-project branching logic (`if (slug === "x")`) back into `page.tsx` beyond the dispatch line. All project-specific JSX belongs in the layout file.

## DESIGN RULES
- All project pages must use the shared project template.
- Do not introduce new typography systems or layout patterns without instruction.
- Align all project content to the established design language in `docs/design-system.md`.

## DESIGN SYSTEM RULES
- Do not introduce new color palettes.
- Do not switch to pure white backgrounds.
- Do not add heavy borders or frames to images.
- Maintain the off-white background system.
- Maintain black/gray typography hierarchy (primary near-black, secondary gray, muted light gray).
- Preserve generous whitespace and editorial spacing rhythm.
- Follow layout rhythm and style constraints defined in `docs/design-system.md`.
- Do not introduce new typography systems unless explicitly instructed.

## PROJECT CATEGORY RULES
Use exactly one primary category per project from this list:
- `Interactive Systems`
- `AI & Software`
- `Spatial & Architectural Design`
- `Objects & Product`
- `Visual & Media`

When processing new projects:
- infer category from project description, tools, interaction mode, and output format
- choose one dominant category when projects overlap domains
- do not invent new categories unless explicitly instructed

## REQUIRED REFERENCES FOR AGENTS
Before implementing ingestion or content updates, agents must review:
- `AGENTS.md`
- `docs/project-intake.md`
- `docs/asset-workflow.md`
- `docs/design-system.md`
- `docs/project-categories.md`
- `templates/project-template.txt`
- `templates/project-meta-template.json`
