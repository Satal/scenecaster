import type { Step } from "../schema/script.schema.js";

export interface RecordingErrorContext {
  sceneId: string;
  stepIndex: number;
  step: Step;
  pageUrl?: string;
}

/**
 * User-friendly error wrapping raw Playwright failures.
 * Includes scene context and actionable suggestions.
 */
export class RecordingError extends Error {
  public readonly sceneId: string;
  public readonly stepIndex: number;
  public readonly step: Step;
  public readonly pageUrl?: string;
  public readonly originalError: Error;

  constructor(original: Error, context: RecordingErrorContext) {
    const friendly = formatFriendlyMessage(original, context);
    super(friendly);
    this.name = "RecordingError";
    this.sceneId = context.sceneId;
    this.stepIndex = context.stepIndex;
    this.step = context.step;
    this.pageUrl = context.pageUrl;
    this.originalError = original;
  }
}

/**
 * Map Playwright error patterns to user-friendly messages with suggestions.
 */
function formatFriendlyMessage(
  error: Error,
  ctx: RecordingErrorContext
): string {
  const msg = error.message;
  const location = `scene "${ctx.sceneId}", step ${ctx.stepIndex + 1}`;
  const selector = "selector" in ctx.step ? (ctx.step as { selector: string }).selector : undefined;

  // Timeout waiting for selector
  if (msg.includes("Timeout") || msg.includes("waiting for") || msg.includes("locator.click")) {
    const selectorInfo = selector ? ` ("${selector}")` : "";
    return (
      `Could not find element${selectorInfo} in ${location}.\n` +
      `  Page URL: ${ctx.pageUrl ?? "unknown"}\n` +
      `  Suggestions:\n` +
      `    - Add a "waitFor" field to wait for the element to appear\n` +
      `    - Check that the selector matches an element on the page\n` +
      `    - Try running with --no-headless to see the browser`
    );
  }

  // Navigation failure
  if (msg.includes("net::ERR_") || msg.includes("Navigation") || msg.includes("goto")) {
    const url = "url" in ctx.step ? (ctx.step as { url: string }).url : ctx.pageUrl;
    return (
      `Failed to load URL "${url ?? "unknown"}" in ${location}.\n` +
      `  Suggestions:\n` +
      `    - Check that the URL is correct and accessible\n` +
      `    - Ensure the site is running if it's a local URL`
    );
  }

  // Element is covered / intercepted
  if (msg.includes("intercept") || msg.includes("overlay") || msg.includes("pointer event")) {
    return (
      `Element "${selector ?? "unknown"}" is covered by another element in ${location}.\n` +
      `  Page URL: ${ctx.pageUrl ?? "unknown"}\n` +
      `  Suggestions:\n` +
      `    - Use "customCss" to hide overlapping elements (cookie banners, modals)\n` +
      `    - Add a "wait" step before this action to let animations complete`
    );
  }

  // Default: wrap original message with context
  return (
    `Recording failed at ${location}: ${msg}\n` +
    `  Page URL: ${ctx.pageUrl ?? "unknown"}`
  );
}
