import { RootCommand, type CommandContext } from "rdx.js";
import type { ChannelMessageCreatedEvent } from "@rootsdk/server-app";

export default class PingCommand extends RootCommand<ChannelMessageCreatedEvent> {
  constructor() {
    super({
      name: "ping",
      description: "Check if the app is responding",
      aliases: ["p"],
      examples: ["ping"],
      category: "Utility",
      cooldown: 3, // 3 seconds cooldown
    });
  }

  async execute(context: CommandContext<ChannelMessageCreatedEvent>): Promise<void> {
    const start = Date.now();

    await context.helpers.reply("🏓 Pong!", true); // Include @mention at the beginning of the message

    const latency = Date.now() - start;
    await context.helpers.reply(
      `${await context.helpers.mention()} ⚡ Response time: ${latency}ms`
    );
  }
}
