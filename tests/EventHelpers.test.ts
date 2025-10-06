import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventHelpers } from "../src/lib/Helpers/EventHelpers";
import { rootServer } from "@rootsdk/server-app";

vi.mock("@rootsdk/server-app", () => ({
  rootServer: {
    community: {
      channelMessages: {
        create: vi.fn(),
      },
      communityMembers: {
        get: vi.fn().mockResolvedValue({ nickname: "TestUser" }),
      },
    },
  },
}));

describe("EventHelpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with channelId", () => {
      const helpers = new EventHelpers("test-channel" as any);
      expect(helpers).toBeInstanceOf(EventHelpers);
    });
  });

  describe("reply", () => {
    it("should call create with correct parameters", async () => {
      const helpers = new EventHelpers("test-channel" as any);
      const message = "Test reply";

      await helpers.reply(message);

      expect(rootServer.community.channelMessages.create).toHaveBeenCalledWith({
        channelId: "test-channel",
        content: message,
      });
    });

    it("should handle empty message", async () => {
      const helpers = new EventHelpers("test-channel" as any);

      await helpers.reply("");

      expect(rootServer.community.channelMessages.create).toHaveBeenCalledWith({
        channelId: "test-channel",
        content: "",
      });
    });
  });

  describe("channel helper", () => {
    it("should provide channel ID", () => {
      const helpers = new EventHelpers("test-channel" as any);
      expect(helpers.channel.id).toBe("test-channel");
    });
  });
});
