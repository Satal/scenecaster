import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import type {
  BrowserScene,
  OutputVariant,
  Step,
} from "../schema/script.schema.js";
import type { ActionTimestamp, RecordingResult } from "../pipeline/types.js";
import { executeStep } from "./actions.js";
import { highlightElement } from "./highlight.js";
import type { Logger } from "../utils/logger.js";

export interface RecorderOptions {
  /** Whether to run the browser in headless mode */
  headless?: boolean;
  /** Slow down actions by this many ms */
  slowMo?: number;
  /** Temporary directory for recordings */
  tmpDir?: string;
  logger?: Logger;
}

/**
 * Record a browser scene for a specific output variant.
 */
export async function recordBrowserScene(
  scene: BrowserScene,
  variant: OutputVariant,
  options: RecorderOptions = {}
): Promise<RecordingResult> {
  const {
    headless = true,
    slowMo = 0,
    tmpDir = join(tmpdir(), "scenecaster"),
  } = options;

  const recordDir = join(tmpDir, "recordings", scene.id, variant.id);
  mkdirSync(recordDir, { recursive: true });

  // Use variant viewport if specified, otherwise use output dimensions
  const viewportWidth = variant.viewport?.width ?? variant.width;
  const viewportHeight = variant.viewport?.height ?? variant.height;

  const browser: Browser = await chromium.launch({ headless, slowMo });

  const context: BrowserContext = await browser.newContext({
    viewport: { width: viewportWidth, height: viewportHeight },
    recordVideo: {
      dir: recordDir,
      size: { width: viewportWidth, height: viewportHeight },
    },
  });

  const page: Page = await context.newPage();
  const timestamps: ActionTimestamp[] = [];
  const recordingStart = Date.now();

  // Resolve selector overrides for this variant
  const overrides = scene.selectorOverrides?.[variant.id] ?? {};

  try {
    for (let i = 0; i < scene.steps.length; i++) {
      const step = resolveSelectors(scene.steps[i], overrides);
      const stepStart = Date.now() - recordingStart;

      // Highlight element before click if requested
      let removeHighlight: (() => Promise<void>) | undefined;
      if (step.action === "click" && step.highlight) {
        removeHighlight = await highlightElement(page, step.selector);
        await page.waitForTimeout(500); // Brief pause to show highlight
      }

      await executeStep(page, step);

      // Remove highlight after action
      if (removeHighlight) {
        await removeHighlight();
      }

      // Hold for the step's duration so the viewer sees the result
      const holdMs = step.duration * 1000;
      await page.waitForTimeout(holdMs);

      const stepEnd = Date.now() - recordingStart;

      timestamps.push({
        stepIndex: i,
        startMs: stepStart,
        endMs: stepEnd,
        caption: step.caption,
      });
    }
  } finally {
    await context.close();
    await browser.close();
  }

  // Playwright saves the video file when the context closes
  // The video file is in the recordDir
  const videoPath = await findRecordedVideo(recordDir);

  return {
    sceneId: scene.id,
    variantId: variant.id,
    videoPath,
    durationMs: Date.now() - recordingStart,
    timestamps,
  };
}

/**
 * Apply selector overrides for the current variant.
 */
function resolveSelectors(
  step: Step,
  overrides: Record<string, string>
): Step {
  if ("selector" in step && step.selector && overrides[step.selector]) {
    return { ...step, selector: overrides[step.selector] } as Step;
  }
  return step;
}

/**
 * Find the recorded .webm file in the directory.
 */
async function findRecordedVideo(dir: string): Promise<string> {
  const { readdirSync } = await import("node:fs");
  const files = readdirSync(dir).filter((f) => f.endsWith(".webm"));
  if (files.length === 0) {
    throw new Error(`No recorded video found in ${dir}`);
  }
  return resolve(join(dir, files[0]));
}
