# Thumbnails

SceneCaster generates a thumbnail PNG alongside each MP4 by default. Thumbnails are useful for video platforms that display a preview image.

## Configuration

```yaml
output:
  thumbnail:
    enabled: true
    scene: intro
    frame: 45
```

## Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `enabled` | boolean | No | `true` | Whether to generate a thumbnail. |
| `scene` | string | No | First title scene | Which scene ID to capture the thumbnail from. |
| `frame` | number | No | ~30 (1s at 30fps) | Specific frame number to capture. |

## Default Behaviour

By default, the thumbnail is captured from the first title scene, approximately 1 second in (frame 30 at 30fps). This timing is chosen because spring animations have typically settled by then, giving you a clean, fully-rendered title card.

## Custom Scene

Capture the thumbnail from a specific scene by setting `scene` to a scene ID:

```yaml
output:
  thumbnail:
    scene: fill-details    # Capture from a browser scene instead
    frame: 60              # 2 seconds in
```

This is useful when you want the thumbnail to show the actual application rather than a title card.

## Disabling Thumbnails

Disable via the script:

```yaml
output:
  thumbnail:
    enabled: false
```

Or via the CLI:

```bash
scenecaster render tutorial.yaml --no-thumbnail
```

## Output

Thumbnail files are named alongside their corresponding MP4:

```
./output/how-to-add-a-team-member-desktop.mp4
./output/how-to-add-a-team-member-desktop-thumb.png
```

One thumbnail is generated per variant.

---

[Back to Index](../INDEX.md) | [Previous: Recording Cache](recording-cache.md) | [Next: Multi-Format Output](multi-format.md)
