# Transitions

Transitions control how scenes enter the video. You can set a global default and override it per scene.

## Global Default

Set the default transition for all scenes in the `output` section:

```yaml
output:
  transition:
    type: fade
    duration: 0.5
```

## Per-Scene Override

Any scene can override the global default with its own `transition` field:

```yaml
- type: title
  id: intro
  transition:
    type: zoom
    duration: 0.6

- type: browser
  id: demo
  transition:
    type: slide
    direction: right
    duration: 0.4
```

## Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `type` | string | Yes | `"fade"` | Transition type: `fade`, `slide`, `zoom`, or `none`. |
| `duration` | number | No | `0.5` | Duration in seconds. |
| `direction` | string | No | `"left"` | Direction for `slide` transitions only. |

## Transition Types

### `fade`

Smooth opacity crossfade. The default transition.

```yaml
transition:
  type: fade
  duration: 0.5
```

Clean and professional. Works well between any scene types.

### `slide`

Slides the new scene in from a direction. The previous scene slides out in the same direction.

```yaml
transition:
  type: slide
  direction: left
  duration: 0.4
```

| Direction | Effect |
|-----------|--------|
| `left` | New scene enters from the right, slides left. |
| `right` | New scene enters from the left, slides right. |
| `up` | New scene enters from below, slides up. |
| `down` | New scene enters from above, slides down. |

Works well between browser scenes that represent a flow (e.g. navigating through a multi-step form).

### `zoom`

Scales from 80% to 100% with a simultaneous fade. Dramatic and attention-grabbing.

```yaml
transition:
  type: zoom
  duration: 0.6
```

Works well for intro title cards to create impact.

### `none`

Instant cut with no animation.

```yaml
transition:
  type: none
```

Use when you want a hard cut between scenes, or when scenes are closely related and a transition would be distracting.

## Tips

- Use `fade` as your global default - it works everywhere
- Use `zoom` for intro title cards to create a dramatic opening
- Use `slide` between related browser scenes (e.g. form steps)
- Keep durations between 0.3s and 0.8s - shorter feels snappy, longer feels cinematic
- Use `none` sparingly - hard cuts can feel jarring

---

[Back to Index](../INDEX.md) | [Previous: Captions](captions.md) | [Next: Animated Cursor](cursor.md)
