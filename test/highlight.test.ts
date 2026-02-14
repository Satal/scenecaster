import { describe, it, expect, vi } from "vitest";
import { highlightElement } from "../src/recorder/highlight.js";

function createMockPage() {
  return {
    evaluate: vi.fn().mockResolvedValue(undefined),
  };
}

describe("highlightElement", () => {
  it("should call page.evaluate to inject the highlight", async () => {
    const page = createMockPage();

    await highlightElement(page as any, "#my-button");

    expect(page.evaluate).toHaveBeenCalledTimes(1);
    // First call is the injection
    const [fn, args] = page.evaluate.mock.calls[0];
    expect(args.selector).toBe("#my-button");
    expect(args.color).toBe("#3b82f6"); // default
    expect(args.id).toMatch(/^scenecaster-highlight-\d+$/);
  });

  it("should use custom colour when provided", async () => {
    const page = createMockPage();

    await highlightElement(page as any, ".btn", "#ef4444");

    const [, args] = page.evaluate.mock.calls[0];
    expect(args.color).toBe("#ef4444");
  });

  it("should return a cleanup function", async () => {
    const page = createMockPage();

    const cleanup = await highlightElement(page as any, "#target");

    expect(typeof cleanup).toBe("function");
  });

  it("should call page.evaluate on cleanup to remove the element", async () => {
    const page = createMockPage();

    const cleanup = await highlightElement(page as any, "#target");
    expect(page.evaluate).toHaveBeenCalledTimes(1);

    await cleanup();
    expect(page.evaluate).toHaveBeenCalledTimes(2);

    // Verify the cleanup is called with the highlight ID
    const cleanupArgs = page.evaluate.mock.calls[1];
    expect(cleanupArgs[1]).toMatch(/^scenecaster-highlight-\d+$/);
  });

  it("should generate unique IDs for multiple calls", async () => {
    const page = createMockPage();

    // Small delay to ensure different timestamps
    await highlightElement(page as any, "#a");
    const id1 = page.evaluate.mock.calls[0][1].id;

    // Reset and call again
    await new Promise((r) => setTimeout(r, 2));
    await highlightElement(page as any, "#b");
    const id2 = page.evaluate.mock.calls[1][1].id;

    // IDs should both match the pattern
    expect(id1).toMatch(/^scenecaster-highlight-\d+$/);
    expect(id2).toMatch(/^scenecaster-highlight-\d+$/);
  });
});
