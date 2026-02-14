import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import type { Script, OutputVariant } from "./schema/script.schema.js";
import { buildCompositionProps } from "./pipeline/index.js";
import {
  computeSceneHash,
  getCachedRecording,
} from "./recorder/cache.js";
import type { RecordingResult } from "./pipeline/types.js";
import type { Logger } from "./utils/logger.js";

export interface PreviewOptions {
  variantFilter?: string;
  logger?: Logger;
}

/**
 * Launch Remotion Studio for frame-by-frame preview.
 * Uses cached recordings where available.
 */
export async function launchPreview(
  script: Script,
  options: PreviewOptions = {}
): Promise<void> {
  const { variantFilter, logger } = options;

  // Select variant
  const variants = variantFilter
    ? script.output.variants.filter((v) => v.id === variantFilter)
    : script.output.variants;

  if (variants.length === 0) {
    throw new Error(
      `No matching variant "${variantFilter}". Available: ${script.output.variants.map((v) => v.id).join(", ")}`
    );
  }

  const variant = variants[0];
  logger?.info(`Preview variant: ${variant.id}`);

  // Build recordings map from cache
  const recordings = loadCachedRecordings(script, variant, logger);

  // Build composition props
  const tmpDir = join(tmpdir(), "scenecaster", "preview");
  mkdirSync(tmpDir, { recursive: true });

  const compositionProps = buildCompositionProps(script, variant, recordings);

  // Write props to temp file for Remotion Studio
  const propsPath = join(tmpDir, "preview-props.json");
  writeFileSync(propsPath, JSON.stringify(compositionProps, null, 2));

  logger?.success("Starting Remotion Studio...");
  logger?.info(`Props: ${propsPath}`);

  // Launch Remotion Studio
  const studio = spawn(
    "npx",
    ["remotion", "studio", "--props", propsPath],
    {
      stdio: "inherit",
      cwd: process.cwd(),
      env: { ...process.env },
    }
  );

  // Handle clean shutdown
  const cleanup = () => {
    studio.kill("SIGTERM");
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  await new Promise<void>((resolve) => {
    studio.on("close", () => resolve());
  });
}

/**
 * Load cached recordings for browser scenes.
 * Returns a map with placeholder data for scenes without cache.
 */
function loadCachedRecordings(
  script: Script,
  variant: OutputVariant,
  logger?: Logger
): Map<string, RecordingResult> {
  const recordings = new Map<string, RecordingResult>();

  for (const scene of script.scenes) {
    if (scene.type !== "browser") continue;

    const hash = computeSceneHash(scene, variant);
    const cached = getCachedRecording(hash);

    if (cached) {
      logger?.info(`Cache hit for scene "${scene.id}"`);
      recordings.set(scene.id, cached);
    } else {
      logger?.warn(
        `No cached recording for scene "${scene.id}" - using placeholder`
      );
      // Create placeholder recording data
      const totalStepDuration = scene.steps.reduce(
        (sum, s) => sum + s.duration * 1000,
        0
      );
      recordings.set(scene.id, {
        sceneId: scene.id,
        variantId: variant.id,
        videoPath: "placeholder.webm",
        durationMs: totalStepDuration,
        timestamps: scene.steps.map((step, i) => ({
          stepIndex: i,
          startMs: scene.steps.slice(0, i).reduce((s, st) => s + st.duration * 1000, 0),
          endMs: scene.steps.slice(0, i + 1).reduce((s, st) => s + st.duration * 1000, 0),
          caption: step.caption,
        })),
      });
    }
  }

  return recordings;
}
