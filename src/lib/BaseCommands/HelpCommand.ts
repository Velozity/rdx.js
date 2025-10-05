import type { ChannelMessageCreatedEvent } from "@rootsdk/server-app";
import type { CommandContext } from "../RootCommand";
import { RootCommand } from "../RootCommand";

/**
 * Built-in help command
 * Shows all available commands or detailed info about a specific command
 */
export class HelpCommand extends RootCommand<ChannelMessageCreatedEvent> {
  private commands: Map<string, RootCommand>;

  constructor(commands: Map<string, RootCommand>) {
    super({
      name: "help",
      description: "Shows all available commands or detailed info about a specific command",
      aliases: ["h", "?"],
      args: [
        {
          name: "command",
          description: "The command to get help for",
          required: false,
        },
      ],
      examples: ["help", "help automod", "help ping"],
      category: "Utility",
    });

    this.commands = commands;
  }

  public async execute(context: CommandContext<ChannelMessageCreatedEvent>): Promise<void> {
    const { args, helpers } = context;

    // If no command specified, list all commands
    if (args.length === 0) {
      await this.listAllCommands(helpers);
      return;
    }

    // Show help for specific command
    const commandName = args[0].toLowerCase();
    await this.showCommandHelp(commandName, helpers);
  }

  private async listAllCommands(helpers: CommandContext["helpers"]): Promise<void> {
    // Deduplicate commands (the Map contains both main names and aliases pointing to the same instance)
    const uniqueCommands = new Map<string, RootCommand>();
    for (const command of this.commands.values()) {
      // Use command name as unique key to avoid duplicates
      if (!uniqueCommands.has(command.name)) {
        uniqueCommands.set(command.name, command);
      }
    }

    // Group commands by category
    const categories = new Map<string, RootCommand[]>();

    for (const command of uniqueCommands.values()) {
      const category = command.category || "General";
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(command);
    }

    // Build help message
    let message = "**📚 Available Commands**\n\n";

    for (const [category, commands] of categories) {
      message += `**${category}**\n`;
      for (const cmd of commands) {
        message += `• \`${cmd.name}\` - ${cmd.description}\n`;
      }
      message += "\n";
    }

    message += `\nUse \`!help <command>\` to get detailed information about a specific command.`;

    await helpers.reply(message);
  }

  private async showCommandHelp(
    commandName: string,
    helpers: CommandContext["helpers"]
  ): Promise<void> {
    // Find command (check name and aliases)
    let command: RootCommand | undefined;

    for (const cmd of this.commands.values()) {
      if (cmd.name === commandName || cmd.aliases.includes(commandName)) {
        command = cmd;
        break;
      }
    }

    if (!command) {
      await helpers.reply(
        `❌ Command \`${commandName}\` not found. Use \`!help\` to see all commands.`
      );
      return;
    }

    // Build detailed help message
    let message = `**📖 Help: ${command.name}**\n\n`;
    message += `**Description:** ${command.description}\n\n`;

    // Aliases
    if (command.aliases.length > 0) {
      message += `**Aliases:** ${command.aliases.map((a) => `\`${a}\``).join(", ")}\n\n`;
    }

    // Usage
    message += `**Usage:** \`!${command.getUsage()}\`\n\n`;

    // Arguments
    if (command.args.length > 0) {
      message += `**Arguments:**\n`;
      for (const arg of command.args) {
        const required = arg.required ? "**Required**" : "*Optional*";
        const options = arg.options ? ` (Options: ${arg.options.join(", ")})` : "";
        message += `• \`${arg.name}\` ${required} - ${arg.description}${options}\n`;
      }
      message += "\n";
    }

    // Examples
    if (command.examples.length > 0) {
      message += `**Examples:**\n`;
      for (const example of command.examples) {
        message += `• \`!${example}\`\n`;
      }
      message += "\n";
    }

    // Category
    message += `**Category:** ${command.category}\n`;

    // Cooldown
    if (command.cooldown > 0) {
      message += `**Cooldown:** ${command.cooldown}s\n`;
    }

    await helpers.reply(message);
  }
}
