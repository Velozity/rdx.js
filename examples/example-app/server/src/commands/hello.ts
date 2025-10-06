import { RootCommand, type CommandContext } from "rdx.js";
import type { ChannelMessageCreatedEvent } from "@rootsdk/server-app";

export default class HelloCommand extends RootCommand<ChannelMessageCreatedEvent> {
  constructor() {
    super({
      name: "hello",
      description: "Greet someone by name",
      aliases: ["hi", "hey"],
      args: [
        {
          name: "name",
          description: "Name of the person to greet",
          required: true,
        },
      ],
      examples: ["hello John", "hi Alice", "hey Bob"],
      category: "Fun",
      cooldown: 2,
    });
  }

  async execute({ args, ctx }: CommandContext<ChannelMessageCreatedEvent>): Promise<void> {
    const name = args[0];

    const greetings = [
      `👋 Hello, ${name}!`,
      `Hey there, ${name}! 🎉`,
      `Hi ${name}, nice to see you! 😊`,
      `Greetings, ${name}! 🌟`,
    ];

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

    await ctx.reply(randomGreeting, { includeMention: true });
  }
}
