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
      cooldown: 3, // 3 seconds cooldown
    });
  }

  async validate(context: CommandContext): Promise<boolean> {
    if (context.args.length === 0) {
      await context.helpers.reply("❌ Please provide a message to echo!");
      return false;
    }
    return true;
  }

  async execute(context: CommandContext<ChannelMessageCreatedEvent>): Promise<void> {
    const message = context.args.join(" ");

    await context.helpers.reply(`🔊 ${message}`);
  }
}
