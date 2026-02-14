import { describe, it, expect } from "vitest";
import { ScriptSchema } from "../src/schema/script.schema.js";
import {
  CaptionSchema,
  StepSchema,
  BrowserSceneSchema,
  TitleSceneSchema,
  OutputVariantSchema,
  BrandSchema,
  OutputConfigSchema,
  WaitForSchema,
  MetaSchema,
  TransitionSchema,
} from "../src/schema/script.schema.js";

describe("CaptionSchema edge cases", () => {
  it("should reject empty caption text", () => {
    const result = CaptionSchema.safeParse({ text: "" });
    expect(result.success).toBe(false);
  });

  it("should accept long caption text", () => {
    const longText = "A".repeat(500);
    const result = CaptionSchema.parse({ text: longText });
    expect(result.text).toBe(longText);
  });

  it("should apply all defaults correctly", () => {
    const result = CaptionSchema.parse({ text: "Hello" });
    expect(result.position).toBe("bottom");
    expect(result.style).toBe("bar");
    expect(result.animation).toBe("slideUp");
  });

  it("should accept all valid positions", () => {
    for (const pos of ["top", "bottom", "center"] as const) {
      const result = CaptionSchema.parse({ text: "test", position: pos });
      expect(result.position).toBe(pos);
    }
  });

  it("should reject invalid position", () => {
    const result = CaptionSchema.safeParse({
      text: "test",
      position: "left",
    });
    expect(result.success).toBe(false);
  });

  it("should accept all valid styles", () => {
    for (const style of ["bar", "bubble", "subtitle", "pill"] as const) {
      const result = CaptionSchema.parse({ text: "test", style });
      expect(result.style).toBe(style);
    }
  });

  it("should accept all valid animations", () => {
    for (const anim of [
      "slideUp",
      "fadeIn",
      "typewriter",
      "none",
    ] as const) {
      const result = CaptionSchema.parse({ text: "test", animation: anim });
      expect(result.animation).toBe(anim);
    }
  });
});

