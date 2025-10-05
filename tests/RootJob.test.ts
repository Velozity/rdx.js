import { describe, it, expect } from "vitest";
import { RootJob } from "../src/lib/RootJob";
import type { JobContext } from "../src/lib/RootJob";
import { JobInterval } from "@rootsdk/server-app";

class TestJob extends RootJob {
  constructor() {
    super({
      tag: "test-tag",
      resourceId: "test-resource",
      start: new Date("2025-01-01"),
      jobInterval: JobInterval.Daily,
      enabled: true,
    });
  }

  async execute(context: JobContext): Promise<void> {
    // Mock implementation
  }
}

describe("RootJob", () => {
  describe("constructor", () => {
    it("should initialize with correct properties", () => {
      const job = new TestJob();

      expect(job.name).toBe("test-tag");
      expect(job.tag).toBe("test-tag");
      expect(job.resourceId).toBe("test-resource");
      expect(job.jobInterval).toBe(JobInterval.Daily);
      expect(job.enabled).toBe(true);
    });

    it("should use default enabled value", () => {
      class MinimalJob extends RootJob {
        constructor() {
          super({
            tag: "minimal-tag",
            resourceId: "minimal-resource",
            start: new Date(),
            jobInterval: 5000 as any,
          });
        }

        async execute(): Promise<void> {}
      }

      const job = new MinimalJob();
      expect(job.enabled).toBe(true);
    });

    it("should handle optional end date", () => {
      const endDate = new Date("2025-12-31");

      class JobWithEnd extends RootJob {
        constructor() {
          super({
            tag: "end-tag",
            resourceId: "end-resource",
            start: new Date("2025-01-01"),
            end: endDate,
            jobInterval: 60000 as any,
          });
        }

        async execute(): Promise<void> {}
      }

      const job = new JobWithEnd();
      expect(job.end).toBe(endDate);
    });
  });

  describe("execute", () => {
    it("should be callable", async () => {
      const job = new TestJob();
      const mockContext = {
        resourceId: "test-resource",
        jobTime: Date.now(),
        jobScheduleId: "schedule-123",
        tag: "test-tag",
        rootServer: {},
      } as unknown as JobContext;

      await expect(job.execute(mockContext)).resolves.toBeUndefined();
    });
  });
});
