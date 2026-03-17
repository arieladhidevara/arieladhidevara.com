# Design System Specification

## Design Philosophy
The current portfolio implementation follows an editorial minimal system with soft spatial depth. The experience should remain:
- minimal
- calm
- spacious
- premium
- restrained in expression

Implementation direction:
- no UI redesign when extending pages
- preserve existing typographic hierarchy and spacing rhythm
- use motion to support narrative flow, not to add visual noise

## Color System
The active palette is tokenized in `src/app/globals.css` and `tailwind.config.ts`.

Core tokens:
- `--color-base: #f1f2f4` (site base background)
- `--color-surface: #f7f7f8` (surface panels)
- `--color-layer: #eceef1` (tonal layered blocks)
- `--color-text: #121418` (primary near-black text)
- `--color-subtext: #4c5360` (secondary neutral gray)
- `--color-muted: #8c939f` (muted/kicker text)
- `--color-accent: #5a6880` (restrained accent, low saturation)
- `--color-line: rgba(20, 26, 34, 0.1)` (lines and dividers)

Background rules:
- use soft off-white and very light gray tonal backgrounds
- avoid pure white blocks as dominant section backgrounds
- keep contrast gentle between adjacent sections

Text hierarchy:
- primary: near-black (`#121418` family)
- secondary: medium neutral gray (`#4c5360` family)
- muted: lighter gray (`#8c939f` family)

## Typography
Current system:
- display: `Instrument Sans` (`--font-display`)
- body: `Plus Jakarta Sans` (`--font-body`)

Typographic behavior:
- display headings use tighter tracking (`.display-type`)
- body copy targets readable line length (`.editorial-copy`, max `72ch`)
- kicker labels are uppercase, compact, and muted (`.kicker`)
- preserve existing heading scale and weight distribution used across `home`, `work`, `about`, and project pages

## Spacing System
The site uses a generous editorial cadence with repeated increments:
- 4, 8, 12, 16, 24, 32, 48, 64

Structural rhythm:
- section shell: `py-24 md:py-32` (`Section` component)
- container: `max-w-layout` (`77rem`) with `px-6 md:px-10`
- maintain large vertical breathing room between major sections
- avoid dense card stacking or compressed copy blocks

## Layout Principles
Layout language is intentionally restrained:
- centered wide container for readability and rhythm
- asymmetrical editorial grids where needed (not rigid dashboard grids)
- strong whitespace before/after headlines and media blocks
- subtle rounded surfaces (`rounded-soft`, `rounded-card`) with low-contrast tonal separation

Do not:
- introduce new dense layout systems
- replace existing section rhythm with compact spacing

## Media Treatment
Media should feel embedded into composition, not boxed as separate widgets.

Rules:
- no heavy borders or hard frames around image/video blocks
- avoid visible high-contrast outlines
- rely on spacing, crop, tonal layering, and composition
- maintain integrated media surfaces (`media-integrated`, gentle gradients, low-contrast depth)

## Motion System
Motion characteristics in current implementation:
- smooth easing (`cubic-bezier(0.22, 1, 0.36, 1)`)
- subtle `FadeIn` entrance with moderate distance and duration
- restrained hover lift on cards
- scroll-linked moments are present but controlled

Motion rules:
- prioritize clarity and pacing over spectacle
- keep transitions smooth and low-noise
- avoid stacked flashy effects

## Three.js Principles
Three.js is used as a spatial layer, not as a dominant visual feature.

Accepted usage:
- subtle atmospheric support in hero and interactive modules
- conceptual object interaction with controlled lighting and motion
- scroll-reactive spatial behavior that supports storytelling

Constraints:
- preserve readability of text and UI
- keep GPU/animation load restrained
- do not turn pages into 3D-first experiences
