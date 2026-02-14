# Script Reference: `output`

The `output` section defines render targets: frame rate, output dimensions, default transitions, thumbnail settings, and multiple variants for different platforms.

## Example

```yaml
output:
  fps: 30
  transition:
    type: fade
    duration: 0.5
  thumbnail:
    enabled: true
    scene: intro
    frame: 30
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

## Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `fps` | number | No | `30` | Frames per second for the output video. |
| `transition` | object | No | `{ type: "fade", duration: 0.5 }` | Default transition between scenes. Can be overridden per scene. |
| `transition.type` | string | No | `"fade"` | Transition type: `fade`, `slide`, `zoom`, or `none`. |
| `transition.duration` | number | No | `0.5` | Transition duration in seconds. |
| `transition.direction` | string | No | `"left"` | Direction for `slide` transitions: `left`, `right`, `up`, `down`. |
| `thumbnail` | object | No | `{ enabled: true }` | Thumbnail PNG generation settings. |
| `thumbnail.enabled` | boolean | No | `true` | Whether to generate a thumbnail. |
| `thumbnail.scene` | string | No | First title scene | Which scene ID to capture the thumbnail from. |
| `thumbnail.frame` | number | No | ~30 (1s) | Specific frame number to capture. |
| `variants` | array | Yes | - | One or more output variants (dimensions). |

## Variants

Each variant defines an output video at specific dimensions. You must define at least one.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | string | Yes | - | Unique identifier. Used in output filenames and `--variant` CLI flag. |
| `width` | number | Yes | - | Output video width in pixels. |
| `height` | number | Yes | - | Output video height in pixels. |
| `aspectRatio` | string | No | - | Aspect ratio label (e.g. `"16:9"`). Informational. |
| `viewport` | object | No | Uses `width`/`height` | Playwright recording viewport dimensions. |
| `viewport.width` | number | No | Variant `width` | Browser viewport width for recording. |
| `viewport.height` | number | No | Variant `height` | Browser viewport height for recording. |

### How `viewport` works

By default, Playwright records the browser at the variant's `width` and `height`. For mobile variants, this would mean recording at 1080x1920 - far too large for a phone layout.

The `viewport` field tells Playwright to record at smaller dimensions (e.g. 390x693 for a phone), so your responsive CSS kicks in. Remotion then scales the recording up to the output dimensions. No manual cropping.

```yaml
- id: mobile
  width: 1080        # Output: 1080x1920 video
  height: 1920
  viewport:
    width: 390        # Record: phone-sized viewport
    height: 693
```

See [Multi-Format Output](../features/multi-format.md) for platform-specific variant examples.

## Transitions

The global `transition` sets the default transition between all scenes. Individual scenes can override this with their own `transition` field.

See [Transitions](../features/transitions.md) for all transition types and configuration.

## Thumbnails

By default, SceneCaster generates a thumbnail PNG alongside each MP4. It captures a frame from the first title scene (about 1 second in, after spring animations have settled).

See [Thumbnails](../features/thumbnails.md) for all configuration options.

---

[Back to Index](../INDEX.md) | [Previous: `brand`](brand.md) | [Next: `scenes`](scenes.md)
