# Animated Cursor

Browser scenes can display an animated fake cursor that moves between interaction targets. This helps viewers follow where actions are happening on screen.

## Usage

Enable the cursor on a browser scene:

```yaml
- type: browser
  id: demo
  url: "https://example.com"
  cursor:
    enabled: true
    style: pointer
    color: "#000000"
    size: 24
  steps:
    - action: click
      selector: "button.submit"
      duration: 2
```

## Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `enabled` | boolean | No | `false` | Whether to show the animated cursor. |
| `style` | string | No | `"pointer"` | Cursor appearance: `pointer` or `default`. |
| `color` | string | No | `"#000000"` | Cursor colour (hex). |
| `size` | number | No | `24` | Cursor size in pixels. |

## Automatic Behaviour

When enabled, the cursor automatically:

- **Moves to click targets** with spring-based animation (smooth, physics-based movement)
- **Shows a bounce effect** on click actions (visual feedback that a click occurred)
- **Switches to an I-beam cursor** during `fill` actions (mimicking text input behaviour)
- **Fades in** at the start of each browser scene (doesn't just appear)

The cursor overlay is rendered by Remotion on top of the browser recording, so it's always crisp and doesn't interfere with the actual page.

## Tips

- Enable the cursor for tutorial-style videos where viewers need to follow along
- Use `pointer` style (the default) for most use cases
- A dark cursor (`#000000`) works well on light UIs; switch to `#ffffff` for dark UIs
- The cursor doesn't appear during `scroll` or `wait` actions (it stays in its last position)

---

[Back to Index](../INDEX.md) | [Previous: Transitions](transitions.md) | [Next: Browser Frame](browser-frame.md)
