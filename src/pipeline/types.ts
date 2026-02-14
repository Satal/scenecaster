import type { Caption, CursorConfig, FrameConfig, Transition } from "../schema/script.schema.js";

/**
 * Bounding box of the target element, captured for cursor overlay.
 */
export interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Timestamp marking when an action started/ended during recording.
 * Used to synchronise captions with the recorded video.
 */
export interface ActionTimestamp {
  /** Index of the step within the browser scene */
  stepIndex: number;
  /** Milliseconds from recording start when action began */
  startMs: number;
  /** Milliseconds from recording start when action completed */
  endMs: number;
  /** Caption to display during this action (if any) */
  caption?: Caption;
  /** Bounding box of the target element (for cursor overlay) */
  targetRect?: TargetRect;
  /** Action type for cursor style differentiation */
  actionType?: string;
}

/**
 * Result of recording a single browser scene for one output variant.
 */
export interface RecordingResult {
  /** Scene ID from the script */
  sceneId: string;
  /** Output variant ID (e.g. "desktop", "mobile") */
  variantId: string;
  /** Absolute path to the recorded WebM file */
  videoPath: string;
  /** Total recording duration in milliseconds */
  durationMs: number;
  /** Per-action timestamps for caption synchronisation */
  timestamps: ActionTimestamp[];
}

/**
 * Data passed to Remotion for composing a single scene.
 */
export interface SceneRenderData {
  sceneId: string;
  type: "title" | "browser";
  durationFrames: number;

  // Title scene data
  heading?: string;
  subheading?: string;
  titleVariant?: string;

  // Browser scene data
  videoPath?: string;
  timestamps?: ActionTimestamp[];
  url?: string;
  displayUrl?: string;
  cursorConfig?: CursorConfig;
  frameConfig?: FrameConfig;
  transition?: Transition;
}

/**
 * Complete render input passed to the Remotion composition.
 */
export interface CompositionProps {
  scenes: SceneRenderData[];
  brand: {
    logo?: string;
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
  };
  fps: number;
  width: number;
  height: number;
  [key: string]: unknown;
}
