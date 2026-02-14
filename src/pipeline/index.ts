import { mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { tmpdir } from "node:os";
import type { Script, OutputVariant } from "../schema/script.schema.js";
import type {
  CompositionProps,
  RecordingResult,
  SceneRenderData,
} from "./types.js";
import { recordBrowserScene } from "../recorder/index.js";
import {
  computeSceneHash,
  getCachedRecording,
  saveToCache,
  pruneCache,
} from "../recorder/cache.js";
import { renderVideo } from "../renderer/render.js";
import { renderThumbnail } from "../renderer/thumbnail.js";
import { secondsToFrames, msToFrames } from "../utils/timing.js";
import type { Logger } from "../utils/logger.js";

export interface PipelineOptions {
  /** Directory to write output files */
  outputDir: string;
  /** Directory containing the script file (for resolving relative paths like logo) */
  scriptDir?: string;
  /** Only render this variant (by ID). If omitted, renders all. */
  variantFilter?: string;
  /** Only render these scene IDs. If omitted, renders all. */
  onlyScenes?: string[];
  /** Run browser in visible mode for debugging */
  headless?: boolean;
  /** Temporary directory for recordings */
  tmpDir?: string;
  /** Disable recording cache, force re-recording */
  noCache?: boolean;
  /** Disable thumbnail generation */
  noThumbnail?: boolean;
  /** Show all warnings including suppressed noise */
  verbose?: boolean;
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
    scriptDir,
    variantFilter,
    onlyScenes,
    headless = true,
    tmpDir,
    noCache = false,
    noThumbnail = false,
    verbose = false,
    logger,
  } = options;

  const absoluteOutputDir = resolve(outputDir);
  mkdirSync(absoluteOutputDir, { recursive: true });

  // Prune stale cache entries
  if (!noCache) {
    pruneCache();
  }

  // Filter variants
  const variants = variantFilter
    ? script.output.variants.filter((v) => v.id === variantFilter)
    : script.output.variants;

  if (variants.length === 0) {
    throw new Error(
      `No matching variant "${variantFilter}". Available: ${script.output.variants.map((v) => v.id).join(", ")}`
    );
  }

  // Filter scenes by --only flag
  let filteredScript = script;
  if (onlyScenes && onlyScenes.length > 0) {
    const allIds = script.scenes.map((s) => s.id);
    const invalid = onlyScenes.filter((id) => !allIds.includes(id));
    if (invalid.length > 0) {
      throw new Error(
        `Scene ID(s) not found: ${invalid.join(", ")}. Available: ${allIds.join(", ")}`
      );
    }
    filteredScript = {
      ...script,
      scenes: script.scenes.filter((s) => onlyScenes.includes(s.id)),
    };
  }

  const outputFiles: string[] = [];

  for (const variant of variants) {
    logger?.info(`Processing variant: ${variant.id} (${variant.width}x${variant.height})`);

    // Build output filename (append scene IDs if filtering)
    const nameParts = [sanitizeFilename(script.meta.title)];
    if (onlyScenes && onlyScenes.length > 0) {
      nameParts.push(...onlyScenes.map(sanitizeFilename));
    }
    nameParts.push(variant.id);
    const outputPath = join(absoluteOutputDir, `${nameParts.join("-")}.mp4`);

    // Resolve auth storage state path relative to script directory
    const storageState = script.meta.auth?.storageState
      ? resolve(scriptDir ?? process.cwd(), script.meta.auth.storageState)
      : undefined;

    if (storageState && !existsSync(storageState)) {
      throw new Error(
        `Auth storage state file not found: ${storageState}\n` +
        `Run "scenecaster auth <url> --save <path>" to create one.`
      );
    }

    // Step 1: Record all browser scenes
    const recordings = await recordBrowserScenes(
      filteredScript,
      variant,
      { headless, tmpDir, noCache, globalCss: script.meta.globalCss, storageState, logger }
    );

    // Step 2: Copy recordings to a public dir that Remotion can serve
    const publicDir = join(
      tmpDir ?? join(tmpdir(), "scenecaster"),
      "public",
      variant.id
    );
    mkdirSync(publicDir, { recursive: true });

    const publicRecordings = copyRecordingsToPublicDir(recordings, publicDir);

    // Step 2b: Copy brand logo to public dir if it exists
    let resolvedBrand = filteredScript.brand;
    if (filteredScript.brand.logo) {
      const logoSource = resolve(scriptDir ?? process.cwd(), filteredScript.brand.logo);
      if (existsSync(logoSource)) {
        const logoFilename = basename(logoSource);
        const logoDest = join(publicDir, logoFilename);
        copyFileSync(logoSource, logoDest);
        resolvedBrand = { ...filteredScript.brand, logo: logoFilename };
      } else {
        logger?.warn(`Logo not found: ${logoSource}`);
      }
    }

    // Step 3: Build composition props (using staticFile references)
    const scriptWithResolvedBrand = { ...filteredScript, brand: resolvedBrand };
    const compositionProps = buildCompositionProps(
      scriptWithResolvedBrand,
      variant,
      publicRecordings
    );

    // Step 4: Render with Remotion
    await renderVideo({
      outputPath,
      props: compositionProps,
      publicDir,
      verbose,
      logger,
    });

    outputFiles.push(outputPath);
    logger?.success(`Output: ${outputPath}`);

    // Step 5: Generate thumbnail if enabled
    const thumbnailConfig = script.output.thumbnail;
    const thumbnailEnabled = !noThumbnail && thumbnailConfig?.enabled !== false;
    if (thumbnailEnabled) {
      const thumbPath = outputPath.replace(/\.mp4$/, "-thumb.png");
      await renderThumbnail({
        outputPath: thumbPath,
        props: compositionProps,
        publicDir,
        scene: thumbnailConfig?.scene,
        frame: thumbnailConfig?.frame,
        logger,
      });
      outputFiles.push(thumbPath);
    }
  }

  return outputFiles;
}

