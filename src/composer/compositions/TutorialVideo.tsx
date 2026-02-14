import React from "react";
import { Sequence } from "remotion";
import { ThemeProvider, type ThemeConfig } from "../theme/ThemeProvider.js";
import { TitleScene } from "../scenes/TitleScene.js";
import { BrowserScene } from "../scenes/BrowserScene.js";
import { ProgressBar } from "../overlays/ProgressBar.js";
import type { CompositionProps, SceneRenderData } from "../../pipeline/types.js";

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
                />
              )}
            </Sequence>
          );
        })}

        {/* Global progress bar */}
        <ProgressBar totalFrames={totalFrames} />
      </div>
    </ThemeProvider>
  );
};
