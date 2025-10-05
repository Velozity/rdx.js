import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventHelpers } from "../src/lib/Helpers/EventHelpers";
import { ChannelGuid } from "@rootsdk/server-app";

describe("EventHelpers", () => {
  const mockRootServer = {
    community: {
      channelMessages: {
        create: vi.fn(),
        delete: vi.fn(),
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with channel ID and client", () => {
      const helpers = new EventHelpers("test-channel" as ChannelGuid, mockRootServer as any);
      expect(helpers).toBeInstanceOf(EventHelpers);
    });
  });

  describe("reply", () => {
    it("should call create with correct parameters", async () => {
      const helpers = new EventHelpers("test-channel" as any, mockRootServer as any);
      const message = "Test message";

      await helpers.reply(message);

      expect(mockRootServer.community.channelMessages.create).toHaveBeenCalledWith({
        channelId: "test-channel",
        content: message,
      });
    });

    it("should handle empty message", async () => {
      const helpers = new EventHelpers("test-channel" as any, mockRootServer as any);

      await helpers.reply("");

      expect(mockRootServer.community.channelMessages.create).toHaveBeenCalledWith({
        channelId: "test-channel",
        content: "",
      });
    });
  });

  describe("channel helper", () => {
    it("should provide channel ID", () => {
      const helpers = new EventHelpers("test-channel-123" as any, mockRootServer as any);
      expect(helpers.channel.id).toBe("test-channel-123");
    });
  });
});
