import { describe, it, expect, vi } from "vitest";
import { RootCommand } from "../src/lib/RootCommand";
import type { CommandContext } from "../src/lib/RootCommand";

class TestCommand extends RootCommand {
  constructor() {
    super({
      name: "test",
      description: "A test command",
      aliases: ["t", "tst"],
      args: [
        { name: "arg1", description: "First argument", required: true },
        { name: "arg2", description: "Second argument", required: false },
      ],
      category: "Testing",
      cooldown: 1000,
    });
  }

  async execute(context: CommandContext): Promise<void> {
    // Mock implementation
  }
}

class CommandWithOptions extends RootCommand {
  constructor() {
    super({
      name: "option-test",
      description: "A command with options",
      args: [
        {
          name: "mode",
          description: "Mode to use",
          required: true,
          options: ["easy", "medium", "hard"],
        },
      ],
    });
  }

  async execute(context: CommandContext): Promise<void> {
    // Mock implementation
  }
}

describe("RootCommand", () => {
  describe("constructor", () => {
    it("should initialize with correct properties", () => {
      const command = new TestCommand();

      expect(command.name).toBe("test");
      expect(command.description).toBe("A test command");
      expect(command.aliases).toEqual(["t", "tst"]);
      expect(command.category).toBe("Testing");
      expect(command.cooldown).toBe(1000);
      expect(command.args).toHaveLength(2);
    });

    it("should use default values when optional properties are not provided", () => {
      class MinimalCommand extends RootCommand {
        constructor() {
          super({
            name: "minimal",
            description: "Minimal command",
          });
        }

        async execute(): Promise<void> {}
      }

      const command = new MinimalCommand();

      expect(command.aliases).toEqual([]);
      expect(command.args).toEqual([]);
      expect(command.category).toBe("General");
      expect(command.cooldown).toBe(0);
      expect(command.examples).toEqual([]);
    });
  });

  describe("parseArgs", () => {
    it("should successfully parse valid arguments", () => {
      const command = new TestCommand();
      const result = command.parseArgs(["value1", "value2"]);

      expect(result.valid).toBe(true);
      expect(result.args).toEqual(["value1", "value2"]);
      expect(result.error).toBeUndefined();
    });

    it("should fail when required arguments are missing", () => {
      const command = new TestCommand();
      const result = command.parseArgs([]);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Missing required arguments");
    });

    it("should fail when too many arguments are provided", () => {
      const command = new TestCommand();
      const result = command.parseArgs(["arg1", "arg2", "arg3"]);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Too many arguments");
    });

    it("should validate arguments against options", () => {
      const command = new CommandWithOptions();
      const validResult = command.parseArgs(["easy"]);

      expect(validResult.valid).toBe(true);

      const invalidResult = command.parseArgs(["invalid"]);

      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain("Invalid value for argument");
    });

    it("should allow optional arguments to be omitted", () => {
      const command = new TestCommand();
      const result = command.parseArgs(["value1"]);

      expect(result.valid).toBe(true);
      expect(result.args).toEqual(["value1"]);
    });
  });

  describe("getUsage", () => {
    it("should generate usage string from args", () => {
      const command = new TestCommand();
      const usage = command.getUsage();

      expect(usage).toBe("test <arg1> [<arg2>]");
    });

    it("should use custom usage if provided", () => {
      class CustomUsageCommand extends RootCommand {
        constructor() {
          super({
            name: "custom",
            description: "Custom command",
            usage: "custom [options] <file>",
          });
        }

        async execute(): Promise<void> {}
      }

      const command = new CustomUsageCommand();
      const usage = command.getUsage();

      expect(usage).toBe("custom [options] <file>");
    });

    it("should format options in usage string", () => {
      const command = new CommandWithOptions();
      const usage = command.getUsage();

      expect(usage).toBe("option-test <easy|medium|hard>");
    });
  });

  describe("execute", () => {
    it("should be callable", async () => {
      const command = new TestCommand();
      const mockContext = {
        args: ["test"],
        ctx: {},
        client: {},
        helpers: {},
      } as unknown as CommandContext;

      await expect(command.execute(mockContext)).resolves.toBeUndefined();
    });
  });
});
