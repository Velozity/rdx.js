import { describe, it, expect, vi } from "vitest";
import type { ChannelMessageCreatedEvent } from "@rootsdk/server-app";
import { HelpCommand } from "../src/lib/BaseCommands/HelpCommand";
import { RootCommand } from "../src/lib/RootCommand";
import type { CommandContext } from "../src/lib/RootCommand";
import { CommandHelpers } from "../src/lib/Helpers/CommandHelpers";

class MockCommand extends RootCommand {
  constructor() {
    super({
      name: "mock",
      description: "A mock command",
      category: "Test",
      aliases: ["m"],
    });
  }

  async execute(): Promise<void> {}
}

describe("HelpCommand", () => {
  describe("constructor", () => {
    it("should initialize with correct properties", () => {
      const commands = new Map();
      const helpCommand = new HelpCommand(commands);

      expect(helpCommand.name).toBe("help");
      expect(helpCommand.description).toContain("available commands");
      expect(helpCommand.aliases).toContain("h");
      expect(helpCommand.category).toBe("Utility");
    });
  });

  describe("execute", () => {
    it("should list all commands when no argument is provided", async () => {
      const mockCommand = new MockCommand();
      const commands = new Map([["mock", mockCommand]]);
      const helpCommand = new HelpCommand(commands);

      const mockReply = vi.fn();
      const mockHelpers = {
        reply: mockReply,
      } as unknown as CommandHelpers;

      const mockContext = {
        args: [],
        ctx: {} as ChannelMessageCreatedEvent,
        client: {} as any,
        helpers: mockHelpers,
      } as CommandContext<ChannelMessageCreatedEvent>;

      await helpCommand.execute(mockContext);

      expect(mockReply).toHaveBeenCalled();
      const replyMessage = mockReply.mock.calls[0][0];
      expect(replyMessage).toContain("Available Commands");
    });

    it("should show specific command help when command name is provided", async () => {
      const mockCommand = new MockCommand();
      const commands = new Map([["mock", mockCommand]]);
      const helpCommand = new HelpCommand(commands);

      const mockReply = vi.fn();
      const mockHelpers = {
        reply: mockReply,
      } as unknown as CommandHelpers;

      const mockContext = {
        args: ["mock"],
        ctx: {} as ChannelMessageCreatedEvent,
        client: {} as any,
        helpers: mockHelpers,
      } as CommandContext<ChannelMessageCreatedEvent>;

      await helpCommand.execute(mockContext);

      expect(mockReply).toHaveBeenCalled();
      const replyMessage = mockReply.mock.calls[0][0];
      expect(replyMessage).toContain("mock");
      expect(replyMessage).toContain("A mock command");
    });

    it("should show error message for unknown command", async () => {
      const commands = new Map();
      const helpCommand = new HelpCommand(commands);

      const mockReply = vi.fn();
      const mockHelpers = {
        reply: mockReply,
      } as unknown as CommandHelpers;

      const mockContext = {
        args: ["nonexistent"],
        ctx: {} as ChannelMessageCreatedEvent,
        client: {} as any,
        helpers: mockHelpers,
      } as CommandContext<ChannelMessageCreatedEvent>;

      await helpCommand.execute(mockContext);

      expect(mockReply).toHaveBeenCalled();
      const replyMessage = mockReply.mock.calls[0][0];
      expect(replyMessage).toContain("not found");
    });
  });
});
