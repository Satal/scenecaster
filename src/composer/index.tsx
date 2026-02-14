import React from "react";
import { Composition } from "remotion";
import { TutorialVideo } from "./compositions/TutorialVideo.js";
import type { CompositionProps } from "../pipeline/types.js";

/**
 * Remotion Root component.
 * This is the entry point for Remotion bundling.
 * Props are injected at render time by the pipeline.
 */
export const RemotionRoot: React.FC = () => {
  const defaultProps: CompositionProps = {
    scenes: [
      {
        sceneId: "preview-title",
        type: "title",
        durationFrames: 120,
        heading: "SceneCaster Preview",
        subheading: "This is a preview composition",
        titleVariant: "main",
      },
    ],
    brand: {
      primaryColor: "#1e40af",
      backgroundColor: "#0f172a",
      textColor: "#f8fafc",
      fontFamily: "Inter",
    },
    fps: 30,
    width: 1920,
    height: 1080,
  };

  const totalFrames = defaultProps.scenes.reduce(
    (sum, s) => sum + s.durationFrames,
    0
  );

  return (
    <Composition
      id="TutorialVideo"
      component={TutorialVideo as React.LazyExoticComponent<React.ComponentType<Record<string, unknown>>>}
      durationInFrames={totalFrames}
      fps={defaultProps.fps}
      width={defaultProps.width}
      height={defaultProps.height}
      defaultProps={defaultProps}
    />
  );
};
