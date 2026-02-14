# API Reference

Use SceneCaster programmatically in Node.js scripts, CI pipelines, or your own tools.

## Installation

```bash
npm install scenecaster
```

## Functions

### `runPipeline(script, options)`

Run the full pipeline: record browser scenes, compose with Remotion, render to MP4.

```typescript
import { parseScriptFile, runPipeline } from "scenecaster";

const script = parseScriptFile("tutorial.yaml");

const outputFiles = await runPipeline(script, {
  outputDir: "./videos",
  headless: true,
  // variantFilter: "desktop",       // Optional: render just one variant
  // onlyScenes: ["intro", "fill"],  // Optional: specific scenes
  // noCache: true,                  // Optional: force re-recording
  // noThumbnail: true,              // Optional: skip thumbnail generation
});

console.log("Rendered:", outputFiles);
// ["./videos/how-to-add-a-team-member-desktop.mp4",
//  "./videos/how-to-add-a-team-member-desktop-thumb.png"]
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `outputDir` | string | `"./output"` | Directory for output files. |
| `headless` | boolean | `true` | Run browser in headless mode. |
| `variantFilter` | string | `undefined` | Render only this variant ID. |
| `onlyScenes` | string[] | `undefined` | Render only these scene IDs. |
| `noCache` | boolean | `false` | Force re-recording of all browser scenes. |
| `noThumbnail` | boolean | `false` | Skip thumbnail generation. |
| `tmpDir` | string | System temp | Directory for intermediate recordings. |
| `verbose` | boolean | `false` | Enable detailed logging. |

#### Returns

`Promise<string[]>` - Array of output file paths (MP4s and thumbnails).

### `parseScriptFile(path)`

Parse and validate a YAML script file. Throws if the script is invalid.

```typescript
import { parseScriptFile } from "scenecaster";

const script = parseScriptFile("tutorial.yaml");
console.log(script.meta.title); // "How to Add a Team Member"
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `path` | string | Path to the `.scenecaster.yaml` file. |

#### Returns

A validated script object matching the `ScriptSchema` type.

### `parseScriptString(yaml)`

Parse and validate a YAML string. Useful when generating scripts dynamically.

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

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `yaml` | string | YAML string to parse. |

#### Returns

A validated script object matching the `ScriptSchema` type.

### `validateScriptFile(path)`

Validate a script file without parsing it into a full object. Returns a result object instead of throwing.

```typescript
import { validateScriptFile } from "scenecaster";

const result = validateScriptFile("tutorial.yaml");

if (result.valid) {
  console.log("Script is valid");
} else {
  console.error("Errors:", result.errors);
}
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `path` | string | Path to the `.scenecaster.yaml` file. |

#### Returns

`{ valid: boolean, errors?: ZodIssue[] }`

### `generateTemplate(name)`

Generate a starter YAML template string.

```typescript
import { generateTemplate } from "scenecaster";

const yaml = generateTemplate("my-tutorial");
// Returns a valid YAML string ready to write to a file
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Name for the video (used in `meta.title`). |

#### Returns

`string` - A valid YAML script template.

### `ScriptSchema`

The Zod schema is exported for type-safe validation and extension.

```typescript
import { ScriptSchema } from "scenecaster";

const result = ScriptSchema.safeParse(myData);
if (!result.success) {
  console.error(result.error.issues);
}
```

## CI Pipeline Example

```typescript
import { parseScriptFile, runPipeline } from "scenecaster";

async function renderAllTutorials() {
  const scripts = ["onboarding.yaml", "billing.yaml", "settings.yaml"];

  for (const file of scripts) {
    const script = parseScriptFile(file);
    await runPipeline(script, {
      outputDir: "./dist/videos",
      headless: true,
      verbose: true,
    });
  }
}

renderAllTutorials();
```

---

[Back to Index](INDEX.md) | [CLI Reference](cli.md) | [Examples](examples.md)
