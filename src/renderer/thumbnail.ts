import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import type { CompositionProps } from "../pipeline/types.js";
import type { Logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ThumbnailOptions {
  outputPath: string;
  props: CompositionProps;
  publicDir?: string;
  /** Which scene to use for thumbnail (default: first title scene) */
  scene?: string;
  /** Which frame to capture (default: ~1 second in) */
  frame?: number;
  logger?: Logger;
}

/**
 * Render a still PNG thumbnail from the composition.
 */
export async function renderThumbnail(
  options: ThumbnailOptions
): Promise<string> {
  const { outputPath, props, publicDir, logger } = options;

  const spinner = logger?.spinner("Generating thumbnail...");

  const projectRoot = findProjectRoot(__dirname);
  const entryPoint = path.join(projectRoot, "src", "composer", "index.tsx");

  const bundlePath = await bundle({
    entryPoint,
    publicDir: publicDir ?? null,
    webpackOverride: (config) => ({
      ...config,
      resolve: {
        ...config.resolve,
        extensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".cjs", ".json"],
        extensionAlias: {
          ".js": [".tsx", ".ts", ".jsx", ".js"],
        },
      },
    }),
  });

  const totalFrames = props.scenes.reduce(
    (sum, s) => sum + s.durationFrames,
    0
  );

  const composition = await selectComposition({
    serveUrl: bundlePath,
    id: "TutorialVideo",
    inputProps: props,
  });

  const compositionWithProps = {
    ...composition,
    width: props.width,
    height: props.height,
    fps: props.fps,
    durationInFrames: totalFrames,
  };

  // Determine which frame to capture
  const thumbnailFrame = options.frame ?? selectThumbnailFrame(props);

  await renderStill({
    composition: compositionWithProps,
    serveUrl: bundlePath,
    output: outputPath,
    inputProps: props,
    frame: thumbnailFrame,
  });

  spinner?.succeed(`Thumbnail: ${outputPath}`);

  return outputPath;
}

/**
 * Select a good frame for the thumbnail.
 * Picks ~1 second into the first title scene (after spring animations settle).
 */
function selectThumbnailFrame(props: CompositionProps): number {
  let frameOffset = 0;

  for (const scene of props.scenes) {
    if (scene.type === "title") {
      // 1 second into the title scene
      return frameOffset + Math.min(props.fps, scene.durationFrames - 1);
    }
    frameOffset += scene.durationFrames;
  }

  // No title scene found, use frame 0
  return 0;
}

function findProjectRoot(startDir: string): string {
  let dir = startDir;
  while (dir !== path.dirname(dir)) {
    if (existsSync(path.join(dir, "package.json"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  throw new Error("Could not find project root (no package.json found)");
}
