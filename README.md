# rdx.js

> **Root Development Experience** – Radix for your Root applications

A powerful, type-safe framework for building Root applications with elegant command, event, and job management systems.

> **Note:** This SDK is exclusively available for Root applications. It requires access to the Root platform and its SDK packages (`@rootsdk/server-app` or `@rootsdk/server-bot`).

## Features

- 🎯 **Command System** - Auto-discovered commands with argument parsing, validation, and cooldowns
- 📡 **Event Handlers** - Type-safe event listeners with helper utilities
- ⏰ **Job Scheduler** - Scheduled tasks with cron-like intervals
- 🔄 **Hot Reload** - Automatic discovery of commands, events, and jobs from your file system
- 🎨 **Flexible Configuration** - Customizable folder names, prefixes, and options
- 📦 **Dual SDK Support** - Works with both `@rootsdk/server-app` and `@rootsdk/server-bot`
- 🛡️ **Type Safety** - Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install rdx.js
```

or

```bash
pnpm add rdx.js
```

## Quick Start

### Basic Setup

```typescript
import { RDXServerApp } from "rdx.js";

const client = new RDXServerApp({
  cmdPrefix: "!",
  onReady: () => {
    console.log("Bot is ready!");
  },
});
```

### With Services (Server App)

```typescript
import { RDXServerApp } from "rdx.js";
import { MyCustomService } from "./services/MyService";

const client = new RDXServerApp({
  cmdPrefix: "!",
  services: [new MyCustomService()],
  onStarting: async () => {
    console.log("Initializing services...");
  },
  onReady: () => {
    console.log("Application ready!");
  },
});
```

### For Bots

Coming soon.

## Configuration Options

```typescript
type RootClientOptions = {
  cmdPrefix?: string;
  baseDir?: string;
  commandsFolderName?: string;
  eventsFolderName?: string;
  jobsFolderName?: string;
  disableHelpCommand?: boolean;
  services?: RootServerService[];
  loader?: LoaderOptions;
  onStarting?: () => void | Promise<void>;
  onReady?: () => void | Promise<void>;
};
```

### Option Details

| Option               | Type                  | Default       | Description                            |
| -------------------- | --------------------- | ------------- | -------------------------------------- |
| `cmdPrefix`          | `string`              | `"!"`         | Command prefix for text commands       |
| `baseDir`            | `string`              | Auto-detected | Base directory for file discovery      |
| `commandsFolderName` | `string`              | `"commands"`  | Name of folders containing commands    |
| `eventsFolderName`   | `string`              | `"events"`    | Name of folders containing events      |
| `jobsFolderName`     | `string`              | `"jobs"`      | Name of folders containing jobs        |
| `disableHelpCommand` | `boolean`             | `false`       | Disable the built-in help command      |
| `services`           | `RootServerService[]` | `undefined`   | Services to register (server-app only) |
| `onStarting`         | `function`            | `undefined`   | Called before initialization           |
| `onReady`            | `function`            | `undefined`   | Called after initialization            |

## Creating Commands

Commands are automatically discovered from `/commands` folders in your project.

### Basic Command

```typescript
import { RootCommand, type CommandContext } from "rdx.js";

export default class PingCommand extends RootCommand {
  constructor() {
    super({
      name: "ping",
      description: "Check bot latency",
      aliases: ["pong"],
      cooldown: 3000,
    });
  }

  async execute(context: CommandContext): Promise<void> {
    await context.helpers.reply("🏓 Pong!");
  }
}
```

### Command with Arguments

```typescript
import { RootCommand, type CommandContext } from "rdx.js";

export default class SayCommand extends RootCommand<{ message: string }> {
  constructor() {
    super({
      name: "say",
      description: "Make the bot say something",
      args: [
        {
          name: "message",
          description: "Message to send",
          required: true,
          type: "string",
        },
      ],
    });
  }

  async execute(context: CommandContext<{ message: string }>): Promise<void> {
    await context.helpers.reply(context.args.message);
  }
}
```

### Command with Validation

```typescript
export default class KickCommand extends RootCommand<{ userId: string }> {
  constructor() {
    super({
      name: "kick",
      description: "Kick a user",
      args: [{ name: "userId", required: true, type: "string" }],
    });
  }

