import { describe, it, expect } from "vitest";
import {
  buildCompositionProps,
  sanitizeFilename,
} from "../src/pipeline/index.js";
import type { Script, OutputVariant } from "../src/schema/script.schema.js";
import type { RecordingResult } from "../src/pipeline/types.js";
import { ScriptSchema } from "../src/schema/script.schema.js";

// ── sanitizeFilename ──

describe("sanitizeFilename", () => {
  it("should lowercase and hyphenate a simple title", () => {
    expect(sanitizeFilename("How to Add a Team Member")).toBe(
      "how-to-add-a-team-member"
    );
  });

  it("should strip leading and trailing hyphens", () => {
    expect(sanitizeFilename("---Hello World---")).toBe("hello-world");
  });

  it("should replace special characters with hyphens", () => {
    expect(sanitizeFilename("Video: Part 1 (Tutorial)")).toBe(
      "video-part-1-tutorial"
    );
  });

  it("should collapse multiple hyphens", () => {
    expect(sanitizeFilename("Hello   World")).toBe("hello-world");
  });

  it("should handle single word", () => {
    expect(sanitizeFilename("Tutorial")).toBe("tutorial");
  });

  it("should handle numbers", () => {
    expect(sanitizeFilename("Step 1 of 5")).toBe("step-1-of-5");
  });

  it("should handle unicode characters", () => {
    expect(sanitizeFilename("Colour & Design")).toBe("colour-design");
  });

  it("should handle empty string", () => {
    expect(sanitizeFilename("")).toBe("");
  });

  it("should handle only special characters", () => {
    expect(sanitizeFilename("!!!@@@")).toBe("");
  });

  it("should handle emojis", () => {
    expect(sanitizeFilename("Hello 🎬 World")).toBe("hello-world");
  });
});

// ── buildCompositionProps ──

