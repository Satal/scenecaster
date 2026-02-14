# How It Works

SceneCaster turns a YAML script into a finished MP4 through a four-stage pipeline.

## Pipeline Overview

```
YAML Script ──> Playwright Recording ──> Remotion Composition ──> MP4
```

### Stage 1: Script Parsing

You write a `.scenecaster.yaml` file describing your video: title cards, browser interactions, captions, branding, and output dimensions.

SceneCaster parses and validates the script against a [Zod schema](architecture.md), catching errors before any recording begins. Invalid scripts fail fast with [actionable error messages](error-messages.md).

### Stage 2: Browser Recording

[Playwright](https://playwright.dev) launches a headless Chromium browser and records the viewport (just the page content, no browser UI) while executing your steps:

- **Navigate** to URLs and wait for elements
- **Click** buttons and links (with optional highlight rings)
- **Fill** form fields with character-by-character typing
- **Scroll** the page smoothly
- **Wait** for async content to appear

Each browser scene produces a raw video file at the exact viewport dimensions you specified. If you have [multiple variants](features/multi-format.md) (e.g. desktop and mobile), Playwright records each one at the correct viewport size so your responsive CSS does the work.

Recordings are [cached](features/recording-cache.md) by default. Unchanged scenes reuse cached videos on re-render.

### Stage 3: Remotion Composition

[Remotion](https://remotion.dev) (a React-based video framework) composes everything into the final video:

- **Title cards** with spring-animated text, logo, and accent lines
- **Browser recordings** scaled to output dimensions
- **Caption overlays** synchronised to each step
- **Transitions** between scenes (fade, slide, zoom)
- **Animated cursor** overlay on browser scenes
- **Browser chrome frame** (optional macOS-style window)

### Stage 4: Rendering

Remotion renders the composition to H.264 MP4 at the dimensions and FPS you specified. A [thumbnail PNG](features/thumbnails.md) is generated alongside each video.

The output files are named from the script title and variant ID:

```
./output/how-to-add-a-team-member-desktop.mp4
./output/how-to-add-a-team-member-desktop-thumb.png
./output/how-to-add-a-team-member-mobile.mp4
./output/how-to-add-a-team-member-mobile-thumb.png
```

## Why This Architecture?

| Pain point | SceneCaster solution |
|-----------|---------------------|
| UI changed, video is outdated | Update the YAML, re-render |
| Need 16:9 and 9:16 versions | Define both as [output variants](features/multi-format.md) |
| Captions are tedious to add | Inline [captions](features/captions.md) in the script, auto-synced |
| Branding needs to be consistent | [`brand`](script-reference/brand.md) config applied to every video |
| "Can you make the font bigger?" | Change one line, re-render |
| New team member needs to make videos | Hand them the YAML format, not a video editor |
| Re-recording unchanged scenes is slow | [Recording cache](features/recording-cache.md) skips unchanged scenes |
| Cookie banners ruin the video | [CSS injection](features/css-injection.md) hides them globally |

---

[Back to Index](INDEX.md) | [Getting Started](getting-started.md) | [Script Reference](script-reference/meta.md)
