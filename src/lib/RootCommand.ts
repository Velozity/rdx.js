import type { ChannelMessageCreatedEvent, RootServer } from "@rootsdk/server-app";

/**
 * Public API of CommandHelpers that gets merged into ctx
 */
export interface CommandHelperMethods {
  mention(): Promise<string>;
  getMemberNickname(): Promise<string>;
  reply(content: string, options?: { includeMention?: boolean }): Promise<void>;
  readonly member: {
    id: string;
    mention: () => Promise<string>;
  };
  readonly rawClient: RootServer;
  readonly rawEvent: ChannelMessageCreatedEvent;
}

export interface CommandArg {
  name: string;
  description: string;
  required?: boolean;
  options?: string[];
}

export interface CommandOptions {
  name: string;
  description: string;
  aliases?: string[];
  args?: CommandArg[];
  usage?: string;
  examples?: string[];
  category?: string;
  cooldown?: number; // in seconds
}

export interface CommandContext<TEvent = ChannelMessageCreatedEvent> {
  args: string[];
  ctx: TEvent & CommandHelperMethods;
  client: RootServer;
}

export interface ParsedArgs {
  valid: boolean;
  error?: string;
  args: string[];
}

export abstract class RootCommand<TEvent = ChannelMessageCreatedEvent> {
  public readonly name: string;
  public readonly description: string;
  public readonly aliases: string[];
  public readonly args: CommandArg[];
  public readonly usage?: string;
  public readonly examples: string[];
  public readonly category: string;
  public readonly cooldown: number;

  constructor(options: CommandOptions) {
    this.name = options.name;
    this.description = options.description;
    this.aliases = options.aliases ?? [];
    this.args = options.args ?? [];
    this.usage = options.usage;
    this.examples = options.examples ?? [];
    this.category = options.category ?? "General";
    this.cooldown = options.cooldown ?? 0;
  }

  /**
   * Parse and validate command arguments
   */
  public parseArgs(providedArgs: string[]): ParsedArgs {
    // Check minimum required arguments
    const requiredArgs = this.args.filter((arg) => arg.required);
    if (providedArgs.length < requiredArgs.length) {
      return {
        valid: false,
        error: `Missing required arguments. Expected at least ${requiredArgs.length}, got ${providedArgs.length}`,
        args: providedArgs,
      };
    }

    // Check maximum arguments
    if (providedArgs.length > this.args.length) {
      return {
        valid: false,
        error: `Too many arguments. Expected at most ${this.args.length}, got ${providedArgs.length}`,
        args: providedArgs,
      };
    }

    // Validate each argument against options (if provided)
    for (let i = 0; i < providedArgs.length; i++) {
      const argDef = this.args[i];
      const argValue = providedArgs[i];

      if (argDef && argDef.options && argDef.options.length > 0) {
        if (!argDef.options.includes(argValue)) {
          return {
            valid: false,
            error: `Invalid value for argument '${argDef.name}'. Must be one of: ${argDef.options.join(", ")}`,
            args: providedArgs,
          };
        }
      }
    }

    return {
      valid: true,
      args: providedArgs,
    };
  }

  /**
   * Get formatted usage string for this command
   */
  public getUsage(): string {
    if (this.usage) {
      return this.usage;
    }

    const argStrings = this.args.map((arg) => {
      const name = arg.options ? `<${arg.options.join("|")}>` : `<${arg.name}>`;
      return arg.required ? name : `[${name}]`;
    });

    return `${this.name} ${argStrings.join(" ")}`.trim();
  }

  /**
   * Execute the command - context type is automatically inferred from TEvent
   */
  public abstract execute(context: CommandContext<TEvent>): Promise<void> | void;

  /**
   * Optional method to validate command execution
   */
  public validate?(context: CommandContext<TEvent>): Promise<boolean> | boolean;

  /**
   * Optional method for command cleanup
   */
  public cleanup?(): Promise<void> | void;
}
