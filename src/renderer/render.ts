import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { CompositionProps } from "../pipeline/types.js";
import type { Logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface RenderOptions {
  outputPath: string;
  props: CompositionProps;
  /** Directory containing video assets that Remotion should serve */
  publicDir?: string;
  logger?: Logger;
}

/**
 * Bundle the Remotion composition and render to MP4.
 */
export async function renderVideo(options: RenderOptions): Promise<string> {
  const { outputPath, props, publicDir, logger } = options;

  const spinner = logger?.spinner("Bundling Remotion composition...");

  // Find the project root (where package.json lives) by walking up from __dirname.
  // At runtime __dirname is either dist/renderer or src/renderer.
  const projectRoot = findProjectRoot(__dirname);
  const entryPoint = path.join(projectRoot, "src", "composer", "index.tsx");

  // Bundle the Remotion entry point.
  // The source uses .js extensions in imports (TypeScript ESM convention),
  // but Webpack needs to resolve those to .tsx/.ts source files.
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

  spinner?.succeed("Bundled Remotion composition");

  // Calculate total duration
  const totalFrames = props.scenes.reduce(
    (sum, s) => sum + s.durationFrames,
    0
  );

  // Select the composition
  const composition = await selectComposition({
    serveUrl: bundlePath,
    id: "TutorialVideo",
    inputProps: props,
  });

  // Override composition settings with our actual values
  const compositionWithProps = {
    ...composition,
    width: props.width,
    height: props.height,
    fps: props.fps,
    durationInFrames: totalFrames,
  };

  const renderSpinner = logger?.spinner(
    `Rendering ${totalFrames} frames at ${props.fps}fps...`
  );

  // Render to MP4
  await renderMedia({
    composition: compositionWithProps,
    serveUrl: bundlePath,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: props,
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100);
      if (renderSpinner) {
        renderSpinner.text = `Rendering... ${pct}%`;
      }
    },
  });

  renderSpinner?.succeed(`Rendered to ${outputPath}`);

  return outputPath;
}

/**
 * Walk up from a directory to find the project root (contains package.json).
 */
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
