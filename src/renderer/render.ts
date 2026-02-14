import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { CompositionProps } from "../pipeline/types.js";
import type { Logger } from "../utils/logger.js";

export interface RenderOptions {
  outputPath: string;
  props: CompositionProps;
  logger?: Logger;
}

/**
 * Bundle the Remotion composition and render to MP4.
 */
export async function renderVideo(options: RenderOptions): Promise<string> {
  const { outputPath, props, logger } = options;

  const spinner = logger?.spinner("Bundling Remotion composition...");

  // Bundle the Remotion entry point
  const bundlePath = await bundle({
    entryPoint: path.resolve(
      new URL(import.meta.url).pathname,
      "../../composer/index.tsx"
    ),
    // Webpack override to handle .tsx
    webpackOverride: (config) => config,
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
