# Interactive Project Modules

## Purpose
Project pages support optional immersive storytelling blocks while preserving the existing minimal editorial system.

Not every project needs interaction.
Use modules only when interaction improves understanding of system behavior, process, or spatial logic.

## Module Architecture
Interactive modules are defined per project in `src/lib/placeholder-data.ts` via `interactiveModules`.

Each module includes:
- `type`
- `position`
- `kicker`
- `title`
- `description`
- module-specific payload

Supported positions:
- `after-overview`
- `after-concept`
- `after-project`
- `before-documentation`

Supported module types:
- `scroll-scene`
- `three-scene`
- `diagram-interaction`
- `media-sequence`

## Implemented Components
- `InteractiveSection`:
  Shared wrapper for module heading, description, and visual framing.
- `ScrollScene`:
  Scroll storytelling with pinned visual state and progressive text steps.
- `ThreeSceneBlock`:
  Optional Three.js block for concept visualization.
- `MediaSequence`:
  Layered media sequence with hover/focus changes and fullscreen placeholder mode.
- `InteractiveDiagram`:
  Node-based relationship map with hover-reactive links.
- `InteractiveModuleRenderer`:
  Maps module data to the correct interactive component.

## How Modules Are Inserted In Project Pages
Project template route (`src/app/work/[slug]/page.tsx`) groups modules by `position` and renders them between editorial sections.

This keeps the base story structure stable:
- Hero
- Overview
- Background
- Concept
- The Project
- Process
- Reflection / Impact
- Documentation

Interactive modules are inserted as optional layers between those sections.

## Three.js Integration
`ThreeSceneBlock` uses lazy loading via dynamic import:
- Three.js code is only loaded when the module is present.
- `ssr: false` prevents server rendering cost for WebGL.
- reduced-motion preference automatically switches to static fallback mode.

## Performance Strategy
- Heavy 3D canvas is lazy-loaded only on demand.
- Motion is scoped to module containers, not global page loops.
- Static fallback content keeps pages readable if interactive code is unavailable.
- Interaction remains optional and modular per project.

## Usage Guidelines
Use interaction when it clarifies:
- system flow
- spatial logic
- algorithm behavior
- multi-step process transitions

Do not use interaction when static content already communicates clearly.

## Visual Consistency Rules
Interactive modules must follow existing design language:
- minimal, calm, editorial composition
- no loud effects
- no heavy media framing
- restrained motion and subtle depth
- readability first, interaction second