  async validate(context: CommandContext<{ userId: string }>): Promise<boolean> {
    const hasPermission = await checkModeratorPermission(context.ctx.userId);
    if (!hasPermission) {
      await context.helpers.reply("❌ You don't have permission!");
      return false;
    }
    return true;
  }

  async execute(context: CommandContext<{ userId: string }>): Promise<void> {
    await context.client.community.communityMembers.remove({
      userId: context.args.userId,
    });
    await context.helpers.reply("✅ User kicked!");
  }
}
```

## Creating Events

Events are automatically discovered from `/events` folders in your project.

### Basic Event

```typescript
import { RootEvent, RootEventType, type EventContext } from "rdx.js";

export default class MessageCreated extends RootEvent {
  constructor() {
    super({
      event: RootEventType.ChannelMessageCreated,
      enabled: true,
    });
  }

  async execute(context: EventContext): Promise<void> {
    console.log("Message received:", context.data.messageContent);
  }
}
```

### Event with Validation

```typescript
export default class MemberJoined extends RootEvent {
  constructor() {
    super({
      event: RootEventType.CommunityMemberJoined,
      enabled: true,
    });
  }

  validate(context: EventContext): boolean {
    return !context.data.userId.includes("bot");
  }

  async execute(context: EventContext): Promise<void> {
    await context.helpers.sendMessage("welcomeChannelId", `Welcome ${context.data.nickname}!`);
  }
}
```

## Creating Jobs

Jobs are automatically discovered from `/jobs` folders in your project.

### Daily Job

```typescript
import { JobInterval, RootJob, type JobContext } from "rdx.js";

export default class DailyBackup extends RootJob {
  constructor() {
    super({
      tag: "daily-backup",
      resourceId: "system",
      start: new Date(),
      jobInterval: JobInterval.Daily,
      enabled: true,
    });
  }

  async execute(context: JobContext): Promise<void> {
    console.log("Running daily backup...");
    await performBackup();
    console.log("Backup completed!");
  }
}
```

### Hourly Job with Validation

```typescript
export default class CacheSync extends RootJob {
  constructor() {
    super({
      tag: "cache-sync",
      resourceId: "cache",
      start: new Date(),
      jobInterval: JobInterval.Hourly,
      enabled: true,
    });
  }

  validate(context: JobContext): boolean {
    const hour = context.jobTime.getHours();
    return hour >= 6 && hour <= 22;
  }

  async execute(context: JobContext): Promise<void> {
    await syncCacheToDatabase();
  }
}
```

## File Organization

The SDK automatically discovers commands, events, and jobs from any matching folder in your project:

```
src/
  commands/
    ping.ts
    moderation/
      kick.ts
      ban.ts
  events/
    messageCreated.ts
    memberJoined.ts
  jobs/
    dailyBackup.ts
  modules/
    levels/
      commands/
        rank.ts
      events/
        xpGained.ts
      jobs/
        syncCache.ts
```

### Custom Folder Names

```typescript
const client = new RDXServerApp({
  commandsFolderName: "bot-commands",
  eventsFolderName: "listeners",
  jobsFolderName: "tasks",
});
```

This will discover:

- `/bot-commands` folders instead of `/commands`
- `/listeners` folders instead of `/events`
- `/tasks` folders instead of `/jobs`

## SDK Selection

### RDXServerApp (Full Applications)

Use for complete Root server applications with service management:

```typescript
import { RDXServerApp } from "rdx.js";

const app = new RDXServerApp({
  services: [new DatabaseService(), new CacheService()],
  cmdPrefix: "!",
});
```

**Features:**

- ✅ Service lifecycle management
- ✅ Full Root SDK features
- ✅ Client management
- ✅ Recommended for production applications

### RDXServerBot (Lightweight Bots)

Use for standalone bots without service management:

```typescript
import { RDXServerBot } from "rdx.js";

