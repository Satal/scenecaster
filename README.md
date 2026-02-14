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

**3. Remotion composes everything** into a polished video: branded title cards with spring animations, the browser recording with synchronised caption overlays, smooth transitions between scenes, and a progress bar.

**4. Out comes an MP4** (H.264) at exactly the dimensions you specified.

Want a 16:9 for YouTube *and* a 9:16 for Shorts? Define both as variants. SceneCaster re-records at the right viewport size so your responsive layout does the work, then renders each one.

## Script Reference

A SceneCaster script is a YAML file with four sections:

### `meta` - Video metadata

```yaml
meta:
  title: "How to Create an Invoice"
```

### `brand` - Your visual identity

```yaml
brand:
  logo: "./assets/logo.png"      # Optional - shown on title/outro cards
  primaryColor: "#1e40af"         # Accent colour (captions, highlights, progress bar)
  backgroundColor: "#0f172a"      # Title card background
  textColor: "#f8fafc"            # Title card text
  fontFamily: "Inter"             # Font family
```

All fields have sensible defaults. You can omit the entire `brand` section if you're happy with the built-in dark theme.

### `output` - Render targets

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
```

| Variant | What it looks like |
|---------|-------------------|
| `main` | Large heading, accent line, logo, subheading. Your intro card. |
| `chapter` | "Next Step" label above the heading. For section breaks. |
| `minimal` | Just the heading. Clean and simple. |
| `outro` | Like `main` but intended as a closing card. |

All text animates in with spring physics (staggered heading, subheading, accent line). Scenes fade in and out automatically.

#### Browser Scenes

The main event. SceneCaster launches a real browser, navigates to your app, and executes steps while recording.

```yaml
- type: browser
  id: create-invoice
  url: "https://app.example.com/invoices"
  steps:
    - action: navigate
      url: "https://app.example.com/invoices"
      duration: 3
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
scenecaster render tutorial.yaml --no-headless -v
```

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <dir>` | Where to write the MP4(s) | `./output` |
| `--variant <id>` | Render only one variant | all variants |
| `--no-headless` | Show the browser window (useful for debugging) | headless |
| `--tmp-dir <dir>` | Where to store intermediate recordings | system temp |
| `-v, --verbose` | Show detailed progress logs | off |

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
});

console.log("Rendered:", outputFiles);
// ["./videos/how-to-add-a-team-member-desktop.mp4"]
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

brand:
  logo: "./assets/logo.png"
  primaryColor: "#1e40af"
  backgroundColor: "#0f172a"
  textColor: "#f8fafc"
  fontFamily: "Inter"

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
      viewport: { width: 390, height: 693 }

scenes:
  - type: title
    id: intro
    duration: 4
    heading: "Adding Team Members"
    subheading: "A step-by-step guide"

  - type: browser
    id: navigate-to-team
    url: "https://demo.example.com/app/team-members"
    steps:
      - action: navigate
        url: "https://demo.example.com/app/team-members"
        duration: 3
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

  - type: title
    id: outro
    duration: 4
    heading: "You're all set!"
    subheading: "Your team member has been added"
    variant: outro
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

## Requirements

- **Node.js** >= 18
- **Chromium** for Playwright: `npx playwright install chromium`
- **FFmpeg** (usually pre-installed or bundled by Remotion)

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

# Run tests (127 of them)
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
- [ ] `preview` command using Remotion Studio
- [ ] Google Fonts loading
- [ ] `hover` and `pressKey` actions
- [ ] Custom CSS injection (hide cookie banners, etc.)
- [ ] Programmatic plugin system for custom actions
- [ ] Background music support
- [ ] Watch mode for rapid iteration
- [ ] GitHub Actions example for CI video generation

## Licence

MIT
