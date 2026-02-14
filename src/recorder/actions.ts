import type { Page } from "playwright";
import type { Step } from "../schema/script.schema.js";

/**
 * Execute a single step on the Playwright page.
 * Returns after the action completes (before the hold duration).
 */
export async function executeStep(page: Page, step: Step): Promise<void> {
  switch (step.action) {
    case "navigate":
      await page.goto(step.url, { waitUntil: "networkidle" });
      break;

    case "click":
      await page.locator(step.selector).click();
      break;

    case "fill": {
      const locator = page.locator(step.selector);
      await locator.click();
      // Clear existing value
      await locator.fill("");
      // Type character by character for visual effect
      await locator.pressSequentially(step.value, {
        delay: step.typeSpeed,
      });
      break;
    }

    case "scroll": {
      if (step.selector) {
        await page.locator(step.selector).scrollIntoViewIfNeeded();
      } else {
        await page.evaluate(
          ({ x, y, smooth }) => {
            window.scrollBy({
              left: x,
              top: y,
              behavior: smooth ? "smooth" : "instant",
            });
          },
          { x: step.x, y: step.y, smooth: step.smooth }
        );
      }
      break;
    }

    case "wait":
      await page.waitForTimeout(step.timeout);
      break;
  }
}
