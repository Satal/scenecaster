import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  computeSceneHash,
  getCachedRecording,
  saveToCache,
  pruneCache,
} from "../src/recorder/cache.js";
import type { BrowserScene, OutputVariant } from "../src/schema/script.schema.js";
import type { RecordingResult } from "../src/pipeline/types.js";

const testCacheDir = join(tmpdir(), "scenecaster-test-cache", String(Date.now()));

const mockScene: BrowserScene = {
  type: "browser",
  id: "login",
  url: "https://example.com/login",
  steps: [
    { action: "navigate", url: "https://example.com/login", duration: 2 },
    { action: "click", selector: "#btn", highlight: false, duration: 1 },
  ],
};

const mockVariant: OutputVariant = {
  id: "desktop",
  width: 1920,
  height: 1080,
  aspectRatio: "16:9",
};

function createMockRecording(): RecordingResult {
  // Create a fake video file
  const videoDir = join(testCacheDir, "source");
  mkdirSync(videoDir, { recursive: true });
  const videoPath = join(videoDir, "recording.webm");
  writeFileSync(videoPath, "fake-video-data");

  return {
    sceneId: "login",
    variantId: "desktop",
    videoPath,
    durationMs: 5000,
    timestamps: [
      { stepIndex: 0, startMs: 0, endMs: 2000 },
      { stepIndex: 1, startMs: 2000, endMs: 3000, actionType: "click" },
    ],
  };
}

beforeEach(() => {
  mkdirSync(testCacheDir, { recursive: true });
});

afterEach(() => {
  rmSync(testCacheDir, { recursive: true, force: true });
});

describe("computeSceneHash", () => {
  it("should return a string hash", () => {
    const hash = computeSceneHash(mockScene, mockVariant);
    expect(typeof hash).toBe("string");
    expect(hash.length).toBe(16);
  });

  it("should return the same hash for identical inputs", () => {
    const hash1 = computeSceneHash(mockScene, mockVariant);
    const hash2 = computeSceneHash(mockScene, mockVariant);
    expect(hash1).toBe(hash2);
  });

  it("should return different hash when URL changes", () => {
    const hash1 = computeSceneHash(mockScene, mockVariant);
    const modified = { ...mockScene, url: "https://example.com/other" as const };
    // Need to cast to satisfy the url type
    const hash2 = computeSceneHash(modified as BrowserScene, mockVariant);
    expect(hash1).not.toBe(hash2);
  });

  it("should return different hash when steps change", () => {
    const hash1 = computeSceneHash(mockScene, mockVariant);
    const modified: BrowserScene = {
      ...mockScene,
      steps: [
        { action: "navigate", url: "https://example.com/login", duration: 5 },
      ],
    };
    const hash2 = computeSceneHash(modified, mockVariant);
    expect(hash1).not.toBe(hash2);
  });

  it("should return different hash when variant viewport changes", () => {
    const hash1 = computeSceneHash(mockScene, mockVariant);
    const mobileVariant: OutputVariant = {
      ...mockVariant,
      id: "mobile",
      viewport: { width: 390, height: 844 },
    };
    const hash2 = computeSceneHash(mockScene, mobileVariant);
    expect(hash1).not.toBe(hash2);
  });
});

describe("saveToCache / getCachedRecording", () => {
  it("should save and retrieve a cached recording", () => {
    const recording = createMockRecording();
    const hash = "test-hash-1234";

    saveToCache(hash, recording, testCacheDir);
    const cached = getCachedRecording(hash, testCacheDir);

    expect(cached).not.toBeNull();
    expect(cached!.sceneId).toBe("login");
    expect(cached!.durationMs).toBe(5000);
    expect(cached!.timestamps).toHaveLength(2);
  });

  it("should return null for non-existent hash", () => {
    const cached = getCachedRecording("nonexistent", testCacheDir);
    expect(cached).toBeNull();
  });

  it("should return null for corrupted manifest", () => {
    const entryDir = join(testCacheDir, "corrupt-hash");
    mkdirSync(entryDir, { recursive: true });
    writeFileSync(join(entryDir, "manifest.json"), "not json");

    const cached = getCachedRecording("corrupt-hash", testCacheDir);
    expect(cached).toBeNull();
  });
});

describe("pruneCache", () => {
  it("should remove expired entries", () => {
    // Create an expired entry
    const entryDir = join(testCacheDir, "old-hash");
    mkdirSync(entryDir, { recursive: true });
    writeFileSync(
      join(entryDir, "manifest.json"),
      JSON.stringify({ createdAt: Date.now() - 48 * 60 * 60 * 1000 })
    );

    const pruned = pruneCache(testCacheDir, 24 * 60 * 60 * 1000);
    expect(pruned).toBe(1);
    expect(existsSync(entryDir)).toBe(false);
  });

  it("should keep recent entries", () => {
    // Use a dedicated subdirectory for this test to avoid leftover dirs from other tests
    const pruneCacheDir = join(testCacheDir, "prune-test");
    mkdirSync(pruneCacheDir, { recursive: true });

    const recording = createMockRecording();
    saveToCache("recent-hash", recording, pruneCacheDir);

    const pruned = pruneCache(pruneCacheDir, 24 * 60 * 60 * 1000);
    expect(pruned).toBe(0);
    expect(existsSync(join(pruneCacheDir, "recent-hash"))).toBe(true);
  });

  it("should return 0 for non-existent cache dir", () => {
    const pruned = pruneCache(join(testCacheDir, "nonexistent"));
    expect(pruned).toBe(0);
  });
});
