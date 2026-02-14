import { interpolate, type SpringConfig } from "remotion";

export type TransitionType = "fade" | "slide" | "zoom";
export type SlideDirection = "left" | "right" | "up" | "down";

export interface TransitionConfig {
  type: TransitionType;
  durationFrames: number;
  direction?: SlideDirection;
}

/**
 * Calculate opacity for a fade transition at the given frame.
 */
export function fadeTransition(
  frame: number,
  totalFrames: number,
  transitionFrames: number
): number {
  // Fade in at start
  const fadeIn = interpolate(frame, [0, transitionFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out at end
  const fadeOut = interpolate(
    frame,
    [totalFrames - transitionFrames, totalFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return Math.min(fadeIn, fadeOut);
}

/**
 * Default spring config for smooth motion.
 */
export const defaultSpringConfig: SpringConfig = {
  damping: 200,
  mass: 0.5,
  stiffness: 200,
  overshootClamping: false,
};
