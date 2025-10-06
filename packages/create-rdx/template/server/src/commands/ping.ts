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
      cooldown: 3,
    });
  }

  async execute({ ctx }: CommandContext<ChannelMessageCreatedEvent>): Promise<void> {
    const start = Date.now();

    await ctx.reply("🏓 Pong!", { includeMention: true });

    const latency = Date.now() - start;
    await ctx.reply(`${await ctx.mention()} ⚡ Response time: ${latency}ms`);
  }
}
