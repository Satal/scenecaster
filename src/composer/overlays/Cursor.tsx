import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { ActionTimestamp } from "../../pipeline/types.js";
import { msToFrames } from "../../utils/timing.js";
import type { CursorConfig } from "../../schema/script.schema.js";

export interface CursorProps {
  timestamps: ActionTimestamp[];
  config: CursorConfig;
  durationFrames: number;
}

interface CursorTarget {
  frame: number;
  x: number;
  y: number;
  actionType: string;
}

/**
 * Animated fake cursor overlay for browser scenes.
 * Moves between click/fill targets with spring animation.
 */
export const Cursor: React.FC<CursorProps> = ({
  timestamps,
  config,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!config.enabled) return null;

  // Build targets from timestamps with targetRect
  const targets: CursorTarget[] = timestamps
    .filter((ts) => ts.targetRect)
    .map((ts) => ({
      frame: msToFrames(ts.startMs, fps),
      x: ts.targetRect!.x + ts.targetRect!.width / 2,
      y: ts.targetRect!.y + ts.targetRect!.height / 2,
      actionType: ts.actionType ?? "click",
    }));

  if (targets.length === 0) return null;

  // Fade cursor in at scene start
  const fadeIn = interpolate(frame, [0, Math.round(fps * 0.3)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Find current and next target for interpolation
  let currentTarget = targets[0];
  let nextTarget: CursorTarget | undefined;

  for (let i = 0; i < targets.length; i++) {
    if (targets[i].frame <= frame) {
      currentTarget = targets[i];
      nextTarget = targets[i + 1];
    }
  }

  // Interpolate position towards next target with spring
  let x = currentTarget.x;
  let y = currentTarget.y;

  if (nextTarget && frame < nextTarget.frame) {
    const moveProgress = spring({
      frame: frame - currentTarget.frame,
      fps,
      config: { damping: 30, mass: 0.8, stiffness: 180 },
      durationInFrames: nextTarget.frame - currentTarget.frame,
    });

    x = interpolate(moveProgress, [0, 1], [currentTarget.x, nextTarget.x]);
    y = interpolate(moveProgress, [0, 1], [currentTarget.y, nextTarget.y]);
  } else if (nextTarget && frame >= nextTarget.frame) {
    x = nextTarget.x;
    y = nextTarget.y;
  }

  // Click bounce animation - trigger at each target frame
  let scale = 1;
  const activeTarget = targets.find(
    (t) => frame >= t.frame && frame < t.frame + Math.round(fps * 0.3)
  );
  if (activeTarget) {
    const bounceFrame = frame - activeTarget.frame;
    const bounceDuration = Math.round(fps * 0.3);
    scale = interpolate(
      bounceFrame,
      [0, bounceDuration * 0.3, bounceDuration * 0.6, bounceDuration],
      [1, 0.8, 1.1, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
  }

  // Choose cursor style based on current action type
  const isTyping = currentTarget.actionType === "fill";

  return (
    <div
      style={{
        position: "absolute",
        left: x - config.size / 2,
        top: y - config.size / 2,
        width: config.size,
        height: config.size,
        opacity: fadeIn,
        transform: `scale(${scale})`,
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      {isTyping ? (
        <IBeamCursor color={config.color} size={config.size} />
      ) : (
        <PointerCursor color={config.color} size={config.size} />
      )}
    </div>
  );
};

const PointerCursor: React.FC<{ color: string; size: number }> = ({
  color,
  size,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 3L19 12L12 13L9 20L5 3Z"
      fill={color}
      stroke="white"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const IBeamCursor: React.FC<{ color: string; size: number }> = ({
  color,
  size,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 4H15M9 20H15M12 4V20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M9 4H15M9 20H15"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.3"
    />
    <path
      d="M9 4H15M9 20H15M12 4V20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
