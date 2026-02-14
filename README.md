<p align="center">
  <img src="https://em-content.zobj.net/source/apple/391/clapper-board_1f3ac.png" width="80" alt="SceneCaster" />
</p>

<h1 align="center">SceneCaster</h1>

<p align="center">
  <strong>Turn YAML scripts into polished tutorial videos. No video editor required.</strong>
</p>

<p align="center">
  <a href="docs/getting-started.md">Getting Started</a> &bull;
  <a href="docs/INDEX.md">Documentation</a> &bull;
  <a href="docs/cli.md">CLI</a> &bull;
  <a href="docs/api.md">API</a> &bull;
  <a href="docs/examples.md">Examples</a>
</p>

---

You know those product walkthrough videos that take hours to record, edit, re-record when the UI changes, add captions to, then export in three different aspect ratios?

SceneCaster does all of that from a single YAML file.

```bash
npx scenecaster render tutorial.yaml
```

Write what the browser should do. SceneCaster records it with [Playwright](https://playwright.dev), composes it with [Remotion](https://remotion.dev) (title cards, captions, transitions, branding), and renders a ready-to-upload MP4.

When your UI changes, update the YAML and re-render. That's it.

## Quick Start

```bash
# Install globally (or use npx)
npm install -g scenecaster

# Install the browser Playwright needs
npx playwright install chromium

# Scaffold a starter script
scenecaster init --name my-first-video

# Check that it's valid
scenecaster validate my-first-video.scenecaster.yaml

# Render it
scenecaster render my-first-video.scenecaster.yaml -o ./videos
```

Your MP4 lands in `./videos/`. Open it, admire it, upload it.

## How It Works

```
YAML Script ──> Playwright Recording ──> Remotion Composition ──> MP4
```

1. **You write a script** describing scenes: title cards, browser interactions, captions.
2. **Playwright records the browser** by automating your actual web app. Clicks, typing, scrolling - all captured as video.
3. **Remotion composes everything** into a polished video: branded title cards, synchronised captions, smooth transitions, animated cursor, and optional browser chrome.
4. **Out comes an MP4** at exactly the dimensions you specified, plus a thumbnail PNG.

Want a 16:9 for YouTube *and* a 9:16 for Shorts? Define both as variants. SceneCaster re-records at the right viewport size so your responsive layout does the work.

Read the [full pipeline explanation](docs/how-it-works.md) for more detail.

## Script Overview

A SceneCaster script is a YAML file with four sections:

```yaml
meta:                    # Video title, global CSS, auth config
  title: "My Tutorial"

brand:                   # Logo, colours, fonts
  primaryColor: "#1e40af"
  fontFamily: "Inter"

output:                  # FPS, dimensions, variants
  fps: 30
  variants:
    - id: desktop
      width: 1920
      height: 1080

scenes:                  # Title cards and browser recordings
  - type: title
    id: intro
    duration: 4
    heading: "Getting Started"

  - type: browser
    id: demo
    url: "https://example.com"
    steps:
      - action: click
        selector: "button.submit"
        duration: 2
        caption:
          text: "Click Submit"
```

See the full [Script Reference](docs/script-reference/meta.md) for all fields and options.

## Features

| Feature | Description | Docs |
|---------|-------------|------|
| **Captions** | Synced overlays with 4 styles and 4 animations | [captions](docs/features/captions.md) |
| **Transitions** | Fade, slide, zoom, or cut between scenes | [transitions](docs/features/transitions.md) |
| **Animated cursor** | Spring-based cursor following interactions | [cursor](docs/features/cursor.md) |
| **Browser frame** | macOS chrome overlay on recordings | [browser-frame](docs/features/browser-frame.md) |
| **CSS injection** | Hide cookie banners, chat widgets, etc. | [css-injection](docs/features/css-injection.md) |
| **Auth recording** | Record behind login walls | [auth](docs/features/authenticated-recording.md) |
| **Recording cache** | Skip unchanged scenes on re-render | [cache](docs/features/recording-cache.md) |
| **Thumbnails** | Auto-generated PNG per variant | [thumbnails](docs/features/thumbnails.md) |
| **Multi-format** | Desktop, mobile, square from one script | [multi-format](docs/features/multi-format.md) |
| **Selector overrides** | Swap selectors per variant | [overrides](docs/features/selector-overrides.md) |

## CLI

```bash
scenecaster render <script>     # Record and render
scenecaster preview <script>    # Remotion Studio preview
scenecaster validate <script>   # Check for errors
scenecaster auth <url>          # Save login session
scenecaster init                # Generate starter template
```

Full options and examples in the [CLI Reference](docs/cli.md).

## API

```typescript
import { parseScriptFile, runPipeline } from "scenecaster";

const script = parseScriptFile("tutorial.yaml");
await runPipeline(script, { outputDir: "./videos" });
```

Full API documentation in the [API Reference](docs/api.md).

## Requirements

- **Node.js** >= 18
- **Chromium** for Playwright: `npx playwright install chromium`
- **FFmpeg** (usually pre-installed or bundled by Remotion)

## Development

```bash
git clone https://github.com/Satal/scenecaster.git
cd scenecaster
npm install
npx playwright install chromium
npm test        # Run tests
npm run lint    # Type check
npm run build   # Build
npm run dev     # Watch mode
```

## Documentation

Full documentation is in the [`docs/`](docs/INDEX.md) directory:

- [Getting Started](docs/getting-started.md)
- [How It Works](docs/how-it-works.md)
- [Script Reference](docs/script-reference/meta.md) (meta, brand, output, scenes)
- [Features](docs/INDEX.md#features) (captions, transitions, cursor, frames, CSS, auth, cache, thumbnails, multi-format, selector overrides)
- [CLI Reference](docs/cli.md)
- [API Reference](docs/api.md)
- [Examples](docs/examples.md)
- [Error Messages](docs/error-messages.md)
- [Architecture](docs/architecture.md)
- [Licensing](docs/licensing.md)

## Remotion Licensing

SceneCaster uses [Remotion](https://remotion.dev) for video composition. Remotion is free for individuals and companies with 3 or fewer people. Companies with 4+ people need a [Remotion Company License](https://www.remotion.pro/license). See [Licensing](docs/licensing.md) for details.

## Licence

MIT
