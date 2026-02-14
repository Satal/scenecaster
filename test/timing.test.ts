import { describe, it, expect } from "vitest";
import {
  secondsToFrames,
  msToFrames,
  framesToSeconds,
} from "../src/utils/timing.js";

describe("timing utilities", () => {
  describe("secondsToFrames", () => {
    it("should convert seconds to frames at 30fps", () => {
      expect(secondsToFrames(1, 30)).toBe(30);
      expect(secondsToFrames(2.5, 30)).toBe(75);
      expect(secondsToFrames(4, 30)).toBe(120);
    });

    it("should convert seconds to frames at 24fps", () => {
      expect(secondsToFrames(1, 24)).toBe(24);
      expect(secondsToFrames(5, 24)).toBe(120);
    });

    it("should round to nearest frame", () => {
      expect(secondsToFrames(1.1, 30)).toBe(33);
    });
  });

  describe("msToFrames", () => {
    it("should convert milliseconds to frames", () => {
      expect(msToFrames(1000, 30)).toBe(30);
      expect(msToFrames(500, 30)).toBe(15);
      expect(msToFrames(3000, 24)).toBe(72);
    });
  });

  describe("framesToSeconds", () => {
    it("should convert frames to seconds", () => {
      expect(framesToSeconds(30, 30)).toBe(1);
      expect(framesToSeconds(60, 30)).toBe(2);
      expect(framesToSeconds(45, 30)).toBe(1.5);
    });
  });
});
