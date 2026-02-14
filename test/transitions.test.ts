import { describe, it, expect } from "vitest";
import {
  fadeTransition,
  slideTransition,
  zoomTransition,
  applyTransition,
} from "../src/composer/transitions/index.js";

describe("fadeTransition", () => {
  it("should be 0 at frame 0", () => {
    expect(fadeTransition(0, 100, 10)).toBe(0);
  });

  it("should be 1 after transition completes", () => {
    expect(fadeTransition(15, 100, 10)).toBe(1);
  });

  it("should be 0 at last frame", () => {
    expect(fadeTransition(100, 100, 10)).toBe(0);
  });

  it("should be 0.5 at midpoint of fade-in", () => {
    expect(fadeTransition(5, 100, 10)).toBeCloseTo(0.5);
  });

  it("should be 1 in the middle of the scene", () => {
    expect(fadeTransition(50, 100, 10)).toBe(1);
  });
});

describe("slideTransition", () => {
  it("should have offset at start", () => {
    const result = slideTransition(0, 100, 10, "left");
    expect(result.opacity).toBe(0);
    expect(result.transform).toContain("translateX");
    expect(result.transform).toContain("-100");
  });

  it("should settle to no offset mid-scene", () => {
    const result = slideTransition(50, 100, 10, "left");
    expect(result.opacity).toBe(1);
    expect(result.transform).toContain("0");
  });

  it("should support right direction", () => {
    const result = slideTransition(0, 100, 10, "right");
    expect(result.transform).toContain("translateX");
    expect(result.transform).toContain("100");
  });

  it("should support up direction", () => {
    const result = slideTransition(0, 100, 10, "up");
    expect(result.transform).toContain("translateY");
    expect(result.transform).toContain("-100");
  });

  it("should support down direction", () => {
    const result = slideTransition(0, 100, 10, "down");
    expect(result.transform).toContain("translateY");
    expect(result.transform).toContain("100");
  });
});

describe("zoomTransition", () => {
  it("should start zoomed out", () => {
    const result = zoomTransition(0, 100, 10);
    expect(result.opacity).toBe(0);
    expect(result.transform).toContain("scale(0.8)");
  });

  it("should be at normal scale mid-scene", () => {
    const result = zoomTransition(50, 100, 10);
    expect(result.opacity).toBe(1);
    expect(result.transform).toContain("scale(1)");
  });

  it("should zoom out at end", () => {
    const result = zoomTransition(100, 100, 10);
    expect(result.opacity).toBe(0);
    expect(result.transform).toContain("scale(1.2)");
  });
});

describe("applyTransition", () => {
  it("should return opacity for fade type", () => {
    const result = applyTransition("fade", 50, 100, 10);
    expect(result.opacity).toBe(1);
    expect(result.transform).toBeUndefined();
  });

  it("should return transform for slide type", () => {
    const result = applyTransition("slide", 0, 100, 10, "left");
    expect(result.opacity).toBe(0);
    expect(result.transform).toBeDefined();
  });

  it("should return transform for zoom type", () => {
    const result = applyTransition("zoom", 50, 100, 10);
    expect(result.opacity).toBe(1);
    expect(result.transform).toContain("scale");
  });

  it("should return opacity 1 for none type", () => {
    const result = applyTransition("none", 0, 100, 10);
    expect(result.opacity).toBe(1);
    expect(result.transform).toBeUndefined();
  });
});
