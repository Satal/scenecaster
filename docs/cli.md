# CLI Reference

SceneCaster provides five commands for the full workflow: rendering, previewing, validating, authenticating, and scaffolding.

## `scenecaster render <script>`

Record and render the video.

```bash
scenecaster render tutorial.yaml
scenecaster render tutorial.yaml -o ./videos
scenecaster render tutorial.yaml --variant desktop
scenecaster render tutorial.yaml --only intro fill-details
scenecaster render tutorial.yaml --no-headless -v
scenecaster render tutorial.yaml --no-cache --no-thumbnail
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <dir>` | Where to write the MP4(s) | `./output` |
| `--variant <id>` | Render only one variant | All variants |
| `--only <ids...>` | Render only specific scene IDs | All scenes |
| `--no-headless` | Show the browser window (useful for debugging) | Headless |
| `--no-cache` | Force re-recording (skip [cached recordings](features/recording-cache.md)) | Cache enabled |
| `--no-thumbnail` | Skip [thumbnail](features/thumbnails.md) PNG generation | Thumbnails on |
| `--tmp-dir <dir>` | Where to store intermediate recordings | System temp |
| `-v, --verbose` | Show detailed progress logs (including Remotion warnings) | Off |

### Examples

```bash
# Render all variants to default output directory
scenecaster render tutorial.yaml

# Render only the desktop variant to a custom directory
scenecaster render tutorial.yaml -o ./videos --variant desktop

# Render specific scenes (useful for iterating on one part)
scenecaster render tutorial.yaml --only intro fill-details

# Debug recording issues with visible browser and verbose logs
scenecaster render tutorial.yaml --no-headless -v

# Force fresh recordings (ignore cache)
scenecaster render tutorial.yaml --no-cache
```

## `scenecaster preview <script>`

Open Remotion Studio for frame-by-frame preview without rendering. Uses cached recordings where available. Browser scenes without cached recordings show placeholder frames.

```bash
scenecaster preview tutorial.yaml
scenecaster preview tutorial.yaml --variant mobile
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--variant <id>` | Preview a specific variant | First variant |

## `scenecaster validate <script>`

Check a script for errors without rendering anything. Fast way to catch typos and schema issues.

```bash
scenecaster validate tutorial.yaml
```

### Output

```
✔ Valid script: "How to Add a Team Member"
  Scenes: 4
  Variants: desktop, mobile
  FPS: 30
```

If validation fails, you'll see specific error messages pointing to the problem. See [Error Messages](error-messages.md) for common issues.

## `scenecaster auth <url>`

Log in to a website interactively and save the session for [authenticated recording](features/authenticated-recording.md).

```bash
scenecaster auth https://app.example.com/login --save ./auth.json
```

A visible browser window opens at the URL. Log in manually, then close the tab. SceneCaster saves the cookies and localStorage to a JSON file that you reference in your script's `meta.auth.storageState`.

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-s, --save <path>` | Where to save the storage state JSON | `./auth.json` |

## `scenecaster init`

Generate a starter `.scenecaster.yaml` template.

```bash
scenecaster init --name onboarding-guide
# ✔ Created onboarding-guide.scenecaster.yaml
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--name <name>` | Name for the script file (without extension) | `"my-video"` |

The generated template includes a title scene and a browser scene with example steps, ready to customise.

---

[Back to Index](INDEX.md) | [API Reference](api.md)
