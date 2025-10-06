import { RootCommand, type CommandContext } from "rdx.js";
import type { ChannelMessageCreatedEvent } from "@rootsdk/server-app";

export default class EchoCommand extends RootCommand {
  constructor() {
    super({
      name: "echo",
      description: "Echo back a message",
      args: [
        {
          name: "message",
          description: "Message to echo",
          required: true,
        },
      ],
      examples: ["echo Hello World!", "echo This is a test"],
      category: "Fun",
      cooldown: 3,
    });
  }

  async validate({ ctx, args }: CommandContext): Promise<boolean> {
    if (args.length === 0) {
      await ctx.reply("❌ Please provide a message to echo!", { includeMention: true });
      return false;
    }

    return true;
  }

  async execute({ ctx, args }: CommandContext<ChannelMessageCreatedEvent>): Promise<void> {
    const message = args.join(" ");

    await ctx.reply(`🔊 ${message}`);
  }
}