describe("StepSchema edge cases", () => {
  it("should reject negative duration", () => {
    const result = StepSchema.safeParse({
      action: "wait",
      timeout: 1000,
      duration: -1,
    });
    expect(result.success).toBe(false);
  });

  it("should reject zero duration", () => {
    const result = StepSchema.safeParse({
      action: "wait",
      timeout: 1000,
      duration: 0,
    });
    expect(result.success).toBe(false);
  });

  it("should accept fractional duration", () => {
    const result = StepSchema.parse({
      action: "wait",
      timeout: 500,
      duration: 0.5,
    });
    expect(result.duration).toBe(0.5);
  });

  it("should reject navigate without URL", () => {
    const result = StepSchema.safeParse({
      action: "navigate",
      duration: 2,
    });
    expect(result.success).toBe(false);
  });

  it("should reject navigate with invalid URL", () => {
    const result = StepSchema.safeParse({
      action: "navigate",
      url: "not-a-url",
      duration: 2,
    });
    expect(result.success).toBe(false);
  });

  it("should reject click without selector", () => {
    const result = StepSchema.safeParse({
      action: "click",
      duration: 2,
    });
    expect(result.success).toBe(false);
  });

  it("should reject click with empty selector", () => {
    const result = StepSchema.safeParse({
      action: "click",
      selector: "",
      duration: 2,
    });
    expect(result.success).toBe(false);
  });

  it("should default click highlight to false", () => {
    const result = StepSchema.parse({
      action: "click",
      selector: "#btn",
      duration: 1,
    });
    if (result.action === "click") {
      expect(result.highlight).toBe(false);
    }
  });

  it("should default fill typeSpeed to 80", () => {
    const result = StepSchema.parse({
      action: "fill",
      selector: "#input",
      value: "hello",
      duration: 1,
    });
    if (result.action === "fill") {
      expect(result.typeSpeed).toBe(80);
    }
  });

  it("should reject fill with negative typeSpeed", () => {
    const result = StepSchema.safeParse({
      action: "fill",
      selector: "#input",
      value: "hello",
      typeSpeed: -10,
      duration: 1,
    });
    expect(result.success).toBe(false);
  });

  it("should default scroll values", () => {
    const result = StepSchema.parse({
      action: "scroll",
      duration: 1,
    });
    if (result.action === "scroll") {
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.smooth).toBe(true);
    }
  });

  it("should accept negative scroll values", () => {
    const result = StepSchema.parse({
      action: "scroll",
      y: -200,
      x: -100,
      duration: 1,
    });
    if (result.action === "scroll") {
      expect(result.y).toBe(-200);
      expect(result.x).toBe(-100);
    }
  });

  it("should default wait timeout to 1000", () => {
    const result = StepSchema.parse({
      action: "wait",
      duration: 1,
    });
    if (result.action === "wait") {
      expect(result.timeout).toBe(1000);
    }
  });

  it("should reject unknown action type", () => {
    const result = StepSchema.safeParse({
      action: "hover",
      selector: "#item",
      duration: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("WaitForSchema edge cases", () => {
  it("should accept a string shorthand", () => {
    const result = WaitForSchema.parse(".my-element");
    expect(result).toBe(".my-element");
  });

  it("should reject empty string shorthand", () => {
    const result = WaitForSchema.safeParse("");
    expect(result.success).toBe(false);
  });

  it("should accept object form with defaults", () => {
    const result = WaitForSchema.parse({ selector: "#loading" });
    expect(result).toEqual({
      selector: "#loading",
      state: "visible",
      timeout: 5000,
    });
  });

  it("should accept all valid states", () => {
    for (const state of ["visible", "attached", "hidden", "detached"] as const) {
      const result = WaitForSchema.parse({ selector: "#el", state });
      expect((result as { state: string }).state).toBe(state);
    }
  });

  it("should reject invalid state", () => {
    const result = WaitForSchema.safeParse({ selector: "#el", state: "ready" });
    expect(result.success).toBe(false);
  });

  it("should accept custom timeout", () => {
    const result = WaitForSchema.parse({ selector: "#el", timeout: 10000 });
    expect((result as { timeout: number }).timeout).toBe(10000);
  });

  it("should reject negative timeout", () => {
    const result = WaitForSchema.safeParse({ selector: "#el", timeout: -1 });
    expect(result.success).toBe(false);
  });

  it("should reject object without selector", () => {
    const result = WaitForSchema.safeParse({ state: "visible" });
    expect(result.success).toBe(false);
  });
});

describe("Step waitFor integration", () => {
  it("should accept step with string waitFor", () => {
    const result = StepSchema.parse({
      action: "click",
      selector: "#btn",
      duration: 1,
      waitFor: ".loading-done",
    });
    expect(result.waitFor).toBe(".loading-done");
  });

  it("should accept step with object waitFor", () => {
    const result = StepSchema.parse({
      action: "fill",
      selector: "#input",
      value: "hello",
      duration: 1,
      waitFor: { selector: "#form", state: "attached", timeout: 3000 },
    });
    expect(result.waitFor).toEqual({
      selector: "#form",
      state: "attached",
      timeout: 3000,
    });
  });

  it("should allow step without waitFor", () => {
    const result = StepSchema.parse({
      action: "click",
      selector: "#btn",
      duration: 1,
    });
    expect(result.waitFor).toBeUndefined();
  });
});

describe("CSS injection schema", () => {
  it("should accept globalCss on meta", () => {
    const result = MetaSchema.parse({
      title: "Test",
      globalCss: ".cookie-banner { display: none !important; }",
    });
    expect(result.globalCss).toBe(".cookie-banner { display: none !important; }");
  });

  it("should allow meta without globalCss", () => {
    const result = MetaSchema.parse({ title: "Test" });
    expect(result.globalCss).toBeUndefined();
  });

  it("should accept customCss on browser scene", () => {
    const result = BrowserSceneSchema.parse({
      type: "browser",
      id: "demo",
      url: "https://example.com",
      steps: [{ action: "navigate", url: "https://example.com", duration: 2 }],
      customCss: "#chat-widget { display: none; }",
    });
    expect(result.customCss).toBe("#chat-widget { display: none; }");
  });

  it("should allow browser scene without customCss", () => {
    const result = BrowserSceneSchema.parse({
      type: "browser",
      id: "demo",
      url: "https://example.com",
      steps: [{ action: "navigate", url: "https://example.com", duration: 2 }],
    });
    expect(result.customCss).toBeUndefined();
  });
});

describe("TransitionSchema edge cases", () => {
  it("should apply defaults", () => {
    const result = TransitionSchema.parse({});
    expect(result.type).toBe("fade");
    expect(result.duration).toBe(0.5);
    expect(result.direction).toBeUndefined();
  });

  it("should accept all valid types", () => {
    for (const type of ["fade", "slide", "zoom", "none"] as const) {
      const result = TransitionSchema.parse({ type });
      expect(result.type).toBe(type);
    }
  });

  it("should reject invalid type", () => {
    const result = TransitionSchema.safeParse({ type: "wipe" });
    expect(result.success).toBe(false);
  });

  it("should accept slide with direction", () => {
    const result = TransitionSchema.parse({
      type: "slide",
      direction: "left",
      duration: 0.3,
    });
    expect(result.direction).toBe("left");
    expect(result.duration).toBe(0.3);
  });

  it("should accept all valid directions", () => {
    for (const dir of ["left", "right", "up", "down"] as const) {
      const result = TransitionSchema.parse({ type: "slide", direction: dir });
      expect(result.direction).toBe(dir);
    }
  });

  it("should reject invalid direction", () => {
    const result = TransitionSchema.safeParse({ type: "slide", direction: "diagonal" });
    expect(result.success).toBe(false);
  });

  it("should reject zero duration", () => {
    const result = TransitionSchema.safeParse({ duration: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject negative duration", () => {
    const result = TransitionSchema.safeParse({ duration: -1 });
    expect(result.success).toBe(false);
  });
});

describe("Cursor and Frame config schema", () => {
  it("should accept cursor config on browser scene", () => {
    const result = BrowserSceneSchema.parse({
      type: "browser",
      id: "demo",
      url: "https://example.com",
      steps: [{ action: "navigate", url: "https://example.com", duration: 2 }],
      cursor: { enabled: true, style: "pointer", color: "#ff0000", size: 32 },
    });
    expect(result.cursor?.enabled).toBe(true);
    expect(result.cursor?.color).toBe("#ff0000");
  });

  it("should accept frame config on browser scene", () => {
    const result = BrowserSceneSchema.parse({
      type: "browser",
      id: "demo",
      url: "https://example.com",
      steps: [{ action: "navigate", url: "https://example.com", duration: 2 }],
      frame: { style: "macos", showUrl: true, darkMode: true },
    });
    expect(result.frame?.style).toBe("macos");
    expect(result.frame?.darkMode).toBe(true);
  });

  it("should accept transition on title scene", () => {
    const result = TitleSceneSchema.parse({
      type: "title",
      id: "intro",
      duration: 3,
      heading: "Hello",
      transition: { type: "slide", direction: "right", duration: 0.8 },
    });
    expect(result.transition?.type).toBe("slide");
  });

  it("should accept transition on browser scene", () => {
    const result = BrowserSceneSchema.parse({
      type: "browser",
      id: "demo",
      url: "https://example.com",
      steps: [{ action: "navigate", url: "https://example.com", duration: 2 }],
      transition: { type: "zoom" },
    });
    expect(result.transition?.type).toBe("zoom");
  });

  it("should accept transition on output config", () => {
    const result = OutputConfigSchema.parse({
      fps: 30,
      variants: [{ id: "desktop", width: 1920, height: 1080, aspectRatio: "16:9" }],
      transition: { type: "fade", duration: 0.3 },
    });
    expect(result.transition?.type).toBe("fade");
  });
});

describe("TitleSceneSchema edge cases", () => {
  it("should default variant to main", () => {
    const result = TitleSceneSchema.parse({
      type: "title",
      id: "intro",
      duration: 3,
      heading: "Hello",
    });
    expect(result.variant).toBe("main");
  });

  it("should accept all valid variants", () => {
    for (const variant of ["main", "chapter", "minimal", "outro"] as const) {
      const result = TitleSceneSchema.parse({
        type: "title",
        id: "test",
        duration: 3,
        heading: "Test",
        variant,
      });
      expect(result.variant).toBe(variant);
    }
  });

  it("should reject invalid variant", () => {
    const result = TitleSceneSchema.safeParse({
      type: "title",
      id: "test",
      duration: 3,
      heading: "Test",
      variant: "fancy",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty heading", () => {
    const result = TitleSceneSchema.safeParse({
      type: "title",
      id: "test",
      duration: 3,
      heading: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty id", () => {
    const result = TitleSceneSchema.safeParse({
      type: "title",
      id: "",
      duration: 3,
      heading: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("should allow subheading to be omitted", () => {
    const result = TitleSceneSchema.parse({
      type: "title",
      id: "test",
      duration: 3,
      heading: "Test",
    });
    expect(result.subheading).toBeUndefined();
  });
});

describe("BrowserSceneSchema edge cases", () => {
  it("should require at least one step", () => {
    const result = BrowserSceneSchema.safeParse({
      type: "browser",
      id: "demo",
      url: "https://example.com",
      steps: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid URL", () => {
    const result = BrowserSceneSchema.safeParse({
      type: "browser",
      id: "demo",
      url: "not-a-url",
      steps: [
        { action: "navigate", url: "https://example.com", duration: 2 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("should allow selectorOverrides to be omitted", () => {
    const result = BrowserSceneSchema.parse({
      type: "browser",
      id: "demo",
      url: "https://example.com",
      steps: [
        { action: "navigate", url: "https://example.com", duration: 2 },
      ],
    });
    expect(result.selectorOverrides).toBeUndefined();
  });

  it("should accept nested selector overrides for multiple variants", () => {
    const result = BrowserSceneSchema.parse({
      type: "browser",
      id: "demo",
      url: "https://example.com",
      steps: [
        { action: "click", selector: "#btn", duration: 1 },
      ],
      selectorOverrides: {
        mobile: { "#btn": ".mobile-btn" },
        tablet: { "#btn": ".tablet-btn" },
      },
    });
    expect(result.selectorOverrides?.mobile?.["#btn"]).toBe(".mobile-btn");
    expect(result.selectorOverrides?.tablet?.["#btn"]).toBe(".tablet-btn");
  });

  it("should accept multiple steps of different types", () => {
    const result = BrowserSceneSchema.parse({
      type: "browser",
      id: "complex",
      url: "https://example.com",
      steps: [
        { action: "navigate", url: "https://example.com", duration: 2 },
        { action: "click", selector: "#btn", duration: 1 },
        { action: "fill", selector: "#input", value: "test", duration: 2 },
        { action: "scroll", y: 300, duration: 1 },
        { action: "wait", timeout: 500, duration: 1 },
      ],
    });
    expect(result.steps).toHaveLength(5);
  });
});

describe("OutputVariantSchema edge cases", () => {
  it("should reject non-integer dimensions", () => {
    const result = OutputVariantSchema.safeParse({
      id: "test",
      width: 1920.5,
      height: 1080,
      aspectRatio: "16:9",
    });
    expect(result.success).toBe(false);
  });

  it("should reject zero width", () => {
    const result = OutputVariantSchema.safeParse({
      id: "test",
      width: 0,
      height: 1080,
      aspectRatio: "16:9",
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative height", () => {
    const result = OutputVariantSchema.safeParse({
      id: "test",
      width: 1920,
      height: -1080,
      aspectRatio: "16:9",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid aspect ratio format", () => {
    const result = OutputVariantSchema.safeParse({
      id: "test",
      width: 1920,
      height: 1080,
      aspectRatio: "widescreen",
    });
    expect(result.success).toBe(false);
  });

  it("should accept unusual but valid aspect ratios", () => {
    const result = OutputVariantSchema.parse({
      id: "test",
      width: 1920,
      height: 1080,
      aspectRatio: "21:9",
    });
    expect(result.aspectRatio).toBe("21:9");
  });

  it("should allow viewport override", () => {
    const result = OutputVariantSchema.parse({
      id: "mobile",
      width: 1080,
      height: 1920,
      aspectRatio: "9:16",
      viewport: { width: 390, height: 844 },
    });
    expect(result.viewport?.width).toBe(390);
    expect(result.viewport?.height).toBe(844);
  });
});

describe("BrandSchema edge cases", () => {
  it("should apply all defaults when empty object is passed", () => {
    const result = BrandSchema.parse({});
    expect(result.primaryColor).toBe("#1e40af");
    expect(result.backgroundColor).toBe("#0f172a");
    expect(result.textColor).toBe("#f8fafc");
    expect(result.fontFamily).toBe("Inter");
    expect(result.logo).toBeUndefined();
  });

  it("should accept partial overrides", () => {
    const result = BrandSchema.parse({ primaryColor: "#ff0000" });
    expect(result.primaryColor).toBe("#ff0000");
    expect(result.backgroundColor).toBe("#0f172a"); // still default
  });

  it("should accept any string for colours (no hex validation)", () => {
    const result = BrandSchema.parse({
      primaryColor: "red",
      backgroundColor: "rgb(0,0,0)",
    });
    expect(result.primaryColor).toBe("red");
    expect(result.backgroundColor).toBe("rgb(0,0,0)");
  });
});

describe("OutputConfigSchema edge cases", () => {
  it("should reject zero FPS", () => {
    const result = OutputConfigSchema.safeParse({
      fps: 0,
      variants: [
        { id: "test", width: 1920, height: 1080, aspectRatio: "16:9" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative FPS", () => {
    const result = OutputConfigSchema.safeParse({
      fps: -30,
      variants: [
        { id: "test", width: 1920, height: 1080, aspectRatio: "16:9" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-integer FPS", () => {
    const result = OutputConfigSchema.safeParse({
      fps: 29.97,
      variants: [
        { id: "test", width: 1920, height: 1080, aspectRatio: "16:9" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("should require at least one variant", () => {
    const result = OutputConfigSchema.safeParse({
      fps: 30,
      variants: [],
    });
    expect(result.success).toBe(false);
  });

  it("should accept high FPS values like 60", () => {
    const result = OutputConfigSchema.parse({
      fps: 60,
      variants: [
        { id: "hfr", width: 1920, height: 1080, aspectRatio: "16:9" },
      ],
    });
    expect(result.fps).toBe(60);
  });
});

describe("ScriptSchema full integration edge cases", () => {
  it("should handle a script with many scenes", () => {
    const scenes = Array.from({ length: 50 }, (_, i) => ({
      type: "title" as const,
      id: `scene-${i}`,
      duration: 2,
      heading: `Scene ${i}`,
    }));

    const result = ScriptSchema.parse({
      meta: { title: "Big Script" },
      scenes,
    });

    expect(result.scenes).toHaveLength(50);
  });

  it("should reject a script with no meta", () => {
    const result = ScriptSchema.safeParse({
      scenes: [
        { type: "title", id: "intro", duration: 3, heading: "Hello" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("should handle complex real-world script structure", () => {
    const result = ScriptSchema.parse({
      meta: { title: "Complete Tutorial" },
      brand: {
        logo: "./logo.png",
        primaryColor: "#059669",
        backgroundColor: "#111827",
        textColor: "#f9fafb",
        fontFamily: "Poppins",
      },
      output: {
        fps: 30,
        variants: [
          { id: "desktop", width: 1920, height: 1080, aspectRatio: "16:9" },
          {
            id: "mobile",
            width: 1080,
            height: 1920,
            aspectRatio: "9:16",
            viewport: { width: 390, height: 693 },
          },
          {
            id: "square",
            width: 1080,
            height: 1080,
            aspectRatio: "1:1",
          },
        ],
      },
      scenes: [
        {
          type: "title",
          id: "intro",
          duration: 5,
          heading: "Getting Started",
          subheading: "Everything you need to know",
          variant: "main",
        },
        {
          type: "browser",
          id: "login",
          url: "https://app.example.com/login",
          steps: [
            {
              action: "navigate",
              url: "https://app.example.com/login",
              duration: 3,
              caption: {
                text: "Open the login page",
                position: "bottom",
                style: "bar",
                animation: "slideUp",
              },
            },
            {
              action: "fill",
              selector: "#email",
              value: "user@example.com",
              typeSpeed: 60,
              duration: 3,
              caption: {
                text: "Enter your email address",
                position: "bottom",
                style: "subtitle",
                animation: "fadeIn",
              },
            },
            {
              action: "fill",
              selector: "#password",
              value: "SecurePass123",
              typeSpeed: 40,
              duration: 2,
            },
            {
              action: "click",
              selector: "button[type='submit']",
              highlight: true,
              duration: 2,
              caption: {
                text: "Click Sign In",
                position: "bottom",
                style: "pill",
                animation: "slideUp",
              },
            },
            {
              action: "wait",
              timeout: 2000,
              duration: 3,
              caption: {
                text: "Welcome to the dashboard!",
                position: "center",
                style: "bubble",
                animation: "typewriter",
              },
            },
          ],
          selectorOverrides: {
            mobile: {
              "button[type='submit']": ".mobile-submit-btn",
            },
          },
        },
        {
          type: "title",
          id: "chapter-2",
          duration: 3,
          heading: "Managing Settings",
          variant: "chapter",
        },
        {
          type: "browser",
          id: "settings",
          url: "https://app.example.com/settings",
          steps: [
            {
              action: "navigate",
              url: "https://app.example.com/settings",
              duration: 3,
            },
            { action: "scroll", y: 400, smooth: true, duration: 2 },
            {
              action: "click",
              selector: "#save-btn",
              highlight: true,
              duration: 2,
            },
          ],
        },
        {
          type: "title",
          id: "outro",
          duration: 4,
          heading: "You're all set!",
          subheading: "Happy building!",
          variant: "outro",
        },
      ],
    });

    expect(result.scenes).toHaveLength(5);
    expect(result.output.variants).toHaveLength(3);
    expect(result.brand.logo).toBe("./logo.png");

    // Check browser scene
    const loginScene = result.scenes[1];
    if (loginScene.type === "browser") {
      expect(loginScene.steps).toHaveLength(5);
      expect(loginScene.selectorOverrides?.mobile).toBeDefined();
    }
  });
});
