# Ariel Adhidevara Portfolio System

This repository contains the foundational architecture for Ariel Adhidevara's portfolio website and long-term project library.

The goal is to let Ariel add projects with a simple folder drop workflow while agents handle ingestion, media handling, and structured content output.

## Project Purpose
- Store project narratives and metadata in structured content files.
- Keep heavyweight media out of Git and in Blob storage.
- Reuse shared templates and design rules across all project pages.

## Repository Structure
```text
ARIELADHIDEVARA.com/
  AGENTS.md
  README.md
  docs/
    design-system.md
    asset-workflow.md
    project-intake.md
    prototype-frontend.md
    interactive-modules.md
  templates/
    project-template.txt
    project-meta-template.json
  project-inbox/
    example-project/
      project.txt
      thumbnails/
      images/
      videos/
      docs/
  assets-local/
  content/
    projects/
  scripts/
    upload-assets.ts
    process-project.ts
  src/
    app/
    components/
    lib/
  public/
    brand/
    profile/
    site/
```

## How To Add A New Project
1. Create a folder in `project-inbox/` named with a project slug.
2. Add a `project.txt` file using `templates/project-template.txt`.
3. Add media inside subfolders:
   - `Thumbnails/` for `cover.jpg` and `card.jpg`
   - `Overview/`, `Background/`, `Concept/`, `The Project/`, `Process/`, `Reflection/`, `Documentation/` to group media by narrative section
   - Place technical runtime assets in `Documentation/scripts/`, `Documentation/models/`, and `Documentation/documents/`
4. Run `ts-node scripts/process-project.ts <project-slug>` to process ingestion and generate JSON.
5. Optionally run `ts-node scripts/process-project.ts <project-slug> --upload` to upload media to Blob after local sync.

## How Agents Process Projects
1. Read `AGENTS.md` and `docs/` to follow repository conventions.
2. Parse `project.txt` as the narrative and metadata source.
3. Identify key media (`cover.jpg`, `card.jpg`, `demo.mp4`, etc.).
4. Upload large media from `assets-local/<slug>/` to Blob while preserving folder paths.
5. Generate normalized JSON into `content/projects/<slug>.json` using `templates/project-meta-template.json`.
6. Keep all project rendering aligned with shared template and design system rules.

## Asset Rules
- Use `public/` only for lightweight, global website assets.
- Never commit large project media to Git.
- Keep Blob pathnames mirrored to local folder structure for predictable references.

## Frontend Prototype
The repository includes a prototype-first Next.js frontend layer with placeholder content.

Run locally from repo root:
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:3000`

Prototype routes:
- `/` homepage
- `/work` project index
- `/work/[slug]` project template
- `/about` about page

Prototype guidance is documented in:
- `docs/prototype-frontend.md`
- `docs/interactive-modules.md`
