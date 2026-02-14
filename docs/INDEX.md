# SceneCaster Documentation

Turn YAML scripts into polished tutorial videos. No video editor required.

---

## Getting Started

- **[Getting Started](getting-started.md)** - Installation, prerequisites, and your first render
- **[How It Works](how-it-works.md)** - The pipeline from YAML to MP4

## Script Reference

The four sections of a `.scenecaster.yaml` file:

- **[`meta`](script-reference/meta.md)** - Video metadata, global CSS, authentication
- **[`brand`](script-reference/brand.md)** - Logo, colours, fonts
- **[`output`](script-reference/output.md)** - FPS, variants, viewports, transitions, thumbnails
- **[`scenes`](script-reference/scenes.md)** - Title scenes, browser scenes, actions, captions

## Features

- **[Captions](features/captions.md)** - Styles, positions, and animations for caption overlays
- **[Transitions](features/transitions.md)** - Fade, slide, zoom, and none
- **[Animated Cursor](features/cursor.md)** - Spring-based cursor animation on browser scenes
- **[Browser Frame](features/browser-frame.md)** - macOS chrome, minimal, and none
- **[CSS Injection](features/css-injection.md)** - Global and per-scene CSS to hide unwanted elements
- **[Authenticated Recording](features/authenticated-recording.md)** - Record pages behind login walls
- **[Recording Cache](features/recording-cache.md)** - How caching works and `--no-cache`
- **[Thumbnails](features/thumbnails.md)** - Automatic thumbnail PNG generation
- **[Multi-Format Output](features/multi-format.md)** - Multiple output variants and responsive viewports
- **[Selector Overrides](features/selector-overrides.md)** - Per-variant selector swapping

## Reference

- **[CLI](cli.md)** - All CLI commands: render, preview, validate, init, auth
- **[API](api.md)** - Programmatic Node.js/TypeScript API
- **[Examples](examples.md)** - Real-world script examples
- **[Error Messages](error-messages.md)** - Common errors and how to fix them

## Project

- **[Architecture](architecture.md)** - Internal architecture and tech stack for contributors
- **[Licensing](licensing.md)** - Remotion licensing and MIT licence
