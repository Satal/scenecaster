import React from "react";
import {
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Img,
  staticFile,
} from "remotion";
import { useTheme } from "../theme/ThemeProvider.js";
import { fadeTransition } from "../transitions/index.js";

export interface TitleSceneProps {
  heading: string;
  subheading?: string;
  variant?: "main" | "chapter" | "minimal" | "outro";
  durationFrames: number;
}

export const TitleScene: React.FC<TitleSceneProps> = ({
  heading,
  subheading,
  variant = "main",
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const theme = useTheme();

  const transitionFrames = Math.round(fps * 0.5);
  const opacity = fadeTransition(frame, durationFrames, transitionFrames);

  // Spring animations for text
  const headingSpring = spring({
    frame,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 180 },
  });

  const subheadingSpring = spring({
    frame: Math.max(0, frame - Math.round(fps * 0.15)),
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 180 },
  });

  const accentLineSpring = spring({
    frame: Math.max(0, frame - Math.round(fps * 0.3)),
    fps,
    config: { damping: 200, mass: 0.5, stiffness: 200 },
  });

  const headingY = interpolate(headingSpring, [0, 1], [40, 0]);
  const subheadingY = interpolate(subheadingSpring, [0, 1], [30, 0]);

  const isOutro = variant === "outro";
  const isMinimal = variant === "minimal";
  const isChapter = variant === "chapter";

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: theme.backgroundColor,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        opacity,
        fontFamily: theme.fontFamily,
        padding: 60,
      }}
    >
      {/* Logo (main and outro variants) */}
      {theme.logo && (variant === "main" || isOutro) && (
        <div
          style={{
            marginBottom: 40,
            opacity: headingSpring,
          }}
        >
          <Img
            src={theme.logo}
            style={{
              maxHeight: 80,
              maxWidth: 300,
              objectFit: "contain",
            }}
          />
        </div>
      )}

      {/* Chapter number indicator */}
      {isChapter && (
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: theme.primaryColor,
            textTransform: "uppercase",
            letterSpacing: 3,
            marginBottom: 16,
            opacity: headingSpring,
          }}
        >
          Next Step
        </div>
      )}

      {/* Heading */}
      <div
        style={{
          fontSize: isMinimal ? 48 : isChapter ? 52 : 64,
          fontWeight: 700,
          color: theme.textColor,
          textAlign: "center",
          opacity: headingSpring,
          transform: `translateY(${headingY}px)`,
          lineHeight: 1.2,
        }}
      >
        {heading}
      </div>

      {/* Accent line */}
      {!isMinimal && (
        <div
          style={{
            width: interpolate(accentLineSpring, [0, 1], [0, 80]),
            height: 4,
            backgroundColor: theme.primaryColor,
            marginTop: 24,
            marginBottom: 24,
            borderRadius: 2,
          }}
        />
      )}

      {/* Subheading */}
      {subheading && (
        <div
          style={{
            fontSize: isMinimal ? 24 : 28,
            fontWeight: 400,
            color: `${theme.textColor}cc`,
            textAlign: "center",
            opacity: subheadingSpring,
            transform: `translateY(${subheadingY}px)`,
            maxWidth: "70%",
            lineHeight: 1.5,
          }}
        >
          {subheading}
        </div>
      )}
    </div>
  );
};
