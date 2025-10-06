import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommandHelpers } from "../src/lib/Helpers/CommandHelpers";
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

describe("CommandHelpers", () => {
  const mockEvent = {
    channelId: "test-channel",
    messageContent: "!test command",
    userId: "user-123",
    messageId: "msg-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with event", () => {
      const helpers = new CommandHelpers(mockEvent as any);
      expect(helpers).toBeInstanceOf(CommandHelpers);
    });
  });

  describe("reply", () => {
    it("should call sendMessage with correct parameters", async () => {
      const helpers = new CommandHelpers(mockEvent as any);
      const message = "Test reply";

      await helpers.reply(message);

      expect(rootServer.community.channelMessages.create).toHaveBeenCalledWith({
        channelId: mockEvent.channelId,
        content: message,
      });
    });

    it("should handle empty message", async () => {
      const helpers = new CommandHelpers(mockEvent as any);

      await helpers.reply("");

      expect(rootServer.community.channelMessages.create).toHaveBeenCalledWith({
        channelId: mockEvent.channelId,
        content: "",
      });
    });
  });

  describe("member helper", () => {
    it("should provide member ID", () => {
      const helpers = new CommandHelpers(mockEvent as any);
      expect(helpers.member.id).toBe("user-123");
    });
  });
});
