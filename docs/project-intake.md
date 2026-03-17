# Project Intake

## Required Input
Each project must have:

```text
project-inbox/<slug>/
  project.txt
```

`meta.json` is optional.

## Preferred Folder Format
Recommended structure before processing:

```text
project-inbox/<slug>/
  project.txt
  videos/
  images/
  scripts/
  models/
  documents/
```

If media is not arranged cleanly, ingestion should still work by scanning recursively and normalizing placement.

## Required Files
- `project.txt` is required and is the primary narrative + metadata source.
- `images/cover.jpg` and `images/card.jpg` are preferred.
- If `cover`/`card` are missing, the processor should infer and assign them from available images.

## Recommended Media Files
- `videos/demo.mp4` for primary motion preview.
- `videos/teaser.mp4` for secondary short preview.
- `images/setup-01.jpg`, `images/detail-01.jpg`, etc. for galleries.
- `scripts/` for Unity, WebGL, or demo runtime files.
- `models/` for 3D files (`.glb`, `.fbx`, etc.).
- `documents/` for PDF and supporting files.

## Naming Conventions
### Core Media Names
- `images/cover.jpg` -> hero image
- `images/card.jpg` -> project card thumbnail
- `videos/demo.mp4` -> primary video
- `videos/teaser.mp4` -> secondary video

### Fallback Auto-Rename Rules
When names are ambiguous, normalize deterministically:
- images -> `image-01.jpg`, `image-02.jpg`, ...
- videos -> `video-01.mp4`, `video-02.mp4`, ...
- scripts -> `script-01.js`, `script-02.js`, ...
- models -> `model-01.glb`, `model-02.glb`, ...
- documents -> `document-01.pdf`, `document-02.pdf`, ...

### Image Sequencing
Use descriptive prefixes plus zero-padded indices when known:
- `setup-01.jpg`
- `setup-02.jpg`
- `detail-01.jpg`
- `process-01.jpg`

## Intake Processing Behavior
1. Read `project.txt` and optional `meta.json`.
2. Scan all non-control files recursively in `project-inbox/<slug>/`.
3. Move files into `assets-local/<slug>/videos|images|scripts|models|documents`.
4. Auto-rename ambiguous files using deterministic sequential names.
5. Auto-pick hero/card/video using naming priority and fallback logic.
6. Generate `content/projects/<slug>.json` from normalized data.

## Project Narrative Structure
Each project should provide these seven sections in order:
1. Overview
2. Background
3. Concept
4. The Project
5. Process
6. Reflection / Impact
7. Documentation

## Validation Checklist
Before processing:
- Slug uses lowercase letters, numbers, and hyphens.
- `project.txt` exists and is complete.
- Media files are present somewhere inside the project folder.
- No large media is committed into `public/`.
