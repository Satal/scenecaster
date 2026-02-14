import { interpolate, type SpringConfig } from "remotion";

export type TransitionType = "fade" | "slide" | "zoom" | "none";
export type SlideDirection = "left" | "right" | "up" | "down";

export interface TransitionConfig {
  type: TransitionType;
  durationFrames: number;
  direction?: SlideDirection;
}

export interface TransitionStyle {
  opacity: number;
  transform?: string;
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
 * Calculate style for a slide transition.
 */
export function slideTransition(
  frame: number,
  totalFrames: number,
  transitionFrames: number,
  direction: SlideDirection = "left"
): TransitionStyle {
  const opacity = fadeTransition(frame, totalFrames, transitionFrames);

  const directionMap: Record<SlideDirection, { prop: string; sign: number }> = {
    left: { prop: "translateX", sign: -1 },
    right: { prop: "translateX", sign: 1 },
    up: { prop: "translateY", sign: -1 },
    down: { prop: "translateY", sign: 1 },
  };

  const { prop, sign } = directionMap[direction];

  // Slide in from offset
  const slideIn = interpolate(frame, [0, transitionFrames], [sign * 100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slide out to offset
  const slideOut = interpolate(
    frame,
    [totalFrames - transitionFrames, totalFrames],
    [0, sign * -100],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Use slide-in at start, slide-out at end
  const offset = frame < transitionFrames ? slideIn : slideOut;

  return {
    opacity,
    transform: `${prop}(${offset}%)`,
  };
}

/**
 * Calculate style for a zoom transition.
 */
export function zoomTransition(
  frame: number,
  totalFrames: number,
  transitionFrames: number
): TransitionStyle {
  const opacity = fadeTransition(frame, totalFrames, transitionFrames);

  // Zoom in from small
  const zoomIn = interpolate(frame, [0, transitionFrames], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Zoom out to small
  const zoomOut = interpolate(
    frame,
    [totalFrames - transitionFrames, totalFrames],
    [1, 1.2],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const scale = frame < transitionFrames ? zoomIn : zoomOut;

  return {
    opacity,
    transform: `scale(${scale})`,
  };
}

/**
 * Apply the appropriate transition and return a style object.
 */
export function applyTransition(
  type: TransitionType,
  frame: number,
  totalFrames: number,
  transitionFrames: number,
  direction?: SlideDirection
): TransitionStyle {
  switch (type) {
    case "fade":
      return { opacity: fadeTransition(frame, totalFrames, transitionFrames) };
    case "slide":
      return slideTransition(frame, totalFrames, transitionFrames, direction);
    case "zoom":
      return zoomTransition(frame, totalFrames, transitionFrames);
    case "none":
      return { opacity: 1 };
  }
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
