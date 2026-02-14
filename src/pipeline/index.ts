import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Script, OutputVariant } from "../schema/script.schema.js";
import type {
  CompositionProps,
  RecordingResult,
  SceneRenderData,
} from "./types.js";
import { recordBrowserScene } from "../recorder/index.js";
import { renderVideo } from "../renderer/render.js";
import { secondsToFrames, msToFrames } from "../utils/timing.js";
import type { Logger } from "../utils/logger.js";

export interface PipelineOptions {
  /** Directory to write output files */
  outputDir: string;
  /** Only render this variant (by ID). If omitted, renders all. */
  variantFilter?: string;
  /** Run browser in visible mode for debugging */
  headless?: boolean;
  /** Temporary directory for recordings */
  tmpDir?: string;
  logger?: Logger;
}

/**
 * Run the full pipeline: parse -> record -> compose -> render.
 * The script should already be parsed and validated.
 */
export async function runPipeline(
  script: Script,
  options: PipelineOptions
): Promise<string[]> {
  const {
    outputDir,
    variantFilter,
    headless = true,
    tmpDir,
    logger,
  } = options;

  const absoluteOutputDir = resolve(outputDir);
  mkdirSync(absoluteOutputDir, { recursive: true });

  // Filter variants
  const variants = variantFilter
    ? script.output.variants.filter((v) => v.id === variantFilter)
    : script.output.variants;

  if (variants.length === 0) {
    throw new Error(
      `No matching variant "${variantFilter}". Available: ${script.output.variants.map((v) => v.id).join(", ")}`
    );
  }

  const outputFiles: string[] = [];

  for (const variant of variants) {
    logger?.info(`Processing variant: ${variant.id} (${variant.width}x${variant.height})`);

    const outputPath = join(
      absoluteOutputDir,
      `${sanitizeFilename(script.meta.title)}-${variant.id}.mp4`
    );

    // Step 1: Record all browser scenes
    const recordings = await recordBrowserScenes(
      script,
      variant,
      { headless, tmpDir, logger }
    );

    // Step 2: Build composition props
    const compositionProps = buildCompositionProps(
      script,
      variant,
      recordings
    );

    // Step 3: Render with Remotion
    await renderVideo({
      outputPath,
      props: compositionProps,
      logger,
    });

    outputFiles.push(outputPath);
    logger?.success(`Output: ${outputPath}`);
  }

  return outputFiles;
}

/**
 * Record all browser scenes in a script for a given variant.
 */
async function recordBrowserScenes(
  script: Script,
  variant: OutputVariant,
  options: { headless?: boolean; tmpDir?: string; logger?: Logger }
): Promise<Map<string, RecordingResult>> {
  const recordings = new Map<string, RecordingResult>();

  const browserScenes = script.scenes.filter((s) => s.type === "browser");

  for (const scene of browserScenes) {
    if (scene.type !== "browser") continue;

    const spinner = options.logger?.spinner(
      `Recording scene "${scene.id}" for ${variant.id}...`
    );

    const result = await recordBrowserScene(scene, variant, {
      headless: options.headless,
      tmpDir: options.tmpDir,
      logger: options.logger,
    });

    recordings.set(scene.id, result);
    spinner?.succeed(
      `Recorded "${scene.id}" (${Math.round(result.durationMs / 1000)}s)`
    );
  }

  return recordings;
}

/**
 * Build the CompositionProps from script + recordings.
 */
export function buildCompositionProps(
  script: Script,
  variant: OutputVariant,
  recordings: Map<string, RecordingResult>
): CompositionProps {
  const fps = script.output.fps;

  const scenes: SceneRenderData[] = script.scenes.map((scene) => {
    if (scene.type === "title") {
      return {
        sceneId: scene.id,
        type: "title" as const,
        durationFrames: secondsToFrames(scene.duration, fps),
        heading: scene.heading,
        subheading: scene.subheading,
        titleVariant: scene.variant,
      };
    }

    // Browser scene
    const recording = recordings.get(scene.id);
    if (!recording) {
      throw new Error(`No recording found for scene "${scene.id}"`);
    }

    return {
      sceneId: scene.id,
      type: "browser" as const,
      durationFrames: msToFrames(recording.durationMs, fps),
      videoPath: recording.videoPath,
      timestamps: recording.timestamps,
    };
  });

  return {
    scenes,
    brand: script.brand,
    fps,
    width: variant.width,
    height: variant.height,
  };
}

export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
