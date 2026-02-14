# Browser Frame

Wrap browser recordings in a realistic window frame to give context and visual polish. The frame is rendered by Remotion as an overlay - it doesn't affect the actual browser recording.

## Usage

```yaml
- type: browser
  id: demo
  url: "https://example.com"
  frame:
    style: macos
    showUrl: true
    darkMode: false
```

## Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `style` | string | No | `"none"` | Frame style: `macos`, `minimal`, or `none`. |
| `showUrl` | boolean | No | `false` | Show the URL in the title bar. |
| `darkMode` | boolean | No | `false` | Use dark title bar variant. |

## Styles

### `macos`

Full macOS-style chrome with traffic light dots (red, yellow, green), URL bar, and drop shadow. The most realistic option.

```yaml
frame:
  style: macos
  showUrl: true
```

When `showUrl` is enabled, the current page URL is displayed in the title bar area, giving viewers context about where they are in the app.

### `minimal`

Just the traffic light dots and rounded corners. Less visual noise than full macOS chrome, but still provides the "this is a browser window" context.

```yaml
frame:
  style: minimal
```

### `none`

No frame. The raw browser recording fills the entire output area. This is the default.

```yaml
frame:
  style: none
```

## Dark Mode

Both `macos` and `minimal` styles support a dark mode variant with a darker title bar:

```yaml
frame:
  style: macos
  darkMode: true
```

This pairs well with dark-themed applications or dark `brand.backgroundColor` settings.

## Tips

- Use `macos` for professional product demos where the browser context matters
- Use `minimal` when you want subtle framing without the full chrome
- Use `none` when the content should fill the entire frame (e.g. mobile variant recordings)
- `showUrl: true` helps viewers know where they are in your app, especially in multi-page tutorials

---

[Back to Index](../INDEX.md) | [Previous: Animated Cursor](cursor.md) | [Next: CSS Injection](css-injection.md)
