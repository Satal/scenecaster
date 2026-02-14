import React from "react";
import {
  OffthreadVideo,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { Caption } from "../overlays/Caption.js";
import { Cursor } from "../overlays/Cursor.js";
import { BrowserFrame } from "../overlays/BrowserFrame.js";
import { fadeTransition } from "../transitions/index.js";
import { useCurrentFrame } from "remotion";
import type { ActionTimestamp } from "../../pipeline/types.js";
import type { CursorConfig, FrameConfig } from "../../schema/script.schema.js";
import { msToFrames } from "../../utils/timing.js";

export interface BrowserSceneProps {
  videoSrc: string;
  timestamps: ActionTimestamp[];
  durationFrames: number;
  url?: string;
  cursorConfig?: CursorConfig;
  frameConfig?: FrameConfig;
}

export const BrowserScene: React.FC<BrowserSceneProps> = ({
  videoSrc,
  timestamps,
  durationFrames,
  url,
  cursorConfig,
  frameConfig,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const transitionFrames = Math.round(fps * 0.3);
  const opacity = fadeTransition(frame, durationFrames, transitionFrames);

  const videoAndCursor = (
    <div style={{ width, height, position: "relative" }}>
      <OffthreadVideo
        src={staticFile(videoSrc)}
        style={{
          width,
          height,
          objectFit: "cover",
        }}
      />

      {cursorConfig && (
        <Cursor
          timestamps={timestamps}
          config={cursorConfig}
          durationFrames={durationFrames}
        />
      )}
    </div>
  );

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        opacity,
      }}
    >
      {frameConfig && frameConfig.style !== "none" ? (
        <BrowserFrame
          config={frameConfig}
          url={url}
          width={width}
          height={height}
        >
          {videoAndCursor}
        </BrowserFrame>
      ) : (
        videoAndCursor
      )}

      {/* Captions rendered outside the frame so they aren't clipped */}
      {timestamps.map((ts, i) => {
        if (!ts.caption) return null;

        const startFrame = msToFrames(ts.startMs, fps);
        const captionDuration = Math.max(1, msToFrames(ts.endMs - ts.startMs, fps));

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