/**
 * Copy recorded video files into a public directory and return updated recordings
 * with filenames suitable for Remotion's staticFile().
 */
function copyRecordingsToPublicDir(
  recordings: Map<string, RecordingResult>,
  publicDir: string
): Map<string, RecordingResult> {
  const updated = new Map<string, RecordingResult>();

  for (const [id, recording] of recordings) {
    const filename = `${id}.webm`;
    const destPath = join(publicDir, filename);
    copyFileSync(recording.videoPath, destPath);

    updated.set(id, {
      ...recording,
      videoPath: filename, // Just the filename - Remotion serves it via staticFile()
    });
  }

  return updated;
}

/**
 * Record all browser scenes in a script for a given variant.
 */
async function recordBrowserScenes(
  script: Script,
  variant: OutputVariant,
  options: { headless?: boolean; tmpDir?: string; noCache?: boolean; globalCss?: string; storageState?: string; logger?: Logger }
): Promise<Map<string, RecordingResult>> {
  const recordings = new Map<string, RecordingResult>();

  const browserScenes = script.scenes.filter((s) => s.type === "browser");

  for (const scene of browserScenes) {
    if (scene.type !== "browser") continue;

    // Check cache first
    if (!options.noCache) {
      const hash = computeSceneHash(scene, variant);
      const cached = getCachedRecording(hash);
      if (cached) {
        options.logger?.info(`Cache hit for scene "${scene.id}" (${variant.id})`);
        recordings.set(scene.id, cached);
        continue;
      }
    }

    const spinner = options.logger?.spinner(
      `Recording scene "${scene.id}" for ${variant.id}...`
    );

    const result = await recordBrowserScene(scene, variant, {
      headless: options.headless,
      tmpDir: options.tmpDir,
      globalCss: options.globalCss,
      storageState: options.storageState,
      logger: options.logger,
    });

    // Save to cache
    if (!options.noCache) {
      const hash = computeSceneHash(scene, variant);
      saveToCache(hash, result);
    }

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

  const globalTransition = script.output.transition;

  const scenes: SceneRenderData[] = script.scenes.map((scene) => {
    // Per-scene transition overrides global default
    const transition = scene.transition ?? globalTransition;

    if (scene.type === "title") {
      return {
        sceneId: scene.id,
        type: "title" as const,
        durationFrames: secondsToFrames(scene.duration, fps),
        heading: scene.heading,
        subheading: scene.subheading,
        titleVariant: scene.variant,
        transition,
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
      url: scene.url,
      cursorConfig: scene.cursor,
      frameConfig: scene.frame,
      transition,
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
