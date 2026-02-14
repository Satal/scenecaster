import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useTheme } from "../theme/ThemeProvider.js";
import type {
  CaptionPosition,
  CaptionStyle,
  CaptionAnimation,
} from "../../schema/script.schema.js";

export interface CaptionProps {
  text: string;
  position: CaptionPosition;
  style: CaptionStyle;
  animation: CaptionAnimation;
  startFrame: number;
  durationFrames: number;
}

export const Caption: React.FC<CaptionProps> = ({
  text,
  position,
  style,
  animation,
  startFrame,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();

  const relativeFrame = frame - startFrame;

  // Don't render if outside time range
  if (relativeFrame < 0 || relativeFrame > durationFrames) return null;

  // Animation calculations
  const animationProgress = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 200, mass: 0.5, stiffness: 200 },
  });

  // Fade out at end
  const fadeOut = interpolate(
    relativeFrame,
    [durationFrames - fps * 0.3, durationFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Position styles
  const positionStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    ...(position === "top" && { top: 40 }),
    ...(position === "bottom" && { bottom: 40 }),
    ...(position === "center" && {
      top: "50%",
      transform: "translateY(-50%)",
    }),
  };

  // Style variants
  const captionStyle = getCaptionStyle(style, theme);

  // Animation transforms
  const animStyle = getAnimationStyle(animation, animationProgress, fadeOut);

  return (
    <div style={positionStyle}>
      <div
        style={{
          ...captionStyle,
          ...animStyle,
          fontFamily: theme.fontFamily,
          maxWidth: "80%",
          textAlign: "center",
        }}
      >
        {animation === "typewriter"
          ? text.slice(0, Math.floor(text.length * animationProgress))
          : text}
      </div>
    </div>
  );
};

function getCaptionStyle(
  style: CaptionStyle,
  theme: { primaryColor: string; textColor: string; backgroundColor: string }
): React.CSSProperties {
  const base: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 600,
    lineHeight: 1.4,
  };

  switch (style) {
    case "bar":
      return {
        ...base,
        backgroundColor: `${theme.primaryColor}ee`,
        color: theme.textColor,
        padding: "16px 32px",
        borderRadius: 0,
        width: "100%",
        maxWidth: "100%",
      };
    case "bubble":
      return {
        ...base,
        backgroundColor: `${theme.backgroundColor}dd`,
        color: theme.textColor,
        padding: "12px 24px",
        borderRadius: 16,
        border: `2px solid ${theme.primaryColor}`,
      };
    case "subtitle":
      return {
        ...base,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        color: "#ffffff",
        padding: "8px 20px",
        borderRadius: 4,
        fontSize: 24,
      };
    case "pill":
      return {
        ...base,
        backgroundColor: theme.primaryColor,
        color: theme.textColor,
        padding: "10px 28px",
        borderRadius: 999,
        fontSize: 22,
      };
  }
}

function getAnimationStyle(
  animation: CaptionAnimation,
  progress: number,
  fadeOut: number
): React.CSSProperties {
  switch (animation) {
    case "slideUp":
      return {
        opacity: progress * fadeOut,
        transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
      };
    case "fadeIn":
      return {
        opacity: progress * fadeOut,
      };
    case "typewriter":
      return {
        opacity: fadeOut,
      };
    case "none":
      return {
        opacity: fadeOut,
      };
  }
}
