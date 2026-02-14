# Architecture

Internal architecture of SceneCaster for contributors.

## Tech Stack

| Tool | Role |
|------|------|
| [Playwright](https://playwright.dev) | Browser automation and viewport recording |
| [Remotion](https://remotion.dev) | React-based video composition and H.264 rendering |
| [Zod](https://zod.dev) | Script schema validation |
| [Commander](https://github.com/tj/commander.js) | CLI framework |
| TypeScript | Full type safety from script parsing to video rendering |

## Pipeline Architecture

```
┌─────────────┐    ┌──────────────┐    ┌───────────────┐    ┌──────────┐
│  YAML File  │───>│    Schema    │───>│   Recorder    │───>│ Composer │───> MP4
│             │    │  (Zod parse) │    │ (Playwright)  │    │(Remotion)│
└─────────────┘    └──────────────┘    └───────────────┘    └──────────┘
                          │                    │                   │
                    Validates &          Records each        Composes all
                    types the            browser scene       elements into
                    script               as raw video        final video
```

## Module Overview

### Schema (`src/schema/`)

Zod schemas that define and validate the script format. The schema is the single source of truth for what a valid `.scenecaster.yaml` file looks like.

Key responsibilities:
- Parse YAML into typed objects
- Validate all fields, ranges, and relationships
- Provide clear error messages for invalid scripts
- Export `ScriptSchema` for external use

### Recorder (`src/recorder/`)

Playwright-based browser recording engine. Launches a headless (or visible) Chromium browser and executes script steps while capturing the viewport as video.

Key responsibilities:
- Launch browser with correct viewport dimensions per variant
- Restore authentication state from storage state files
- Inject global and per-scene CSS
- Execute actions: navigate, click, fill, scroll, wait
- Handle `waitFor` conditions
- Apply selector overrides per variant
- Cache recordings by configuration hash
- Produce raw video files for each browser scene

### Composer (`src/composer/`)

Remotion-based video composition and rendering. Takes raw recordings and script metadata, composes them into a polished video with title cards, captions, transitions, and branding.

Key responsibilities:
- Generate title card scenes with spring animations
- Overlay captions on browser recordings
- Apply transitions between scenes
- Render animated cursor overlay
- Render browser chrome frame overlay
- Load Google Fonts
- Render final MP4 at specified dimensions and FPS
- Generate thumbnail PNGs

## Data Flow

1. **CLI** (`src/cli.ts`) parses command-line arguments and calls the appropriate pipeline function
2. **Schema** parses and validates the YAML file, producing a typed `Script` object
3. **Recorder** iterates over browser scenes and variants, recording each one (or loading from cache)
4. **Composer** receives the `Script` object and recording file paths, builds a Remotion composition, and renders to MP4

## Development

```bash
git clone https://github.com/Satal/scenecaster.git
cd scenecaster
npm install
npx playwright install chromium

# Run tests
npm test

# Type check
npm run lint

# Build
npm run build

# Watch mode
npm run dev
```

## Roadmap

- [x] Authentication support (Playwright storage state)
- [ ] `hover` and `pressKey` actions
- [ ] Programmatic plugin system for custom actions
- [ ] Background music support
- [ ] Watch mode for rapid iteration
- [ ] GitHub Actions example for CI video generation

---

[Back to Index](INDEX.md) | [Licensing](licensing.md)
