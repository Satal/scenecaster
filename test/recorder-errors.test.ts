import { describe, it, expect } from "vitest";
import { RecordingError } from "../src/recorder/errors.js";
import type { Step } from "../src/schema/script.schema.js";

describe("RecordingError", () => {
  const baseStep: Step = {
    action: "click",
    selector: "#submit-btn",
    highlight: false,
    duration: 2,
  };

  const baseContext = {
    sceneId: "login",
    stepIndex: 2,
    step: baseStep,
    pageUrl: "https://example.com/login",
  };

  it("should preserve context properties", () => {
    const original = new Error("Something broke");
    const err = new RecordingError(original, baseContext);

    expect(err.sceneId).toBe("login");
    expect(err.stepIndex).toBe(2);
    expect(err.step).toBe(baseStep);
    expect(err.pageUrl).toBe("https://example.com/login");
    expect(err.originalError).toBe(original);
    expect(err.name).toBe("RecordingError");
  });

  it("should be an instance of Error", () => {
    const err = new RecordingError(new Error("test"), baseContext);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(RecordingError);
  });

  it("should format timeout errors with selector info", () => {
    const original = new Error("Timeout 30000ms exceeded. Waiting for locator.click");
    const err = new RecordingError(original, baseContext);

    expect(err.message).toContain("Could not find element");
    expect(err.message).toContain("#submit-btn");
    expect(err.message).toContain('scene "login", step 3');
    expect(err.message).toContain("waitFor");
    expect(err.message).toContain("--no-headless");
  });

  it("should format navigation errors with URL info", () => {
    const navStep: Step = {
      action: "navigate",
      url: "https://broken-site.local",
      duration: 2,
    };
    const original = new Error("net::ERR_NAME_NOT_RESOLVED");
    const err = new RecordingError(original, {
      ...baseContext,
      step: navStep,
      stepIndex: 0,
    });

    expect(err.message).toContain("Failed to load URL");
    expect(err.message).toContain("https://broken-site.local");
    expect(err.message).toContain('scene "login", step 1');
  });

  it("should format intercepted element errors", () => {
    const original = new Error("Element is not visible or pointer event is intercepted");
    const err = new RecordingError(original, baseContext);

    expect(err.message).toContain("covered by another element");
    expect(err.message).toContain("#submit-btn");
    expect(err.message).toContain("customCss");
  });

  it("should format unknown errors with context", () => {
    const original = new Error("Some unexpected Playwright error");
    const err = new RecordingError(original, baseContext);

    expect(err.message).toContain("Recording failed at");
    expect(err.message).toContain('scene "login", step 3');
    expect(err.message).toContain("Some unexpected Playwright error");
    expect(err.message).toContain("https://example.com/login");
  });

  it("should handle missing pageUrl", () => {
    const original = new Error("Timeout exceeded");
    const err = new RecordingError(original, {
      ...baseContext,
      pageUrl: undefined,
    });

    expect(err.message).toContain("unknown");
  });

  it("should handle steps without selector", () => {
    const waitStep: Step = {
      action: "wait",
      timeout: 1000,
      duration: 1,
    };
    const original = new Error("Timeout exceeded");
    const err = new RecordingError(original, {
      ...baseContext,
      step: waitStep,
    });

    expect(err.message).toContain("Could not find element");
  });
});
