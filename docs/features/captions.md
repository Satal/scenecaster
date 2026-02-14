# Captions

Any step in a browser scene can have a caption overlay that appears synchronised with the action. Captions help viewers follow along without needing audio.

## Usage

```yaml
steps:
  - action: click
    selector: "button:has-text('Save')"
    duration: 2
    caption:
      text: "Click the save button"
      position: bottom
      style: bar
      animation: slideUp
```

## Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `text` | string | Yes | - | The caption text to display. |
| `position` | string | No | `"bottom"` | Where to show the caption: `top`, `bottom`, or `center`. |
| `style` | string | No | `"bar"` | Visual style of the caption. |
| `animation` | string | No | `"slideUp"` | How the caption enters. |

## Styles

| Style | Description |
|-------|-------------|
| `bar` | Full-width coloured bar using `primaryColor`. Bold and impossible to miss. Good for important instructions. |
| `bubble` | Rounded box with a border. Floating and friendly. Works well for tips and annotations. |
| `subtitle` | Semi-transparent dark background. Classic subtitle look. Unobtrusive. |
| `pill` | Rounded pill shape. Compact and modern. Good for short labels. |

## Animations

| Animation | Description |
|-----------|-------------|
| `slideUp` | Springs up from below with physics-based easing. The default - energetic and attention-grabbing. |
| `fadeIn` | Simple opacity fade. Subtle and professional. |
| `typewriter` | Characters appear one by one. Creates a sense of real-time narration. |
| `none` | Appears instantly. Use when the caption should already be visible when the scene cuts in. |

## Positions

- **`bottom`** - Below the main content. The default and most common position. Doesn't obscure the UI being demonstrated.
- **`top`** - Above the main content. Useful when the action happens at the bottom of the viewport.
- **`center`** - Centred on screen. Best for important messages or when the caption is the focus.

## Tips

- Keep caption text short and action-oriented: "Click 'Save'" rather than "Now you should click on the save button"
- Use `bar` style for key actions, `subtitle` for supplementary context
- The `typewriter` animation works best with shorter text
- Captions inherit the `primaryColor` from your [brand configuration](../script-reference/brand.md)

---

[Back to Index](../INDEX.md) | [Scenes Reference](../script-reference/scenes.md) | [Next: Transitions](transitions.md)
