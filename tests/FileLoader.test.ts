import { describe, it, expect, vi, beforeEach } from "vitest";
import { FileLoader } from "../src/lib/Utils/FileLoader";
import type { LoaderOptions } from "../src/lib/Utils/FileLoader";
import { existsSync } from "node:fs";

vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(() => []),
  statSync: vi.fn(),
}));

describe("FileLoader", () => {
  const mockOptions: LoaderOptions = {
    baseDir: "/mock/base",
    commandsDir: "/mock/base/commands",
    eventsDir: "/mock/base/events",
    jobsDir: "/mock/base/jobs",
    commandsFolderName: "commands",
    eventsFolderName: "events",
    jobsFolderName: "jobs",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with provided options", () => {
      const loader = new FileLoader(mockOptions);
      expect(loader).toBeInstanceOf(FileLoader);
    });
  });

  describe("loadCommands", () => {
    it("should return empty map when directory does not exist", async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const loader = new FileLoader(mockOptions);
      const commands = await loader.loadCommands();

      expect(commands.size).toBe(0);
    });
  });

  describe("loadEvents", () => {
    it("should return empty map when directory does not exist", async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const loader = new FileLoader(mockOptions);
      const events = await loader.loadEvents();

      expect(events.size).toBe(0);
    });
  });

  describe("loadJobs", () => {
    it("should return empty map when directory does not exist", async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const loader = new FileLoader(mockOptions);
      const jobs = await loader.loadJobs();

      expect(jobs.size).toBe(0);
    });
  });
});
