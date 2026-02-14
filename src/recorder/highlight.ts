import type { Page } from "playwright";

/**
 * Inject a pulsing highlight ring around a DOM element.
 * Returns a cleanup function to remove the highlight.
 */
export async function highlightElement(
  page: Page,
  selector: string,
  color = "#3b82f6"
): Promise<() => Promise<void>> {
  const highlightId = `scenecaster-highlight-${Date.now()}`;

  await page.evaluate(
    ({ selector, color, id }) => {
      const el = document.querySelector(selector);
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const highlight = document.createElement("div");
      highlight.id = id;
      highlight.style.cssText = `
        position: fixed;
        top: ${rect.top - 4}px;
        left: ${rect.left - 4}px;
        width: ${rect.width + 8}px;
        height: ${rect.height + 8}px;
        border: 3px solid ${color};
        border-radius: 8px;
        pointer-events: none;
        z-index: 999999;
        animation: scenecaster-pulse 1s ease-in-out infinite;
      `;

      // Add keyframes if not already present
      if (!document.getElementById("scenecaster-highlight-style")) {
        const style = document.createElement("style");
        style.id = "scenecaster-highlight-style";
        style.textContent = `
          @keyframes scenecaster-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.03); }
          }
        `;
        document.head.appendChild(style);
      }

      document.body.appendChild(highlight);
    },
    { selector, color, id: highlightId }
  );

  return async () => {
    await page.evaluate((id) => {
      document.getElementById(id)?.remove();
    }, highlightId);
  };
}
