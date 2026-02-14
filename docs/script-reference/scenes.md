# Script Reference: `scenes`

The `scenes` section is an array of scenes that play in order. There are two scene types: **title** and **browser**.

## Title Scenes

Branded cards with animated text. Use them for intros, chapter breaks, and outros.

```yaml
- type: title
  id: intro
  duration: 4
  heading: "Creating Invoices"
  subheading: "A step-by-step guide"
  variant: main
  transition:
    type: zoom
    duration: 0.6
```

### Title Scene Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `type` | `"title"` | Yes | - | Scene type. |
| `id` | string | Yes | - | Unique scene identifier. Used for `--only` filtering and thumbnail `scene` reference. |
| `duration` | number | Yes | - | How long the scene is shown, in seconds. |
| `heading` | string | Yes | - | Main heading text. |
| `subheading` | string | No | - | Smaller text below the heading. |
| `variant` | string | No | `"main"` | Visual variant: `main`, `chapter`, `minimal`, or `outro`. |
| `transition` | object | No | Global default | Transition into this scene. Overrides the global default. |

### Title Variants

| Variant | Description |
|---------|-------------|
| `main` | Large heading, accent line, logo, subheading. Your intro card. |
| `chapter` | "Next Step" label above the heading. For section breaks. |
| `minimal` | Just the heading. Clean and simple. |
| `outro` | Like `main` but intended as a closing card. |

All text animates in with spring physics (staggered heading, subheading, accent line).

## Browser Scenes

The main event. SceneCaster launches a real browser, navigates to your app, and executes steps while recording.

```yaml
- type: browser
  id: create-invoice
  url: "https://app.example.com/invoices"
  frame:
    style: macos
    showUrl: true
    darkMode: false
  cursor:
    enabled: true
    style: pointer
    color: "#000000"
    size: 24
  customCss: |
    .sidebar { display: none !important; }
  steps:
    - action: navigate
      url: "https://app.example.com/invoices"
      duration: 3
      waitFor: "main"
      caption:
        text: "Go to the Invoices page"
        position: bottom
        style: bar
        animation: slideUp
  selectorOverrides:
    mobile:
      "button.desktop-nav": ".mobile-hamburger"
  transition:
    type: slide
    direction: left
    duration: 0.4
```

### Browser Scene Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `type` | `"browser"` | Yes | - | Scene type. |
| `id` | string | Yes | - | Unique scene identifier. |
| `url` | string | Yes | - | Initial URL to load. |
| `frame` | object | No | `{ style: "none" }` | Browser chrome frame overlay. See [Browser Frame](../features/browser-frame.md). |
| `cursor` | object | No | `{ enabled: false }` | Animated cursor overlay. See [Animated Cursor](../features/cursor.md). |
| `customCss` | string | No | - | CSS injected into this scene only. See [CSS Injection](../features/css-injection.md). |
| `steps` | array | Yes | - | Ordered list of actions to perform. See [Actions](#actions) below. |
| `selectorOverrides` | object | No | - | Per-variant selector swaps. See [Selector Overrides](../features/selector-overrides.md). |
| `transition` | object | No | Global default | Transition into this scene. |

## Actions

Each step in a browser scene has an `action` that tells Playwright what to do. Every step also has a `duration` that controls how long the viewer sees the result before moving on.

### Common Step Fields

These fields are available on all action types:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `action` | string | Yes | - | Action type: `navigate`, `click`, `fill`, `scroll`, or `wait`. |
| `duration` | number | Yes | - | How long the result is shown, in seconds. |
| `caption` | object | No | - | Caption overlay. See [Captions](../features/captions.md). |
| `waitFor` | string or object | No | - | Wait for an element before/after executing. See [waitFor](#waitfor) below. |

### `navigate`

Loads a URL and waits for network idle.

```yaml
- action: navigate
  url: "https://app.example.com/dashboard"
  duration: 3
  waitFor: ".dashboard-loaded"
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | URL to navigate to. |

For `navigate` actions, `waitFor` runs **after** the page loads.

### `click`

Clicks an element on the page.

```yaml
- action: click
  selector: "button:has-text('New Invoice')"
  highlight: true
  duration: 2
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `selector` | string | Yes | CSS or Playwright selector for the element to click. |
| `highlight` | boolean | No | Show a pulsing ring around the element before clicking. Default `false`. |

### `fill`

Types into an input field character by character.

```yaml
- action: fill
  selector: "#client-name"
  value: "Acme Corp"
  typeSpeed: 80
  duration: 2
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `selector` | string | Yes | CSS or Playwright selector for the input field. |
| `value` | string | Yes | Text to type. |
| `typeSpeed` | number | No | Milliseconds between keystrokes. Default `50`. |

### `scroll`

Scrolls the page or to a specific element.

```yaml
# Scroll by pixel offset
- action: scroll
  y: 400
  smooth: true
  duration: 1.5

# Scroll to an element
- action: scroll
  selector: "#pricing-section"
  smooth: true
  duration: 1.5
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `y` | number | No | Vertical scroll offset in pixels. |
| `x` | number | No | Horizontal scroll offset in pixels. |
| `selector` | string | No | Scroll to bring this element into view. |
| `smooth` | boolean | No | Use smooth scrolling animation. Default `true`. |

### `wait`

Pauses for a specified time. Useful for letting async content load or giving the viewer time to read.

```yaml
- action: wait
  timeout: 2000
  duration: 2
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timeout` | number | Yes | How long to wait in milliseconds. |

## `waitFor`

Any step can include a `waitFor` field to wait for an element. This is especially useful for SPAs where content loads asynchronously.

```yaml
# Shorthand: just a selector (waits for visible, 5s timeout)
waitFor: ".dashboard-loaded"

# Full form: control state and timeout
waitFor:
  selector: ".data-table"
  state: visible
  timeout: 10000
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `selector` | string | Yes | - | CSS or Playwright selector to wait for. |
| `state` | string | No | `"visible"` | Element state: `visible`, `attached`, `hidden`, or `detached`. |
| `timeout` | number | No | `5000` | Maximum wait time in milliseconds. |

**Behaviour by action type:**
- **`navigate`** - `waitFor` runs **after** the page loads
- **All other actions** - `waitFor` runs **before** the action executes

## Captions

Any step can have a caption overlay. See [Captions](../features/captions.md) for all styles, positions, and animations.

```yaml
caption:
  text: "Click the save button"
  position: bottom
  style: bar
  animation: slideUp
```

---

[Back to Index](../INDEX.md) | [Previous: `output`](output.md) | [Features](../features/captions.md)
