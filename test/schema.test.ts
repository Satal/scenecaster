import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import {
  parseScriptFile,
  parseScriptString,
  validateScriptFile,
  ScriptParseError,
} from "../src/schema/parser.js";
import { ScriptSchema } from "../src/schema/script.schema.js";

const fixturesDir = resolve(import.meta.dirname, "fixtures");

describe("ScriptSchema", () => {
  it("should parse a minimal valid script", () => {
    const result = ScriptSchema.safeParse({
      meta: { title: "Test" },
      scenes: [
        { type: "title", id: "intro", duration: 3, heading: "Hello" },
      ],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.meta.title).toBe("Test");
      expect(result.data.scenes).toHaveLength(1);
      expect(result.data.output.fps).toBe(30); // default
      expect(result.data.brand.primaryColor).toBe("#1e40af"); // default
    }
  });

  it("should apply default values for brand", () => {
    const result = ScriptSchema.parse({
      meta: { title: "Test" },
      scenes: [
        { type: "title", id: "intro", duration: 3, heading: "Hello" },
      ],
    });

    expect(result.brand.primaryColor).toBe("#1e40af");
    expect(result.brand.backgroundColor).toBe("#0f172a");
    expect(result.brand.textColor).toBe("#f8fafc");
    expect(result.brand.fontFamily).toBe("Inter");
  });

  it("should parse a full browser scene with all action types", () => {
    const result = ScriptSchema.parse({
      meta: { title: "Full Test" },
      scenes: [
        {
          type: "browser",
          id: "demo",
          url: "https://example.com",
          steps: [
            { action: "navigate", url: "https://example.com", duration: 2 },
            { action: "click", selector: "#btn", duration: 1 },
            {
              action: "fill",
              selector: "#input",
              value: "hello",
              duration: 2,
            },
            { action: "scroll", y: 300, duration: 1 },
            { action: "wait", timeout: 1000, duration: 1 },
          ],
        },
      ],
    });

    expect(result.scenes).toHaveLength(1);
    const scene = result.scenes[0];
    expect(scene.type).toBe("browser");
    if (scene.type === "browser") {
      expect(scene.steps).toHaveLength(5);
      expect(scene.steps[0].action).toBe("navigate");
      expect(scene.steps[1].action).toBe("click");
      expect(scene.steps[2].action).toBe("fill");
      expect(scene.steps[3].action).toBe("scroll");
      expect(scene.steps[4].action).toBe("wait");
    }
  });

  it("should reject missing meta.title", () => {
    const result = ScriptSchema.safeParse({
      meta: {},
      scenes: [
        { type: "title", id: "intro", duration: 3, heading: "Hello" },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("should reject empty scenes array", () => {
    const result = ScriptSchema.safeParse({
      meta: { title: "Test" },
      scenes: [],
    });

    expect(result.success).toBe(false);
  });

  it("should reject invalid action type", () => {
    const result = ScriptSchema.safeParse({
      meta: { title: "Test" },
      scenes: [
        {
          type: "browser",
          id: "demo",
          url: "https://example.com",
          steps: [{ action: "teleport", destination: "mars", duration: 1 }],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("should parse caption with defaults", () => {
    const result = ScriptSchema.parse({
      meta: { title: "Test" },
      scenes: [
        {
          type: "browser",
          id: "demo",
          url: "https://example.com",
          steps: [
            {
              action: "navigate",
              url: "https://example.com",
              duration: 2,
              caption: { text: "Hello" },
            },
          ],
        },
      ],
    });

    const scene = result.scenes[0];
    if (scene.type === "browser") {
      const caption = scene.steps[0].caption!;
      expect(caption.text).toBe("Hello");
      expect(caption.position).toBe("bottom"); // default
      expect(caption.style).toBe("bar"); // default
      expect(caption.animation).toBe("slideUp"); // default
    }
  });

  it("should parse selector overrides", () => {
    const result = ScriptSchema.parse({
      meta: { title: "Test" },
      scenes: [
        {
          type: "browser",
          id: "demo",
          url: "https://example.com",
          steps: [
            { action: "click", selector: "#desktop-btn", duration: 1 },
          ],
          selectorOverrides: {
            mobile: {
              "#desktop-btn": ".mobile-btn",
            },
          },
        },
      ],
    });

    const scene = result.scenes[0];
    if (scene.type === "browser") {
      expect(scene.selectorOverrides?.mobile?.["#desktop-btn"]).toBe(
        ".mobile-btn"
      );
    }
  });

  it("should parse multiple output variants", () => {
    const result = ScriptSchema.parse({
      meta: { title: "Test" },
      output: {
        fps: 24,
        variants: [
          { id: "desktop", width: 1920, height: 1080, aspectRatio: "16:9" },
          {
            id: "mobile",
            width: 1080,
            height: 1920,
            aspectRatio: "9:16",
            viewport: { width: 390, height: 693 },
          },
        ],
      },
      scenes: [
        { type: "title", id: "intro", duration: 3, heading: "Hello" },
      ],
    });

    expect(result.output.fps).toBe(24);
    expect(result.output.variants).toHaveLength(2);
    expect(result.output.variants[1].viewport).toEqual({
      width: 390,
      height: 693,
    });
  });
});

describe("parseScriptFile", () => {
  it("should parse a valid minimal YAML file", () => {
    const script = parseScriptFile(resolve(fixturesDir, "valid-minimal.yaml"));

    expect(script.meta.title).toBe("Minimal Test");
    expect(script.scenes).toHaveLength(1);
  });

  it("should parse a valid full YAML file", () => {
    const script = parseScriptFile(resolve(fixturesDir, "valid-full.yaml"));

    expect(script.meta.title).toBe("Full Feature Test");
    expect(script.scenes).toHaveLength(3);
    expect(script.output.fps).toBe(24);
    expect(script.output.variants).toHaveLength(2);
    expect(script.brand.primaryColor).toBe("#ef4444");
  });

  it("should throw for non-existent file", () => {
    expect(() => parseScriptFile("/nonexistent/file.yaml")).toThrow(
      ScriptParseError
    );
  });

  it("should throw for empty file", () => {
    expect(() =>
      parseScriptFile(resolve(fixturesDir, "invalid-empty.yaml"))
    ).toThrow(ScriptParseError);
  });

  it("should throw for invalid script (no scenes)", () => {
    expect(() =>
      parseScriptFile(resolve(fixturesDir, "invalid-no-scenes.yaml"))
    ).toThrow(ScriptParseError);
  });

  it("should throw for invalid action type", () => {
    expect(() =>
      parseScriptFile(resolve(fixturesDir, "invalid-bad-action.yaml"))
    ).toThrow(ScriptParseError);
  });
});

describe("validateScriptFile", () => {
  it("should return valid for correct scripts", () => {
    const result = validateScriptFile(
      resolve(fixturesDir, "valid-minimal.yaml")
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it("should return errors for invalid scripts", () => {
    const result = validateScriptFile(
      resolve(fixturesDir, "invalid-no-scenes.yaml")
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });
});

describe("parseScriptString", () => {
  it("should parse YAML strings", () => {
    const yaml = `
meta:
  title: "String Test"
scenes:
  - type: title
    id: intro
    duration: 3
    heading: "Hello"
`;
    const script = parseScriptString(yaml);
    expect(script.meta.title).toBe("String Test");
  });

  it("should throw for invalid YAML syntax", () => {
    expect(() => parseScriptString("{ invalid yaml [")).toThrow(
      ScriptParseError
    );
  });
});
