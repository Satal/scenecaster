import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createLogger } from "../src/utils/logger.js";

describe("createLogger", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("verbose mode", () => {
    it("should log info messages when verbose is true", () => {
      const logger = createLogger(true);
      logger.info("test message");

      expect(consoleSpy).toHaveBeenCalledTimes(1);
    });

    it("should NOT log info messages when verbose is false", () => {
      const logger = createLogger(false);
      logger.info("test message");

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("should default to non-verbose", () => {
      const logger = createLogger();
      logger.info("test message");

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe("always-visible methods", () => {
    it("should always log success messages", () => {
      const logger = createLogger(false);
      logger.success("done!");

      expect(consoleSpy).toHaveBeenCalledTimes(1);
    });

    it("should always log warn messages", () => {
      const logger = createLogger(false);
      logger.warn("careful!");

      expect(consoleSpy).toHaveBeenCalledTimes(1);
    });

    it("should always log error messages to stderr", () => {
      const logger = createLogger(false);
      logger.error("something broke");

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("spinner", () => {
    it("should return an ora spinner instance", () => {
      const logger = createLogger();
      const spinner = logger.spinner("Loading...");

      // Ora spinner has these methods
      expect(typeof spinner.succeed).toBe("function");
      expect(typeof spinner.fail).toBe("function");
      expect(typeof spinner.stop).toBe("function");

      spinner.stop(); // Clean up
    });
  });
});
