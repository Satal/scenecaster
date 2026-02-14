import React from "react";
import {
  OffthreadVideo,
  Sequence,
  useVideoConfig,
} from "remotion";
import { Caption } from "../overlays/Caption.js";
import { fadeTransition } from "../transitions/index.js";
import { useCurrentFrame } from "remotion";
import type { ActionTimestamp } from "../../pipeline/types.js";
import { msToFrames } from "../../utils/timing.js";

export interface BrowserSceneProps {
  videoSrc: string;
  timestamps: ActionTimestamp[];
  durationFrames: number;
}

export const BrowserScene: React.FC<BrowserSceneProps> = ({
  videoSrc,
  timestamps,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const transitionFrames = Math.round(fps * 0.3);
  const opacity = fadeTransition(frame, durationFrames, transitionFrames);

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        opacity,
      }}
    >
      {/* Recorded browser video */}
      <OffthreadVideo
        src={videoSrc}
        style={{
          width,
          height,
          objectFit: "cover",
        }}
      />

      {/* Caption overlays synchronised to action timestamps */}
      {timestamps.map((ts, i) => {
        if (!ts.caption) return null;

        const startFrame = msToFrames(ts.startMs, fps);
        const captionDuration = msToFrames(ts.endMs - ts.startMs, fps);

        return (
          <Sequence
            key={`caption-${i}`}
            from={startFrame}
            durationInFrames={captionDuration}
          >
            <Caption
              text={ts.caption.text}
              position={ts.caption.position}
              style={ts.caption.style}
              animation={ts.caption.animation}
              startFrame={0}
              durationFrames={captionDuration}
            />
          </Sequence>
        );
      })}
    </div>
  );
};
