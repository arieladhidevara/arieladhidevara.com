# Asset Workflow

## Purpose
Define how local media moves from intake folders to long-term storage while keeping Git lightweight.

## Principles
- Git stores metadata, templates, and lightweight site assets.
- Blob storage stores large project media.
- Local folder structure must mirror Blob pathnames.
- Intake media should be moved (not duplicated) into `assets-local/` during processing.

## Intake To Storage Flow
1. New project arrives in `project-inbox/<slug>/`.
2. Agent validates `project.txt` and scans media recursively.
3. Agent moves media into `assets-local/<slug>/` and normalizes section folders (`thumbnails`, `overview`, `background`, `concept`, `the-project`, `process`, `reflection`, `documentation`).
4. Agent applies deterministic fallback renaming for ambiguous filenames (`image-01`, `video-01`, etc.).
5. Agent derives canonical media roles (`cover`, `card`, `demo`, `teaser`) using naming rules + fallback selection.
6. Agent uploads media from `assets-local/<slug>/` to Blob.
7. Agent records resulting media URLs in `content/projects/<slug>.json`.
8. Website renderer consumes JSON and shared templates.

## Post-Move State
After successful normalization:
- `project-inbox/<slug>/` keeps narrative/control files (`project.txt`, optional `meta.json`).
- Media files live in `assets-local/<slug>/...`.
- Empty media subfolders in `project-inbox/<slug>/` may be cleaned up.

## What Goes In `public/`
- Brand identity assets (logo, favicon, OG image).
- Profile photos used globally.
- Small decorative site graphics and textures.

## What Must Not Go In `public/`
- Full-resolution project galleries.
- Raw exports from editing suites.
- Long-form video files.
- Large media archives.

## Path Mirroring Rule
If local file path is:
`assets-local/unseen-realities/the-project/demo.mp4`
then Blob object key should be:
`unseen-realities/the-project/demo.mp4`

This keeps references deterministic across scripts and content files.
