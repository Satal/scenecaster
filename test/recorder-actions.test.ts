import { describe, it, expect, vi, beforeEach } from "vitest";
import { executeStep } from "../src/recorder/actions.js";
import type { Step } from "../src/schema/script.schema.js";

// Mock Playwright objects
function createMockLocator() {
  return {
    click: vi.fn().mockResolvedValue(undefined),
    fill: vi.fn().mockResolvedValue(undefined),
    pressSequentially: vi.fn().mockResolvedValue(undefined),
    scrollIntoViewIfNeeded: vi.fn().mockResolvedValue(undefined),
    waitFor: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockPage(locator = createMockLocator()) {
  return {
    goto: vi.fn().mockResolvedValue(undefined),
    locator: vi.fn().mockReturnValue(locator),
    evaluate: vi.fn().mockResolvedValue(undefined),
    waitForTimeout: vi.fn().mockResolvedValue(undefined),
  };
}

describe("executeStep", () => {
  describe("navigate action", () => {
    it("should call page.goto with the URL and networkidle", async () => {
      const page = createMockPage();
      const step: Step = {
        action: "navigate",
        url: "https://example.com",
        duration: 2,
      };

      await executeStep(page as any, step);

      expect(page.goto).toHaveBeenCalledWith("https://example.com", {
        waitUntil: "networkidle",
      });
    });

    it("should handle URLs with paths and query strings", async () => {
      const page = createMockPage();
      const step: Step = {
        action: "navigate",
        url: "https://example.com/app/settings?tab=profile",
        duration: 2,
      };

      await executeStep(page as any, step);

      expect(page.goto).toHaveBeenCalledWith(
        "https://example.com/app/settings?tab=profile",
        { waitUntil: "networkidle" }
      );
    });
  });

  describe("click action", () => {
    it("should locate element and click", async () => {
      const locator = createMockLocator();
      const page = createMockPage(locator);
      const step: Step = {
        action: "click",
        selector: "#submit-btn",
        highlight: false,
        duration: 1,
      };

      await executeStep(page as any, step);

      expect(page.locator).toHaveBeenCalledWith("#submit-btn");
      expect(locator.click).toHaveBeenCalled();
    });

    it("should use the correct selector for complex selectors", async () => {
      const locator = createMockLocator();
      const page = createMockPage(locator);
      const step: Step = {
        action: "click",
        selector: "button:has-text('Create New')",
        highlight: false,
        duration: 1,
      };

      await executeStep(page as any, step);

      expect(page.locator).toHaveBeenCalledWith(
        "button:has-text('Create New')"
      );
    });
  });

  describe("fill action", () => {
    it("should click, clear, then type sequentially", async () => {
      const locator = createMockLocator();
      const page = createMockPage(locator);
      const step: Step = {
        action: "fill",
        selector: "#name",
        value: "Jane Smith",
        typeSpeed: 80,
        duration: 2,
      };

      await executeStep(page as any, step);

      expect(page.locator).toHaveBeenCalledWith("#name");
      expect(locator.click).toHaveBeenCalled();
      expect(locator.fill).toHaveBeenCalledWith("");
      expect(locator.pressSequentially).toHaveBeenCalledWith("Jane Smith", {
        delay: 80,
      });
    });

    it("should use custom type speed", async () => {
      const locator = createMockLocator();
      const page = createMockPage(locator);
      const step: Step = {
        action: "fill",
        selector: "#email",
        value: "test@example.com",
        typeSpeed: 40,
        duration: 3,
      };

      await executeStep(page as any, step);

      expect(locator.pressSequentially).toHaveBeenCalledWith(
        "test@example.com",
        { delay: 40 }
      );
    });

    it("should handle empty value", async () => {
      const locator = createMockLocator();
      const page = createMockPage(locator);
      const step: Step = {
        action: "fill",
        selector: "#input",
        value: "",
        typeSpeed: 80,
        duration: 1,
      };

      await executeStep(page as any, step);

      expect(locator.fill).toHaveBeenCalledWith("");
      expect(locator.pressSequentially).toHaveBeenCalledWith("", {
        delay: 80,
      });
    });

    it("should call actions in correct order (click, clear, type)", async () => {
      const callOrder: string[] = [];
      const locator = {
        click: vi.fn().mockImplementation(() => {
          callOrder.push("click");
          return Promise.resolve();
        }),
        fill: vi.fn().mockImplementation(() => {
          callOrder.push("fill");
          return Promise.resolve();
        }),
        pressSequentially: vi.fn().mockImplementation(() => {
          callOrder.push("pressSequentially");
          return Promise.resolve();
        }),
      };
      const page = createMockPage(locator as any);
      const step: Step = {
        action: "fill",
        selector: "#input",
        value: "hello",
        typeSpeed: 80,
        duration: 1,
      };

      await executeStep(page as any, step);

      expect(callOrder).toEqual(["click", "fill", "pressSequentially"]);
    });
  });

  describe("scroll action", () => {
    it("should scroll to element when selector is provided", async () => {
      const locator = createMockLocator();
      const page = createMockPage(locator);
      const step: Step = {
        action: "scroll",
        selector: "#footer",
        y: 0,
        x: 0,
        smooth: true,
        duration: 1,
      };

      await executeStep(page as any, step);

      expect(page.locator).toHaveBeenCalledWith("#footer");
      expect(locator.scrollIntoViewIfNeeded).toHaveBeenCalled();
    });

    it("should use window.scrollBy when no selector is provided", async () => {
      const page = createMockPage();
      const step: Step = {
        action: "scroll",
        y: 500,
        x: 0,
        smooth: true,
        duration: 2,
      };

      await executeStep(page as any, step);

      expect(page.evaluate).toHaveBeenCalled();
      const evalFn = page.evaluate.mock.calls[0][0];
      const evalArgs = page.evaluate.mock.calls[0][1];
      expect(evalArgs).toEqual({ x: 0, y: 500, smooth: true });
    });

    it("should pass instant behavior when smooth is false", async () => {
      const page = createMockPage();
      const step: Step = {
        action: "scroll",
        y: 300,
        x: 100,
        smooth: false,
        duration: 1,
      };

      await executeStep(page as any, step);

      const evalArgs = page.evaluate.mock.calls[0][1];
      expect(evalArgs).toEqual({ x: 100, y: 300, smooth: false });
    });
  });

  describe("wait action", () => {
    it("should call waitForTimeout with the specified timeout", async () => {
      const page = createMockPage();
      const step: Step = {
        action: "wait",
        timeout: 2000,
        duration: 2,
      };

      await executeStep(page as any, step);

      expect(page.waitForTimeout).toHaveBeenCalledWith(2000);
    });

    it("should handle small timeouts", async () => {
      const page = createMockPage();
      const step: Step = {
        action: "wait",
        timeout: 100,
        duration: 0.1,
      };

      await executeStep(page as any, step);

      expect(page.waitForTimeout).toHaveBeenCalledWith(100);
    });
  });

  describe("waitFor handling", () => {
    it("should wait for selector string before executing step", async () => {
      const locator = createMockLocator();
      const page = createMockPage(locator);
      const step: Step = {
        action: "click",
        selector: "#btn",
        highlight: false,
        duration: 1,
        waitFor: ".content-loaded",
      };

      await executeStep(page as any, step);

      // waitFor locator should be called first with the waitFor selector
      expect(page.locator).toHaveBeenCalledWith(".content-loaded");
      expect(locator.waitFor).toHaveBeenCalledWith({
        state: "visible",
        timeout: 5000,
      });
      // Then the actual click action
      expect(page.locator).toHaveBeenCalledWith("#btn");
      expect(locator.click).toHaveBeenCalled();
    });

    it("should wait for selector object before executing step", async () => {
      const locator = createMockLocator();
      const page = createMockPage(locator);
      const step: Step = {
        action: "click",
        selector: "#btn",
        highlight: false,
        duration: 1,
        waitFor: { selector: "#loading", state: "hidden", timeout: 10000 },
      };

      await executeStep(page as any, step);

      expect(page.locator).toHaveBeenCalledWith("#loading");
      expect(locator.waitFor).toHaveBeenCalledWith({
        state: "hidden",
        timeout: 10000,
      });
    });

    it("should not call waitFor when not specified", async () => {
      const locator = createMockLocator();
      const page = createMockPage(locator);
      const step: Step = {
        action: "click",
        selector: "#btn",
        highlight: false,
        duration: 1,
      };

      await executeStep(page as any, step);

      expect(locator.waitFor).not.toHaveBeenCalled();
    });
  });
});
