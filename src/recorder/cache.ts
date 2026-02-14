import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  readdirSync,
  statSync,
  rmSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { BrowserScene, OutputVariant } from "../schema/script.schema.js";
import type { RecordingResult } from "../pipeline/types.js";

interface CacheManifest {
  hash: string;
  sceneId: string;
  variantId: string;
  videoFilename: string;
  durationMs: number;
  timestamps: RecordingResult["timestamps"];
  createdAt: number;
}

const DEFAULT_CACHE_DIR = join(tmpdir(), "scenecaster", "cache");
const MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Compute a stable hash for a browser scene + variant combination.
 * Changes to the scene definition or variant viewport invalidate the cache.
 */
export function computeSceneHash(
  scene: BrowserScene,
  variant: OutputVariant
): string {
  const data = JSON.stringify({
    id: scene.id,
    url: scene.url,
    steps: scene.steps,
    selectorOverrides: scene.selectorOverrides?.[variant.id],
    customCss: scene.customCss,
    viewportWidth: variant.viewport?.width ?? variant.width,
    viewportHeight: variant.viewport?.height ?? variant.height,
  });

  return createHash("sha256").update(data).digest("hex").slice(0, 16);
}

/**
 * Look up a cached recording by hash.
 * Returns the RecordingResult if found and still valid, null otherwise.
 */
export function getCachedRecording(
  hash: string,
  cacheDir: string = DEFAULT_CACHE_DIR
): RecordingResult | null {
  const entryDir = join(cacheDir, hash);
  const manifestPath = join(entryDir, "manifest.json");

  if (!existsSync(manifestPath)) return null;

  try {
    const manifest: CacheManifest = JSON.parse(
      readFileSync(manifestPath, "utf-8")
    );

    // Check age
    if (Date.now() - manifest.createdAt > MAX_CACHE_AGE_MS) return null;

    // Check video exists
    const videoPath = join(entryDir, manifest.videoFilename);
    if (!existsSync(videoPath)) return null;

    return {
      sceneId: manifest.sceneId,
      variantId: manifest.variantId,
      videoPath,
      durationMs: manifest.durationMs,
      timestamps: manifest.timestamps,
    };
  } catch {
    return null;
  }
}

/**
 * Save a recording result to cache.
 */
export function saveToCache(
  hash: string,
  recording: RecordingResult,
  cacheDir: string = DEFAULT_CACHE_DIR
): void {
  const entryDir = join(cacheDir, hash);
  mkdirSync(entryDir, { recursive: true });

  const videoFilename = `recording.webm`;
  const videoPath = join(entryDir, videoFilename);
  copyFileSync(recording.videoPath, videoPath);

  const manifest: CacheManifest = {
    hash,
    sceneId: recording.sceneId,
    variantId: recording.variantId,
    videoFilename,
    durationMs: recording.durationMs,
    timestamps: recording.timestamps,
    createdAt: Date.now(),
  };

  writeFileSync(
    join(entryDir, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
}

/**
 * Remove cache entries older than maxAgeMs.
 */
export function pruneCache(
  cacheDir: string = DEFAULT_CACHE_DIR,
  maxAgeMs: number = MAX_CACHE_AGE_MS
): number {
  if (!existsSync(cacheDir)) return 0;

  const now = Date.now();
  let pruned = 0;

  for (const entry of readdirSync(cacheDir)) {
    const entryDir = join(cacheDir, entry);
    const manifestPath = join(entryDir, "manifest.json");

    try {
      const stat = statSync(entryDir);
      if (!stat.isDirectory()) continue;

      let shouldPrune = false;
      if (existsSync(manifestPath)) {
        const manifest: CacheManifest = JSON.parse(
          readFileSync(manifestPath, "utf-8")
        );
        shouldPrune = now - manifest.createdAt > maxAgeMs;
      } else {
        // No manifest = invalid cache entry
        shouldPrune = true;
      }

      if (shouldPrune) {
        rmSync(entryDir, { recursive: true, force: true });
        pruned++;
      }
    } catch {
      // Skip entries we can't read
    }
  }

  return pruned;
}
