# Getting Started

Get SceneCaster installed and render your first video.

## Prerequisites

- **Node.js** >= 18
- **Chromium** for Playwright (installed below)
- **FFmpeg** (usually pre-installed on macOS/Linux, or bundled by Remotion)

## Installation

```bash
# Install globally
npm install -g scenecaster

# Or use npx (no install needed)
npx scenecaster --help
```

Then install the browser that Playwright uses for recording:

```bash
npx playwright install chromium
```

## Your First Video

### 1. Scaffold a starter script

```bash
scenecaster init --name my-first-video
```

This creates `my-first-video.scenecaster.yaml` with a working template you can customise.

### 2. Validate it

```bash
scenecaster validate my-first-video.scenecaster.yaml
# ✔ Valid script: "My First Video"
#   Scenes: 2
#   Variants: desktop
#   FPS: 30
```

### 3. Render it

```bash
scenecaster render my-first-video.scenecaster.yaml -o ./videos
```

Your MP4 lands in `./videos/`. Open it, admire it, upload it.

## Next Steps

- Read [How It Works](how-it-works.md) to understand the pipeline
- Explore the [Script Reference](script-reference/meta.md) to learn what you can configure
- Check out [Examples](examples.md) for real-world scripts

## Troubleshooting

**Chromium won't install:**
Try running `npx playwright install chromium` with elevated permissions, or check [Playwright's system requirements](https://playwright.dev/docs/intro#system-requirements).

**FFmpeg not found:**
Remotion typically bundles FFmpeg. If you see FFmpeg-related errors, install it manually:
- macOS: `brew install ffmpeg`
- Ubuntu/Debian: `sudo apt install ffmpeg`
- Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

**Permission errors on global install:**
Use `npx scenecaster` instead of installing globally, or fix your npm permissions with `npm config set prefix ~/.npm-global`.

---

[Back to Index](INDEX.md)
