// SDK Compatibility Tests
// These tests verify that the Root SDK APIs we depend on still exist

import { describe, it, expect } from "vitest";

describe("Root SDK Compatibility", () => {
  it("should import @rootsdk/server-app without errors", async () => {
    await expect(import("@rootsdk/server-app")).resolves.toBeDefined();
  });

  it("should have rootServer with expected structure", async () => {
    const { rootServer } = await import("@rootsdk/server-app");

    expect(rootServer).toBeDefined();
    expect(rootServer.lifecycle).toBeDefined();
    expect(rootServer.community).toBeDefined();
    expect(rootServer.jobScheduler).toBeDefined();
  });

  it("should have community.channelMessages with expected methods", async () => {
    const { rootServer } = await import("@rootsdk/server-app");

    expect(rootServer.community.channelMessages).toBeDefined();
    expect(typeof rootServer.community.channelMessages.create).toBe("function");
    expect(typeof rootServer.community.channelMessages.delete).toBe("function");
    expect(typeof rootServer.community.channelMessages.on).toBe("function");
  });

  it("should have community.communityMembers with expected methods", async () => {
    const { rootServer } = await import("@rootsdk/server-app");

    expect(rootServer.community.communityMembers).toBeDefined();
    expect(typeof rootServer.community.communityMembers.get).toBe("function");
  });

  it("should have jobScheduler with expected methods", async () => {
    const { rootServer } = await import("@rootsdk/server-app");

    expect(rootServer.jobScheduler).toBeDefined();
    expect(typeof rootServer.jobScheduler.create).toBe("function");
    expect(typeof rootServer.jobScheduler.on).toBe("function");
  });

  it("should have lifecycle with expected methods", async () => {
    const { rootServer } = await import("@rootsdk/server-app");

    expect(rootServer.lifecycle).toBeDefined();
    expect(typeof rootServer.lifecycle.start).toBe("function");
    expect(typeof rootServer.lifecycle.addService).toBe("function");
  });

  it("should export ChannelMessageEvent enum", async () => {
    const { ChannelMessageEvent } = await import("@rootsdk/server-app");

    expect(ChannelMessageEvent).toBeDefined();
    expect(ChannelMessageEvent.ChannelMessageCreated).toBeDefined();
    expect(ChannelMessageEvent.ChannelMessageDeleted).toBeDefined();
  });

  it("should export JobScheduleEvent enum", async () => {
    const { JobScheduleEvent } = await import("@rootsdk/server-app");

    expect(JobScheduleEvent).toBeDefined();
    expect(JobScheduleEvent.Job).toBeDefined();
  });
});
