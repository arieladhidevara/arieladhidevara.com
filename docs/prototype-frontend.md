# Frontend Prototype System

## Purpose
This phase defines a reusable front-end portfolio system before integrating real project data.

Everything in this layer intentionally uses placeholders to establish:
- visual language
- motion language
- interaction style
- scalable page templates
- reusable component architecture

## Visual Direction
Current prototype direction:
- minimal editorial composition
- soft off-white and light gray tonal layers
- black and neutral-gray typography
- high readability with generous whitespace
- restrained premium presentation

Design rules in this phase:
- avoid heavy card framing and hard borders around media
- rely on spacing, rhythm, crop, and subtle tonal separation
- keep accents muted and controlled
- preserve a calm product-like layout system

## Intro / Entry System
Implemented: `IntroSequence`
- short opening animation shown at first session load
- elegant name reveal with subtle motion and tonal gradients
- smooth fade transition into homepage
- persistent session flag prevents repeated playback during the same browsing session

## Interaction Philosophy
Interaction is spatial but restrained:
- soft reveal motion for sections and cards
- subtle scroll-linked depth in dedicated moments
- quiet 3D support in hero scene (not visual noise)
- smooth page transitions for continuity

The interface should feel effortless on first glance, with depth revealed progressively.

## Three.js Usage
Three.js is used intentionally, not as decoration spam:
- Hero: abstract quiet object with gentle pointer + scroll response
- Immersive transition section: layered parallax and tonal depth
- Project modules: optional `ThreeSceneBlock` for concept visualization

The 3D layer supports atmosphere, hierarchy, and narrative pacing.

## Interactive Project Page Modules
Project pages now support modular interactive storytelling.

Reference:
- `docs/interactive-modules.md`

Available module types:
- `ScrollScene`
- `ThreeSceneBlock`
- `InteractiveDiagram`
- `MediaSequence`

Modules are inserted between editorial sections using position-based configuration.
This allows each project page to remain minimal by default, but immersive when needed.

## Placeholder Content Model
All pages currently consume placeholder data from:
- `src/lib/placeholder-data.ts`

Data model includes:
- project metadata (title, year, type, tags)
- seven narrative sections (Overview, Background, Concept, The Project, Process, Reflection / Impact, Documentation)
- gallery placeholders (image/video entries)
- related project references
- optional interactive module definitions

## Implemented Pages
- `/` Homepage prototype
- `/work` Project index / all works prototype
- `/work/[slug]` Reusable project template
- `/about` About page prototype

## Reusable Component System
Core reusable components:
- `IntroSequence`
- `SiteNav`
- `SiteFooter`
- `Section`
- `FadeIn`
- `ProjectCard`
- `FeaturedProjectBlock`
- `ProjectHero`
- `MediaBlock`
- `TagList`
- `WorkLibrary`
- `HeroScene` (Three.js)
- `ImmersiveBreak` (scroll-linked transition)
- `InteractiveSection`
- `InteractiveModuleRenderer`
- `ScrollScene`
- `ThreeSceneBlock`
- `InteractiveDiagram`
- `MediaSequence`

## Future Integration Path
When real data is ready:
1. Replace placeholder data source with `content/projects/*.json` ingestion output.
2. Map ingestion fields into existing component props.
3. Swap placeholder media labels with real URLs from storage paths.
4. Keep page templates/components unchanged to preserve visual consistency.
5. Extend filtering/search from placeholder tags to real taxonomy.
6. Populate `interactiveModules` only for projects that benefit from immersive explanation.
