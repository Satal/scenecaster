<p align="center">
  <img src="https://em-content.zobj.net/source/apple/391/clapper-board_1f3ac.png" width="80" alt="SceneCaster" />
</p>

<h1 align="center">SceneCaster</h1>

<p align="center">
  <strong>Turn YAML scripts into polished tutorial videos. No video editor required.</strong>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#how-it-works">How It Works</a> &bull;
  <a href="#script-reference">Script Reference</a> &bull;
  <a href="#cli">CLI</a> &bull;
  <a href="#api">API</a>
</p>

---

You know those product walkthrough videos that take hours to record, edit, re-record when the UI changes, add captions to, then export in three different aspect ratios?

SceneCaster does all of that from a single YAML file.

```bash
npx scenecaster render tutorial.yaml
```

Write what the browser should do. SceneCaster records it with [Playwright](https://playwright.dev), composes it with [Remotion](https://remotion.dev) (title cards, captions, transitions, branding), and renders a ready-to-upload MP4.

When your UI changes, update the YAML and re-render. That's it.

## Quick Start

```bash
# Install globally (or use npx)
npm install -g scenecaster

# Install the browser Playwright needs
npx playwright install chromium

# Scaffold a starter script
scenecaster init --name my-first-video

# Check that it's valid
scenecaster validate my-first-video.scenecaster.yaml

# Render it
scenecaster render my-first-video.scenecaster.yaml -o ./videos
```

Your MP4 lands in `./videos/`. Open it, admire it, upload it.

## How It Works

```
YAML Script ──> Playwright Recording ──> Remotion Composition ──> MP4
```

**1. You write a script** describing scenes: title cards, browser interactions, captions.

**2. Playwright records the browser** viewport (no chrome, just the page) by automating your actual web app. Clicks, typing, scrolling - all captured as video.

**3. Remotion composes everything** into a polished video: branded title cards with spring animations, the browser recording with synchronised caption overlays, smooth transitions between scenes, an animated cursor, and optional browser chrome framing.

**4. Out comes an MP4** (H.264) at exactly the dimensions you specified, plus a thumbnail PNG.

Want a 16:9 for YouTube *and* a 9:16 for Shorts? Define both as variants. SceneCaster re-records at the right viewport size so your responsive layout does the work, then renders each one.

## Script Reference

A SceneCaster script is a YAML file with four sections:

### `meta` - Video metadata

```yaml
meta:
  title: "How to Create an Invoice"
  globalCss: |                           # Optional - injected into every browser scene
    .cookie-banner { display: none !important; }
```

The `globalCss` field lets you inject CSS into every browser scene. Useful for hiding cookie banners, chat widgets, or anything else that shouldn't appear in the video.

### `brand` - Your visual identity

```yaml
brand:
  logo: "./assets/logo.png"      # Optional - shown on title/outro cards
  primaryColor: "#1e40af"         # Accent colour (captions, highlights, progress bar)
  backgroundColor: "#0f172a"      # Title card background
  textColor: "#f8fafc"            # Title card text
  fontFamily: "Poppins"           # Google Font (loaded automatically)
```

All fields have sensible defaults. You can omit the entire `brand` section if you're happy with the built-in dark theme.

The `fontFamily` is loaded from Google Fonts automatically. If the font doesn't exist on Google Fonts, SceneCaster falls back gracefully with a warning.

### `output` - Render targets

```yaml
output:
  fps: 30
  transition:                      # Global default transition between scenes
    type: fade
    duration: 0.5
  thumbnail:                       # Thumbnail PNG generation
    enabled: true
    scene: intro                   # Optional - which scene to capture (default: first title)
    frame: 30                      # Optional - specific frame number
  variants:
    - id: desktop
      width: 1920
      height: 1080
      aspectRatio: "16:9"

    - id: mobile
      width: 1080
      height: 1920
      aspectRatio: "9:16"
      viewport:                    # Playwright records at this size
        width: 390
        height: 693
```

The `viewport` field on mobile variants tells Playwright to record at phone dimensions, so your responsive CSS kicks in. Remotion then scales the recording up to the output dimensions. No manual cropping.

### `scenes` - The actual content

Scenes play in order. There are two types:

#### Title Scenes

Branded cards with animated text. Use them for intros, chapter breaks, and outros.

```yaml
- type: title
  id: intro
  duration: 4                      # Seconds on screen
  heading: "Creating Invoices"
  subheading: "A step-by-step guide"
  variant: main                    # main | chapter | minimal | outro
  transition:                      # Optional - overrides global default
    type: zoom
    duration: 0.6
```

| Variant | What it looks like |
|---------|-------------------|
| `main` | Large heading, accent line, logo, subheading. Your intro card. |
| `chapter` | "Next Step" label above the heading. For section breaks. |
| `minimal` | Just the heading. Clean and simple. |
| `outro` | Like `main` but intended as a closing card. |

All text animates in with spring physics (staggered heading, subheading, accent line).

#### Browser Scenes

The main event. SceneCaster launches a real browser, navigates to your app, and executes steps while recording.

```yaml
- type: browser
  id: create-invoice
  url: "https://app.example.com/invoices"
  frame:                             # Optional browser chrome overlay
    style: macos                     # macos | minimal | none
    showUrl: true
    darkMode: false
  cursor:                            # Optional animated cursor
    enabled: true
    style: pointer                   # pointer | default
    color: "#000000"
    size: 24
  customCss: |                       # Optional - CSS for this scene only
    .sidebar { display: none !important; }
  steps:
    - action: navigate
      url: "https://app.example.com/invoices"
      duration: 3
      waitFor: "main"                # Wait for element after navigation
      caption:
        text: "Go to the Invoices page"
        position: bottom
        style: bar
        animation: slideUp

    - action: click
      selector: "button:has-text('New Invoice')"
      highlight: true              # Pulsing ring around the element
      duration: 2
      caption:
        text: "Click 'New Invoice'"

    - action: fill
      selector: "#client-name"
      value: "Acme Corp"
      typeSpeed: 80                # ms between keystrokes
      duration: 2

    - action: scroll
      y: 400
      smooth: true
      duration: 1.5

    - action: wait
      timeout: 2000
      duration: 2
      caption:
        text: "The invoice is saved automatically"
        style: bubble
        animation: typewriter
  transition:
    type: slide
    direction: left
    duration: 0.4
```

Each step's `duration` is how long the viewer sees the *result* of that action before moving on. This is what makes the video watchable - enough time to read the caption and understand what happened.

### Actions

| Action | What it does | Key fields |
|--------|-------------|------------|
| `navigate` | Loads a URL (waits for network idle) | `url` |
| `click` | Clicks an element | `selector`, `highlight` (optional pulsing ring) |
| `fill` | Types into an input field character by character | `selector`, `value`, `typeSpeed` |
| `scroll` | Scrolls the page or to an element | `y`, `x`, `smooth`, or `selector` |
| `wait` | Pauses | `timeout` (ms) |

### `waitFor` - Wait for elements

Any step can include a `waitFor` field to wait for an element before (or after, for `navigate` actions) executing:

```yaml
# Shorthand: just a selector (waits for visible, 5s timeout)
waitFor: ".dashboard-loaded"

# Full form: control state and timeout
waitFor:
  selector: ".data-table"
  state: visible                   # visible | attached | hidden | detached
  timeout: 10000                   # ms
```

This is especially useful for SPAs where content loads asynchronously. For `navigate` actions, the `waitFor` runs after the page loads. For all other actions, it runs before execution.

### CSS Injection

Inject CSS to hide elements that shouldn't appear in the video:

```yaml
# Global CSS (every browser scene)
meta:
  globalCss: |
    .cookie-banner, .chat-widget { display: none !important; }

# Per-scene CSS
- type: browser
  customCss: |
    .sidebar { width: 0 !important; }
```

CSS is re-injected on each navigation, so it persists across page loads.

### Transitions

Control how scenes enter with configurable transitions:

```yaml
# Global default (in output section)
output:
  transition:
    type: fade
    duration: 0.5

# Per-scene override
- type: title
  transition:
    type: zoom
    duration: 0.6

- type: browser
  transition:
    type: slide
    direction: right        # left | right | up | down
    duration: 0.4
```

| Transition | Description |
|-----------|-------------|
| `fade` | Smooth opacity crossfade. The default. |
| `slide` | Slides in from a direction. Set `direction` to `left`, `right`, `up`, or `down`. |
| `zoom` | Scales from 80% to 100% with a fade. Dramatic. |
| `none` | Cut. Instant switch with no animation. |

### Animated Cursor

Browser scenes can display an animated fake cursor that moves between interaction targets:

```yaml
cursor:
  enabled: true
  style: pointer               # pointer (arrow) or default
  color: "#000000"
  size: 24                     # px
```

The cursor automatically:
- Moves to click targets with spring-based animation
- Shows a bounce effect on clicks
- Switches to an I-beam cursor during fill actions
- Fades in at the start of each browser scene

### Browser Chrome Frame

Wrap browser recordings in a realistic window frame:

```yaml
frame:
  style: macos                 # macos | minimal | none
  showUrl: true                # Show the URL in the title bar
  darkMode: false              # Dark title bar variant
```

| Style | Description |
|-------|-------------|
| `macos` | Full macOS-style chrome with traffic light dots, URL bar, and drop shadow. |
| `minimal` | Just the dots and rounded corners. Less visual noise. |
| `none` | No frame. Raw browser recording. |

### Captions

Any step can have a `caption` overlay that appears synchronised with the action:

```yaml
caption:
  text: "Click the save button"
  position: bottom               # top | bottom | center
  style: bar                     # bar | bubble | subtitle | pill
  animation: slideUp             # slideUp | fadeIn | typewriter | none
```

**Styles:**

| Style | Description |
|-------|-------------|
| `bar` | Full-width coloured bar. Bold and impossible to miss. |
| `bubble` | Rounded box with a border. Floating and friendly. |
| `subtitle` | Semi-transparent dark background. Classic subtitle look. |
| `pill` | Rounded pill shape. Compact and modern. |

**Animations:**

| Animation | Description |
|-----------|-------------|
| `slideUp` | Springs up from below with physics-based easing. |
| `fadeIn` | Simple opacity fade. |
| `typewriter` | Characters appear one by one. |
| `none` | Appears instantly. |

### Selector Overrides

When your mobile layout uses different elements, override selectors per variant:

```yaml
- type: browser
  id: demo
  url: "https://example.com"
  steps:
    - action: click
      selector: "button.desktop-nav-toggle"
      duration: 2
  selectorOverrides:
    mobile:
      "button.desktop-nav-toggle": ".mobile-hamburger-menu"
```

The desktop variant uses the original selector; the mobile variant swaps it out automatically.

## CLI

### `scenecaster render <script>`

Record and render the video.

```bash
scenecaster render tutorial.yaml
scenecaster render tutorial.yaml -o ./videos
scenecaster render tutorial.yaml --variant desktop
scenecaster render tutorial.yaml --only intro fill-details
scenecaster render tutorial.yaml --no-headless -v
scenecaster render tutorial.yaml --no-cache --no-thumbnail
```

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <dir>` | Where to write the MP4(s) | `./output` |
| `--variant <id>` | Render only one variant | all variants |
| `--only <ids...>` | Render only specific scene IDs | all scenes |
| `--no-headless` | Show the browser window (useful for debugging) | headless |
| `--no-cache` | Force re-recording (skip cached recordings) | cache enabled |
| `--no-thumbnail` | Skip thumbnail PNG generation | thumbnails on |
| `--tmp-dir <dir>` | Where to store intermediate recordings | system temp |
| `-v, --verbose` | Show detailed progress logs (including Remotion warnings) | off |

### `scenecaster preview <script>`

Open Remotion Studio for frame-by-frame preview without rendering.

```bash
scenecaster preview tutorial.yaml
scenecaster preview tutorial.yaml --variant mobile
```

Uses cached recordings where available. Browser scenes without cached recordings show placeholder frames.

| Option | Description | Default |
|--------|-------------|---------|
| `--variant <id>` | Preview a specific variant | first variant |

### `scenecaster validate <script>`

Check a script for errors without rendering anything. Fast way to catch typos.

```bash
scenecaster validate tutorial.yaml
# ✔ Valid script: "How to Add a Team Member"
#   Scenes: 4
#   Variants: desktop, mobile
#   FPS: 30
```

### `scenecaster init`

Generate a starter `.scenecaster.yaml` template.

```bash
scenecaster init --name onboarding-guide
# ✔ Created onboarding-guide.scenecaster.yaml
```

## Recording Cache

SceneCaster caches browser recordings to speed up re-renders. When you change a title card or tweak a caption, only the modified browser scenes get re-recorded.

The cache works by hashing each browser scene's configuration (URL, steps, viewport dimensions, CSS). If the hash matches a previous recording, the cached video is reused.

Cache entries expire after 24 hours and are automatically pruned on each render.

To force a fresh recording:

```bash
scenecaster render tutorial.yaml --no-cache
```

## Thumbnails

By default, SceneCaster generates a thumbnail PNG alongside each MP4. It captures a frame from the first title scene (about 1 second in, after spring animations have settled).

```yaml
output:
  thumbnail:
    enabled: true
    scene: intro           # Optional - capture from a specific scene
    frame: 45              # Optional - specific frame number
```

Disable with `--no-thumbnail` or `thumbnail.enabled: false`.

## API

Use SceneCaster programmatically in Node.js scripts, CI pipelines, or your own tools.

### Full pipeline

```typescript
import { parseScriptFile, runPipeline } from "scenecaster";

const script = parseScriptFile("tutorial.yaml");

const outputFiles = await runPipeline(script, {
  outputDir: "./videos",
  headless: true,
  // variantFilter: "desktop",  // Optional: render just one variant
  // onlyScenes: ["intro", "fill-details"],  // Optional: specific scenes
  // noCache: true,  // Optional: force re-recording
  // noThumbnail: true,  // Optional: skip thumbnail generation
});

console.log("Rendered:", outputFiles);
// ["./videos/how-to-add-a-team-member-desktop.mp4", "./videos/how-to-add-a-team-member-desktop-thumb.png"]
```

### Validation only

```typescript
import { validateScriptFile } from "scenecaster";

const result = validateScriptFile("tutorial.yaml");

if (result.valid) {
  console.log("Script is valid");
} else {
  console.error("Errors:", result.errors);
}
```

### Parse from string

```typescript
import { parseScriptString } from "scenecaster";

const yaml = `
meta:
  title: "Quick Demo"
scenes:
  - type: title
    id: intro
    duration: 3
    heading: "Hello World"
`;

const script = parseScriptString(yaml);
console.log(script.meta.title); // "Quick Demo"
```

### Generate a template

```typescript
import { generateTemplate } from "scenecaster";

const yaml = generateTemplate("my-tutorial");
// Returns a valid YAML string ready to write to a file
```

### Type-safe schema

The Zod schema is exported, so you can extend or compose it:

```typescript
import { ScriptSchema } from "scenecaster";

const result = ScriptSchema.safeParse(myData);
if (!result.success) {
  console.error(result.error.issues);
}
```

## Multi-Format Output

Define multiple variants to produce videos for different platforms from the same script:

```yaml
output:
  fps: 30
  variants:
    # YouTube / general purpose
    - id: desktop
      width: 1920
      height: 1080
      aspectRatio: "16:9"

    # YouTube Shorts / Instagram Reels / TikTok
    - id: mobile
      width: 1080
      height: 1920
      aspectRatio: "9:16"
      viewport:
        width: 390
        height: 693

    # Social media posts
    - id: square
      width: 1080
      height: 1080
      aspectRatio: "1:1"
      viewport:
        width: 540
        height: 540
```

Each variant records the browser at its own viewport dimensions, so responsive layouts adapt naturally. No letterboxing, no awkward crops.

Render just one when iterating:

```bash
scenecaster render tutorial.yaml --variant desktop
```

## Example

Here's a real-world script for a SaaS onboarding tutorial:

```yaml
meta:
  title: "How to Add a Team Member"
  globalCss: |
    .cookie-banner { display: none !important; }

brand:
  logo: "./assets/logo.png"
  primaryColor: "#1e40af"
  backgroundColor: "#0f172a"
  textColor: "#f8fafc"
  fontFamily: "Inter"

output:
  fps: 30
  transition:
    type: fade
    duration: 0.5
  thumbnail:
    enabled: true
  variants:
    - id: desktop
      width: 1920
      height: 1080
      aspectRatio: "16:9"
    - id: mobile
      width: 1080
      height: 1920
      aspectRatio: "9:16"
      viewport: { width: 390, height: 693 }

scenes:
  - type: title
    id: intro
    duration: 4
    heading: "Adding Team Members"
    subheading: "A step-by-step guide"
    transition:
      type: zoom
      duration: 0.6

  - type: browser
    id: navigate-to-team
    url: "https://demo.example.com/app/team-members"
    frame:
      style: macos
      showUrl: true
    cursor:
      enabled: true
      style: pointer
    steps:
      - action: navigate
        url: "https://demo.example.com/app/team-members"
        duration: 3
        waitFor: ".team-members-table"
        caption:
          text: "Navigate to Team Members"
          position: bottom
          style: bar
          animation: slideUp

      - action: click
        selector: "a[href*='team-members/create']"
        highlight: true
        duration: 2
        caption:
          text: "Click 'New team member' to get started"

  - type: browser
    id: fill-details
    url: "https://demo.example.com/app/team-members/create"
    frame:
      style: minimal
      darkMode: true
    cursor:
      enabled: true
    steps:
      - action: fill
        selector: "input[name='name']"
        value: "Jane Smith"
        typeSpeed: 80
        duration: 2
        caption:
          text: "Enter the team member's name"
          animation: fadeIn

      - action: fill
        selector: "input[name='role']"
        value: "Senior Developer"
        typeSpeed: 80
        duration: 2

      - action: scroll
        y: 300
        smooth: true
        duration: 1

      - action: click
        selector: "button[type='submit']"
        highlight: true
        duration: 3
        caption:
          text: "Save the new team member"
    transition:
      type: slide
      direction: left
      duration: 0.4

  - type: title
    id: outro
    duration: 4
    heading: "You're all set!"
    subheading: "Your team member has been added"
    variant: outro
```

## Error Messages

When something goes wrong during recording, SceneCaster provides actionable error messages instead of raw Playwright stack traces:

```
✖ Could not find element in scene "fill-details", step 2.
  Page URL: https://demo.example.com/app/team-members/create
  Suggestions:
    - Add a "waitFor" field to wait for the element to appear
    - Check that the selector matches an element on the page
    - Try running with --no-headless to see the browser
```

## Why SceneCaster?

**The problem:** Recording tutorial videos is tedious. Screen record, edit in Premiere/DaVinci, add captions manually, export, and then do it all over again when you change a button label.

**The fix:** Describe the tutorial as code. Record it automatically. Re-render whenever you want.

| Pain point | SceneCaster solution |
|-----------|---------------------|
| UI changed, video is outdated | Update the YAML, re-render |
| Need 16:9 and 9:16 versions | Define both as output variants |
| Captions are tedious to add | Inline captions in the script, auto-synced |
| Branding needs to be consistent | `brand` config applied to every video |
| "Can you make the font bigger?" | Change one line, re-render |
| New team member needs to make videos | Hand them the YAML format, not a video editor |
| Re-recording unchanged scenes is slow | Recording cache skips unchanged scenes |
| Cookie banners ruin the video | CSS injection hides them globally |

## Requirements

- **Node.js** >= 18
- **Chromium** for Playwright: `npx playwright install chromium`
- **FFmpeg** (usually pre-installed or bundled by Remotion)

## Remotion Licensing

SceneCaster uses [Remotion](https://remotion.dev) for video composition and rendering. Remotion's licensing depends on your team size:

- **Individuals and companies with 3 or fewer people**: Remotion is free under the [Remotion License](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
- **Companies with 4 or more people**: A [Remotion Company License](https://www.remotion.pro/license) is required. See [remotion.pro](https://www.remotion.pro) for pricing.

This applies to the total number of people in your company, not just those using SceneCaster. Check the [Remotion licensing FAQ](https://www.remotion.dev/docs/license) for full details.

## Tech Stack

| Tool | Role |
|------|------|
| [Playwright](https://playwright.dev) | Browser automation + viewport recording |
| [Remotion](https://remotion.dev) | React-based video composition + H.264 rendering |
| [Zod](https://zod.dev) | Script schema validation |
| [Commander](https://github.com/tj/commander.js) | CLI framework |
| TypeScript | Full type safety from script parsing to video rendering |

## Development

```bash
git clone https://github.com/Satal/scenecaster.git
cd scenecaster
npm install
npx playwright install chromium

# Run tests (194 of them)
npm test

# Type check
npm run lint

# Build
npm run build

# Watch mode
npm run dev
```

## Roadmap

- [ ] Authentication support (cookies, login steps, Playwright storage state)
- [ ] `hover` and `pressKey` actions
- [ ] Programmatic plugin system for custom actions
- [ ] Background music support
- [ ] Watch mode for rapid iteration
- [ ] GitHub Actions example for CI video generation

## Licence

MIT
