import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { useTheme } from "../theme/ThemeProvider.js";

export interface ProgressBarProps {
  totalFrames: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ totalFrames }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();

  const progress = (frame / totalFrames) * 100;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          backgroundColor: theme.primaryColor,
          transition: "width 0.1s linear",
        }}
      />
    </div>
  );
};
