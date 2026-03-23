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
      work/
        [slug]/
          page.tsx          ← dispatcher: routes slug to layout component
    components/
      project/
        layouts/
          shared.tsx        ← shared types, constants, helpers
          DefaultProjectLayout.tsx
          PhysicadLayout.tsx
          EphemeraLayout.tsx
          InMySkinLayout.tsx
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

### Adding a project with a custom page layout
If the project needs a unique visual treatment (custom background, special section layout, per-project components):
1. Create `src/components/project/layouts/<ProjectName>Layout.tsx` (use `DefaultProjectLayout.tsx` as a reference).
2. Add a single dispatch line in `src/app/work/[slug]/page.tsx`:
   ```ts
   if (project.slug === "<slug>") return <ProjectNameLayout {...layoutProps} />;
   ```
3. Do not add per-project `if/else` logic anywhere else — all project-specific JSX stays in the layout file.

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

## Deployment Workflow

This repository separates code/content from heavy media assets.

Project JSON is versioned in Git, while large media files are stored in Cloudflare R2 (S3-compatible Blob storage).

### 1. Sync project media to Blob storage (Cloudflare R2)

Media stored in `assets-local/` should be uploaded to the R2 bucket before deployment.

Example command:

aws s3 sync ./assets-local s3://arieladhidevara \
 --profile default \
 --endpoint-url https://448bf439fae4019c77ffd698cbecb2a5.r2.cloudflarestorage.com

Dry run:

aws s3 sync ./assets-local s3://arieladhidevara \
 --dryrun \
 --profile default \
 --endpoint-url https://448bf439fae4019c77ffd698cbecb2a5.r2.cloudflarestorage.com


### 2. Commit structured content and code

After assets are uploaded, commit JSON and source updates:

git add .
git commit -m "content: update project metadata"
git push


### 3. Automatic deployment

The repository is connected to Cloudflare Pages.

Every push to the main branch triggers a new build and deployment.


### Typical Update Flow

1. Add project media to:

assets-local/<project-slug>/

2. Process project content:

ts-node scripts/process-project.ts <project-slug>

3. Upload media:

aws s3 sync ./assets-local s3://arieladhidevara \
 --profile default \
 --endpoint-url https://448bf439fae4019c77ffd698cbecb2a5.r2.cloudflarestorage.com

4. Push updates:

git add .
git commit -m "content: add <project-slug>"
git push


### Notes

• Do not commit heavy media files to Git  
• Blob storage paths mirror local folder structure  
• JSON files only reference public asset URLs  
• assets-local acts as the staging area before upload  


### Bucket Structure

s3://arieladhidevara/

  artifacts-of-identity/
  inmyskin/
  mnemonicmixology/
  site/
  ui-graphics/


### Local Asset Structure

assets-local/

  unseen-realities/
  inmyskin/
  hivee/
  flashsight/


Keeping both structures aligned ensures predictable asset URLs.

## Project Page Layout Architecture

Project pages use a dispatcher pattern. `src/app/work/[slug]/page.tsx` loads data and routes to a self-contained layout component in `src/components/project/layouts/`:

| Layout | Slug |
|---|---|
| `PhysicadLayout` | `physicad` |
| `EphemeraLayout` | `ephemera-of-existence` |
| `InMySkinLayout` | `inmyskin` |
| `DefaultProjectLayout` | all other projects |

Shared helpers, types, and render utilities live in `layouts/shared.tsx`. See `AGENTS.md` for the full rule set.

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