const bot = new RDXServerBot({
  cmdPrefix: "!",
});
```

**Features:**

- ✅ Lightweight and fast
- ✅ Bot-focused SDK
- ✅ No service overhead
- ✅ Recommended for simple bots

## API Reference

### Client Methods

```typescript
client.getCommand(name: string): RootCommand | undefined
client.getCommands(): Map<string, RootCommand>
client.getEvents(): Map<string, RootEvent>
client.getJobs(): Map<string, RootJob>
client.getCommandPrefix(): string
client.executeCommand(name: string, args: string[], context: any): Promise<boolean>
client.on(event: ChannelMessageEvent, listener: () => void): void
```

### CommandContext

```typescript
interface CommandContext<TArgs = unknown> {
  args: TArgs;
  ctx: ChannelMessageCreatedEvent;
  client: RootServer;
  helpers: CommandHelpers;
}
```

### EventContext

```typescript
interface EventContext<TEventData = unknown> {
  event: ChannelMessageEvent;
  data: TEventData;
  rootServer: RootServer;
  helpers: EventHelpers;
}
```

### JobContext

```typescript
interface JobContext {
  resourceId: string;
  jobTime: number;
  jobScheduleId: string;
  tag: string;
  rootServer: RootServer;
}
```

## Helper Classes

### CommandHelpers

```typescript
await context.helpers.reply(message: string);
await context.helpers.sendMessage(channelId: string, content: string);
await context.helpers.deleteMessage(messageId: string);
```

### EventHelpers

```typescript
await context.helpers.sendMessage(channelId: string, content: string);
await context.helpers.getChannel(channelId: string);
await context.helpers.getMember(userId: string);
```

## Advanced Usage

### Custom Base Directory

```typescript
const client = new RDXServerApp({
  baseDir: "./dist",
});
```

### Multiple Command Directories

```typescript
const client = new RDXServerApp({
  loader: {
    commandsDir: ["./dist/commands", "./dist/plugins/commands"],
  },
});
```

### Disable Built-in Help

```typescript
const client = new RDXServerApp({
  disableHelpCommand: true,
});
```

### Development vs Production

```typescript
const client = new RDXServerApp({
  baseDir: process.env.NODE_ENV === "production" ? "./dist" : "./src",
  cmdPrefix: process.env.CMD_PREFIX || "!",
});
```

## Best Practices

### 1. **Command Naming**

- Use lowercase names
- Keep names short and memorable
- Provide descriptive aliases

### 2. **Error Handling**

```typescript
async execute(context: CommandContext): Promise<void> {
  try {
    await riskyOperation();
  } catch (error) {
    await context.helpers.reply("❌ Something went wrong!");
    console.error(error);
  }
}
```

### 3. **Validation**

```typescript
validate(context: CommandContext): boolean {
  if (!context.ctx.userId) {
    return false;
  }
  return true;
}
```

### 4. **Cooldowns**

```typescript
constructor() {
  super({
    name: "command",
    cooldown: 5000,
  });
}
```

### 5. **Job Idempotency**

```typescript
async execute(context: JobContext): Promise<void> {
  if (await isAlreadyProcessed(context.jobTime)) {
    return;
  }
  await processJob();
}
```

## Examples

Check out the `/examples` directory for complete working examples:

- **Basic Bot** - Simple command bot
- **Moderation Bot** - Kick/ban commands with permissions
- **Levels System** - XP and leveling with jobs
- **Welcome Bot** - Member join/leave events

## Troubleshooting

### Commands Not Loading

- Verify folder names match configuration
- Check file exports (must export default or named export)
- Ensure files extend the correct base class

### Events Not Firing

- Check `enabled: true` in constructor
- Verify event type is correct
- Check Root SDK connection

### Jobs Not Running

- Verify `start` date is not in the past
- Check `enabled: true` in constructor
- Verify job scheduler is running

## Requirements

- Node.js >= 18
- TypeScript >= 5.0
- Root SDK (`@rootsdk/server-app` or `@rootsdk/server-bot`)
- Active Root application access

## License

Private - Root Applications Only

## Support

This SDK is available exclusively for Root applications. For support:

- Contact Root support team
- Check Root SDK documentation
- Review example applications

---

**Built for Root** | **Type-Safe** | **Production Ready**
