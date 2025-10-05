import { describe, it, expect, vi, beforeEach } from "vitest";
import { createLogger } from "../src/lib/Utils/Logger";

describe("Logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createLogger", () => {
    it("should create a logger with the specified name", () => {
      const logger = createLogger("TestLogger");
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.error).toBe("function");
      expect(typeof logger.warn).toBe("function");
      expect(typeof logger.debug).toBe("function");
    });

    it("should create different logger instances", () => {
      const logger1 = createLogger("Logger1");
      const logger2 = createLogger("Logger2");
      expect(logger1).not.toBe(logger2);
    });
  });

  describe("logger methods", () => {
    it("should have all logging methods", () => {
      const logger = createLogger("TestLogger");

      expect(logger).toHaveProperty("info");
      expect(logger).toHaveProperty("error");
      expect(logger).toHaveProperty("warn");
      expect(logger).toHaveProperty("debug");
      expect(logger).toHaveProperty("trace");
      expect(logger).toHaveProperty("fatal");
    });
  });
});
