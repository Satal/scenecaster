import React from "react";
import { Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { ThemeProvider, type ThemeConfig } from "../theme/ThemeProvider.js";
import { TitleScene } from "../scenes/TitleScene.js";
import { BrowserScene } from "../scenes/BrowserScene.js";
import { ProgressBar } from "../overlays/ProgressBar.js";
import { FontLoader } from "../fonts/FontLoader.js";
import { applyTransition } from "../transitions/index.js";
import type { CompositionProps, SceneRenderData } from "../../pipeline/types.js";
import type { Transition } from "../../schema/script.schema.js";
import type { SlideDirection } from "../transitions/index.js";

export const TutorialVideo: React.FC<CompositionProps> = ({
  scenes,
  brand,
  fps,
  width,
  height,
}) => {
  const totalFrames = scenes.reduce((sum, s) => sum + s.durationFrames, 0);

  let currentFrame = 0;

  return (
    <FontLoader fontFamily={brand.fontFamily}>
    <ThemeProvider theme={brand as ThemeConfig}>
      <div
        style={{
          width,
          height,
          backgroundColor: brand.backgroundColor,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {scenes.map((scene) => {
          const from = currentFrame;
          currentFrame += scene.durationFrames;

          return (
            <Sequence
              key={scene.sceneId}
              from={from}
              durationInFrames={scene.durationFrames}
            >
              <SceneWrapper
                transition={scene.transition}
                durationFrames={scene.durationFrames}
              >
                {scene.type === "title" ? (
                  <TitleScene
                    heading={scene.heading ?? ""}
                    subheading={scene.subheading}
                    variant={
                      scene.titleVariant as
                        | "main"
                        | "chapter"
                        | "minimal"
                        | "outro"
                    }
                    durationFrames={scene.durationFrames}
                  />
                ) : (
                  <BrowserScene
                    videoSrc={scene.videoPath ?? ""}
                    timestamps={scene.timestamps ?? []}
                    durationFrames={scene.durationFrames}
                    url={scene.url}
                    cursorConfig={scene.cursorConfig}
                    frameConfig={scene.frameConfig}
                  />
                )}
              </SceneWrapper>
            </Sequence>
          );
        })}

        {/* Global progress bar */}
        <ProgressBar totalFrames={totalFrames} />
      </div>
    </ThemeProvider>
    </FontLoader>
  );
};

/**
 * Wraps a scene with the configured transition effect.
 * Falls back to default fade if no transition is specified.
 */
const SceneWrapper: React.FC<{
  transition?: Transition;
  durationFrames: number;
  children: React.ReactNode;
}> = ({ transition, durationFrames, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Default to fade if no transition configured
  const type = transition?.type ?? "fade";
  const duration = transition?.duration ?? 0.5;
  const direction = transition?.direction as SlideDirection | undefined;
  const transitionFrames = Math.round(fps * duration);

  const style = applyTransition(
    type,
    frame,
    durationFrames,
    transitionFrames,
    direction
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        opacity: style.opacity,
        transform: style.transform,
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      {children}
    </div>
  );
};
