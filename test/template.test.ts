import { describe, it, expect } from "vitest";
import { generateTemplate } from "../src/template.js";
import { parseScriptString } from "../src/schema/parser.js";

describe("generateTemplate", () => {
  it("should generate valid YAML that passes schema validation", () => {
    const yaml = generateTemplate("my-project");
    const script = parseScriptString(yaml);

    expect(script.meta.title).toBe("my-project");
    expect(script.scenes).toHaveLength(3);
  });

  it("should include the project name in the title scene heading", () => {
    const yaml = generateTemplate("awesome-demo");
    const script = parseScriptString(yaml);

    expect(script.meta.title).toBe("awesome-demo");
    const titleScene = script.scenes[0];
    if (titleScene.type === "title") {
      expect(titleScene.heading).toBe("awesome-demo");
    }
  });

  it("should generate a script with intro, browser, and outro scenes", () => {
    const yaml = generateTemplate("test");
    const script = parseScriptString(yaml);

    expect(script.scenes[0].type).toBe("title");
    expect(script.scenes[1].type).toBe("browser");
    expect(script.scenes[2].type).toBe("title");
  });

  it("should have an outro scene with outro variant", () => {
    const yaml = generateTemplate("test");
    const script = parseScriptString(yaml);

    const outro = script.scenes[2];
    if (outro.type === "title") {
      expect(outro.variant).toBe("outro");
    }
  });

  it("should set default brand colours", () => {
    const yaml = generateTemplate("test");
    const script = parseScriptString(yaml);

    expect(script.brand.primaryColor).toBe("#1e40af");
    expect(script.brand.backgroundColor).toBe("#0f172a");
    expect(script.brand.textColor).toBe("#f8fafc");
    expect(script.brand.fontFamily).toBe("Inter");
  });

  it("should set desktop variant at 1920x1080", () => {
    const yaml = generateTemplate("test");
    const script = parseScriptString(yaml);

    expect(script.output.variants).toHaveLength(1);
    expect(script.output.variants[0].id).toBe("desktop");
    expect(script.output.variants[0].width).toBe(1920);
    expect(script.output.variants[0].height).toBe(1080);
  });

  it("should include a caption in the browser scene", () => {
    const yaml = generateTemplate("test");
    const script = parseScriptString(yaml);

    const browser = script.scenes[1];
    if (browser.type === "browser") {
      expect(browser.steps[0].caption?.text).toBe("Open the website");
    }
  });

  it("should handle names with spaces", () => {
    const yaml = generateTemplate("My Tutorial Project");
    const script = parseScriptString(yaml);

    expect(script.meta.title).toBe("My Tutorial Project");
  });

  it("should handle names with special characters", () => {
    const yaml = generateTemplate("project-v2.0");
    const script = parseScriptString(yaml);

    expect(script.meta.title).toBe("project-v2.0");
  });
});
