/**
 * Convert seconds to frame count at a given FPS.
 */
export function secondsToFrames(seconds: number, fps: number): number {
  return Math.round(seconds * fps);
}

/**
 * Convert milliseconds to frame count at a given FPS.
 */
export function msToFrames(ms: number, fps: number): number {
  return Math.round((ms / 1000) * fps);
}

/**
 * Convert frame count to seconds at a given FPS.
 */
export function framesToSeconds(frames: number, fps: number): number {
  return frames / fps;
}