describe("buildCompositionProps", () => {
  const baseScript: Script = ScriptSchema.parse({
    meta: { title: "Test Video" },
    output: {
      fps: 30,
      variants: [
        { id: "desktop", width: 1920, height: 1080, aspectRatio: "16:9" },
      ],
    },
    scenes: [
      {
        type: "title",
        id: "intro",
        duration: 4,
        heading: "Welcome",
        subheading: "Let's get started",
      },
      {
        type: "browser",
        id: "demo",
        url: "https://example.com",
        steps: [
          {
            action: "navigate",
            url: "https://example.com",
            duration: 3,
            caption: { text: "Go to homepage" },
          },
        ],
      },
      {
        type: "title",
        id: "outro",
        duration: 3,
        heading: "Done!",
        variant: "outro",
      },
    ],
  });

  const desktopVariant: OutputVariant = {
    id: "desktop",
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
  };

  const mockRecording: RecordingResult = {
    sceneId: "demo",
    variantId: "desktop",
    videoPath: "/tmp/scenecaster/recordings/demo/desktop/video.webm",
    durationMs: 5000,
    timestamps: [
      {
        stepIndex: 0,
        startMs: 0,
        endMs: 3000,
        caption: {
          text: "Go to homepage",
          position: "bottom",
          style: "bar",
          animation: "slideUp",
        },
      },
    ],
  };

  it("should build composition props with correct structure", () => {
    const recordings = new Map([["demo", mockRecording]]);
    const result = buildCompositionProps(baseScript, desktopVariant, recordings);

    expect(result.fps).toBe(30);
    expect(result.width).toBe(1920);
    expect(result.height).toBe(1080);
    expect(result.scenes).toHaveLength(3);
  });

  it("should convert title scene duration to frames", () => {
    const recordings = new Map([["demo", mockRecording]]);
    const result = buildCompositionProps(baseScript, desktopVariant, recordings);

    const intro = result.scenes[0];
    expect(intro.type).toBe("title");
    expect(intro.durationFrames).toBe(120); // 4s * 30fps
    expect(intro.heading).toBe("Welcome");
    expect(intro.subheading).toBe("Let's get started");
  });

  it("should convert browser scene duration from recording ms to frames", () => {
    const recordings = new Map([["demo", mockRecording]]);
    const result = buildCompositionProps(baseScript, desktopVariant, recordings);

    const browser = result.scenes[1];
    expect(browser.type).toBe("browser");
    expect(browser.durationFrames).toBe(150); // 5000ms / 1000 * 30fps
    expect(browser.videoPath).toBe(
      "/tmp/scenecaster/recordings/demo/desktop/video.webm"
    );
    expect(browser.timestamps).toHaveLength(1);
  });

  it("should carry title variant through", () => {
    const recordings = new Map([["demo", mockRecording]]);
    const result = buildCompositionProps(baseScript, desktopVariant, recordings);

    const outro = result.scenes[2];
    expect(outro.titleVariant).toBe("outro");
  });

  it("should pass brand config through", () => {
    const recordings = new Map([["demo", mockRecording]]);
    const result = buildCompositionProps(baseScript, desktopVariant, recordings);

    expect(result.brand.primaryColor).toBe("#1e40af");
    expect(result.brand.backgroundColor).toBe("#0f172a");
    expect(result.brand.fontFamily).toBe("Inter");
  });

  it("should use variant dimensions", () => {
    const recordings = new Map([["demo", mockRecording]]);
    const mobileVariant: OutputVariant = {
      id: "mobile",
      width: 1080,
      height: 1920,
      aspectRatio: "9:16",
    };

    const result = buildCompositionProps(
      baseScript,
      mobileVariant,
      recordings
    );
    expect(result.width).toBe(1080);
    expect(result.height).toBe(1920);
  });

  it("should throw if recording is missing for a browser scene", () => {
    const emptyRecordings = new Map<string, RecordingResult>();

    expect(() =>
      buildCompositionProps(baseScript, desktopVariant, emptyRecordings)
    ).toThrow('No recording found for scene "demo"');
  });

  it("should handle title-only scripts (no recordings needed)", () => {
    const titleOnly: Script = ScriptSchema.parse({
      meta: { title: "Title Only" },
      scenes: [
        { type: "title", id: "intro", duration: 5, heading: "Hello" },
        { type: "title", id: "outro", duration: 3, heading: "Bye" },
      ],
    });

    const recordings = new Map<string, RecordingResult>();
    const result = buildCompositionProps(
      titleOnly,
      desktopVariant,
      recordings
    );

    expect(result.scenes).toHaveLength(2);
    expect(result.scenes[0].durationFrames).toBe(150); // 5s * 30fps
    expect(result.scenes[1].durationFrames).toBe(90); // 3s * 30fps
  });

  it("should handle different FPS values", () => {
    const script24: Script = ScriptSchema.parse({
      meta: { title: "24fps" },
      output: {
        fps: 24,
        variants: [
          { id: "desktop", width: 1920, height: 1080, aspectRatio: "16:9" },
        ],
      },
      scenes: [
        { type: "title", id: "intro", duration: 5, heading: "Hello" },
      ],
    });

    const recordings = new Map<string, RecordingResult>();
    const result = buildCompositionProps(
      script24,
      desktopVariant,
      recordings
    );

    expect(result.fps).toBe(24);
    expect(result.scenes[0].durationFrames).toBe(120); // 5s * 24fps
  });

  it("should preserve action timestamps in browser scenes", () => {
    const recording: RecordingResult = {
      sceneId: "demo",
      variantId: "desktop",
      videoPath: "/tmp/video.webm",
      durationMs: 8000,
      timestamps: [
        { stepIndex: 0, startMs: 0, endMs: 3000 },
        {
          stepIndex: 1,
          startMs: 3000,
          endMs: 5000,
          caption: {
            text: "Click here",
            position: "bottom",
            style: "bubble",
            animation: "fadeIn",
          },
        },
        { stepIndex: 2, startMs: 5000, endMs: 8000 },
      ],
    };

    const recordings = new Map([["demo", recording]]);
    const result = buildCompositionProps(baseScript, desktopVariant, recordings);

    const browserScene = result.scenes[1];
    expect(browserScene.timestamps).toHaveLength(3);
    expect(browserScene.timestamps![1].caption?.text).toBe("Click here");
    expect(browserScene.timestamps![1].caption?.style).toBe("bubble");
  });
});
