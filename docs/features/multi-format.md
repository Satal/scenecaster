# Multi-Format Output

Define multiple variants to produce videos for different platforms from the same script. Each variant records the browser at its own viewport dimensions, so responsive layouts adapt naturally.

## Usage

```yaml
output:
  fps: 30
  variants:
    - id: desktop
      width: 1920
      height: 1080
      aspectRatio: "16:9"

    - id: mobile
      width: 1080
      height: 1920
      aspectRatio: "9:16"
      viewport:
        width: 390
        height: 693
```

## How It Works

1. For each variant, Playwright records the browser at the variant's `viewport` dimensions (or `width`/`height` if no viewport is set)
2. Your responsive CSS adapts the page layout to fit the viewport
3. Remotion scales the recording to the output `width`/`height`
4. Each variant produces its own MP4 and thumbnail

No letterboxing, no awkward crops. The responsive layout does the work.

## Platform-Specific Examples

### YouTube (16:9)

```yaml
- id: desktop
  width: 1920
  height: 1080
  aspectRatio: "16:9"
```

Standard widescreen. Records at 1920x1080 by default.

### YouTube Shorts / Instagram Reels / TikTok (9:16)

```yaml
- id: mobile
  width: 1080
  height: 1920
  aspectRatio: "9:16"
  viewport:
    width: 390
    height: 693
```

Records at phone dimensions so the mobile layout kicks in, then scales up to 1080x1920 for the output.

### Social Media Posts (1:1)

```yaml
- id: square
  width: 1080
  height: 1080
  aspectRatio: "1:1"
  viewport:
    width: 540
    height: 540
```

Square format for Instagram posts, Twitter/X, and LinkedIn.

### Tablet (4:3)

```yaml
- id: tablet
  width: 1024
  height: 768
  aspectRatio: "4:3"
  viewport:
    width: 1024
    height: 768
```

## Rendering a Single Variant

When iterating on your script, render just one variant to save time:

```bash
scenecaster render tutorial.yaml --variant desktop
```

Render all variants for the final output by omitting `--variant`.

## Selector Overrides

When mobile and desktop layouts use different elements (e.g. a hamburger menu vs. a nav bar), use [Selector Overrides](selector-overrides.md) to swap selectors per variant.

---

[Back to Index](../INDEX.md) | [Previous: Thumbnails](thumbnails.md) | [Next: Selector Overrides](selector-overrides.md)
