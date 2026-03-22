"""
Populate assetsBySection, gallery, galleryImages, videos, assets.*,
primaryVideo/primaryMedia, and openGraphImage for every project JSON
based on the files actually present in assets-local/.

Run from repo root:
  python scripts/update-assets.py
"""

import json
import os
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
ASSETS_LOCAL = REPO_ROOT / "assets-local"
CONTENT = REPO_ROOT / "content" / "projects"

IMAGE_EXT  = {".jpg", ".jpeg", ".png", ".gif", ".JPG", ".JPEG", ".PNG"}
VIDEO_EXT  = {".mp4", ".mov", ".MOV", ".MP4"}
MODEL_EXT  = {".obj", ".glb", ".gltf", ".fbx", ".stl"}
SCRIPT_EXT = {".js", ".html", ".css", ".py"}
DOC_EXT    = {".heic", ".HEIC", ".pdf", ".ico", ".webp", ".wav", ".gz", ".json", ".data"}

# Sections that should appear in gallery/galleryImages (display-facing images)
GALLERY_SECTIONS = {"overview", "background", "concept", "the-project", "process", "documentation", "reflection"}

def classify(path: str):
    ext = Path(path).suffix
    if ext in IMAGE_EXT:   return "image"
    if ext in VIDEO_EXT:   return "video"
    if ext in MODEL_EXT:   return "model"
    return "other"

def scan_project(slug: str):
    """Return dict: section -> [relative_paths ...]"""
    project_dir = ASSETS_LOCAL / slug
    if not project_dir.exists():
        return {}

    by_section: dict[str, list[str]] = {}
    for file in sorted(project_dir.rglob("*")):
        if not file.is_file():
            continue
        rel = file.relative_to(ASSETS_LOCAL).as_posix()   # e.g. "altereal/overview/video.mp4"
        parts = file.relative_to(project_dir).parts        # e.g. ("overview", "video.mp4")
        if not parts:
            continue
        section = parts[0]   # top-level subfolder = section name
        by_section.setdefault(section, []).append(rel)

    return by_section

def is_direct_media(path: str, slug: str) -> bool:
    """True only if the file sits directly in slug/section/file (depth 1), not in nested subfolders."""
    # path looks like "slug/section/file.ext" -> depth=2 relative to ASSETS_LOCAL
    parts = path.split("/")
    return len(parts) == 3

def build_fields(slug: str, by_section: dict):
    all_images, all_videos, all_models, all_scripts, all_docs = [], [], [], [], []
    gallery, gallery_images = [], []

    for section, paths in by_section.items():
        for p in paths:
            kind = classify(p)
            ext  = Path(p).suffix
            if kind == "image":
                all_images.append(p)
                if section in GALLERY_SECTIONS and is_direct_media(p, slug):
                    gallery_images.append(p)
                    gallery.append(p)
            elif kind == "video":
                all_videos.append(p)
            elif kind == "model":
                all_models.append(p)
            elif ext in SCRIPT_EXT:
                all_scripts.append(p)
            else:
                all_docs.append(p)

    # Pick primaryVideo / primaryMedia: prefer overview > the-project > background > any
    primary_video = ""
    for preferred in ("overview", "the-project", "background"):
        for p in by_section.get(preferred, []):
            if classify(p) == "video":
                primary_video = p
                break
        if primary_video:
            break
    if not primary_video and all_videos:
        primary_video = all_videos[0]

    # Pick primaryMedia: primaryVideo if exists, else first gallery image
    primary_media = primary_video
    if not primary_media and gallery:
        primary_media = gallery[0]

    return {
        "primaryVideo": primary_video,
        "primaryMedia": primary_media,
        "gallery": gallery,
        "galleryImages": gallery_images,
        "videos": all_videos,
        "assets_videos": all_videos,
        "assets_images": all_images,
        "assets_models": all_models,
        "assets_scripts": all_scripts,
        "assets_documents": all_docs,
        "assetsBySection": by_section,
    }

def update_json(slug: str):
    json_path = CONTENT / f"{slug}.json"
    if not json_path.exists():
        print(f"  [SKIP] No JSON for {slug}")
        return

    with open(json_path, encoding="utf-8-sig") as f:
        data = json.load(f)

    by_section = scan_project(slug)
    if not by_section:
        print(f"  [SKIP] No assets-local dir for {slug}")
        return

    fields = build_fields(slug, by_section)

    # Update fields
    data["primaryVideo"]  = fields["primaryVideo"]
    data["primaryMedia"]  = fields["primaryMedia"]
    data["gallery"]       = fields["gallery"]
    data["galleryImages"] = fields["galleryImages"]
    data["videos"]        = fields["videos"]
    data["assets"]["videos"]    = fields["assets_videos"]
    data["assets"]["images"]    = fields["assets_images"]
    data["assets"]["models"]    = fields["assets_models"]
    data["assets"]["scripts"]   = fields["assets_scripts"]
    data["assets"]["documents"] = fields["assets_documents"]

    # openGraphImage: use cardImage if it's a string, else thumbnails/card.*
    if not data.get("openGraphImage") or not isinstance(data.get("openGraphImage"), str):
        card = data.get("cardImage", "")
        data["openGraphImage"] = card if card else ""

    # Add assetsBySection (always overwrite)
    data["assetsBySection"] = by_section

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    section_summary = ", ".join(f"{s}({len(v)})" for s, v in by_section.items())
    print(f"  [OK] {slug}: {section_summary}")

if __name__ == "__main__":
    # Get all slugs from assets-local (skip physicad since it's already done)
    already_done = {"physicad", "example-project", "ui-graphics"}
    slugs = sorted(
        d.name for d in ASSETS_LOCAL.iterdir()
        if d.is_dir() and d.name not in already_done
    )
    print(f"Updating {len(slugs)} projects...\n")
    for slug in slugs:
        update_json(slug)
    print("\nDone.")
