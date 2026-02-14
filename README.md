# SceneCaster

Generate professional tutorial videos from YAML scripts using Playwright and Remotion.

**Pipeline:** YAML Script → Playwright Recording → Remotion Composition → MP4 Output

## Quick Start

```bash
# Install
npm install scenecaster

# Create a starter script
npx scenecaster init --name my-tutorial

# Validate the script
npx scenecaster validate my-tutorial.scenecaster.yaml

# Render the video
npx scenecaster render my-tutorial.scenecaster.yaml -o ./videos
```

## Script Format

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

scenes:
  - type: title
    id: intro
    duration: 4
    heading: "Adding Team Members"
    subheading: "A step-by-step guide"

  - type: browser
    id: add-member
    url: "https://example.com/team"
    steps:
      - action: navigate
        url: "https://example.com/team"
        duration: 3
        caption:
          text: "Navigate to Team Members"
          position: bottom
          style: bar
          animation: slideUp

      - action: click
        selector: "button:has-text('New')"
        highlight: true
        duration: 2

      - action: fill
        selector: "#name"
        value: "Jane Smith"
        typeSpeed: 80
        duration: 2

  - type: title
    id: outro
    duration: 3
    heading: "All done!"
    variant: outro
```

## CLI Commands

```bash
scenecaster render <script> [options]    # Render video from script
scenecaster validate <script>            # Validate script without rendering
scenecaster init [--name <name>]         # Create starter template
```

### Render Options

| Flag | Description | Default |
|------|-------------|---------|
| `-o, --output <dir>` | Output directory | `./output` |
| `--variant <id>` | Only render specific variant | all |
| `--no-headless` | Show browser during recording | headless |
| `--tmp-dir <dir>` | Temp directory for recordings | system tmp |
| `-v, --verbose` | Detailed progress output | false |

## Actions

| Action | Description |
|--------|-------------|
| `navigate` | Go to a URL |
| `click` | Click an element (with optional highlight) |
| `fill` | Type text into an input field |
| `scroll` | Scroll the page or to an element |
| `wait` | Pause for a specified duration |

## Caption Styles

- **bar** - Full-width coloured bar
- **bubble** - Rounded box with border
- **subtitle** - Semi-transparent dark background
- **pill** - Rounded pill shape

## Caption Animations

- **slideUp** - Slides up from below
- **fadeIn** - Simple fade in
- **typewriter** - Characters appear one by one
- **none** - No animation

## Programmatic API

```typescript
import { parseScriptFile, runPipeline } from "scenecaster";

const script = parseScriptFile("tutorial.yaml");

const outputs = await runPipeline(script, {
  outputDir: "./videos",
  headless: true,
});

console.log("Rendered:", outputs);
```

## Requirements

- Node.js >= 18
- Playwright browsers (`npx playwright install chromium`)

## License

MIT
