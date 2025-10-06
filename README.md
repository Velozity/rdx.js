# rdx.js

> **Root Development Experience** – Radix for your Root applications

A powerful, type-safe framework for building Root applications with elegant command, event, and job management systems.

> **Note:** This SDK is exclusively available for Root applications. It requires access to the Root platform and its SDK package `@rootsdk/server-app`. Support for `@rootsdk/server-bot` coming soon.

## Features

- 🎯 **Command System** - Auto-discovered commands with argument parsing, validation, and cooldowns
- 📡 **Event Handlers** - Type-safe event listeners with helper utilities
- ⏰ **Job Scheduler** - Scheduled tasks with cron-like intervals
- 🔄 **Hot Reload** - Automatic discovery of commands, events, and jobs from your file system
- 🎨 **Flexible Configuration** - Customizable folder names, prefixes, and options
- 📦 **Full Stack** - Works with React client and Node.js server with type-safe protocol buffers
- 🛡️ **Type Safety** - Full TypeScript support with comprehensive type definitions
- 🚀 **Quick Start** - Create a new project with `npx create-rdx@latest`

## Quick Start

### Get Up & Running in One Command

```bash
npx create-rdx@latest --app my-app
```

This will:
- Create a new project with client, server, and networking setup
- Install all dependencies
- Generate protocol buffer types
- Configure your Root application

### Available Commands

Once your project is created, you can use these commands:

```bash
# Generate protocol buffer types (already done for you initially)
pnpm run build:proto

# Start the development server
pnpm run dev:server

# Start the development client (in a separate terminal)
pnpm run dev:client
```

### Manual Installation

```bash
npm install rdx.js
```

or

```bash
pnpm add rdx.js
```

## Usage

### Basic Setup

```typescript
import { RDXServerApp } from "rdx.js";

const client = new RDXServerApp({
  cmdPrefix: "!",
  onReady: () => {
    console.log("Application is ready!");
  },
});
```

### With Proto Services

```typescript
import { RDXServerApp } from "rdx.js";
import { MyCustomService } from "./services/MyService";

const client = new RDXServerApp({
  cmdPrefix: "!",
  services: [MyCustomService],
  onStarting: async () => {
    console.log("Initializing services...");
  },
  onReady: () => {
    console.log("Application ready!");
  },
});
```

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
      description: "Check application latency",
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

export default class SayCommand extends RootCommand {
  constructor() {
    super({
      name: "say",
      description: "Make the application say something",
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

  async execute(context: CommandContext): Promise<void> {
    await context.helpers.reply(context.args.message);
  }
}
```

### Command with Validation

```typescript
export default class KickCommand extends RootCommand {
  constructor() {
    super({
      name: "kick",
      description: "Kick a user",
      args: [{ name: "userId", required: true, type: "string" }],
    });
  }

  async validate(context: CommandContext): Promise<boolean> {
    const hasPermission = await checkModeratorPermission(context.ctx.userId);
    if (!hasPermission) {
      await context.helpers.reply("❌ You don't have permission!", true);
      return false;
    }
    return true;
  }

  async execute({ rootServer, helpers, args }: CommandContext): Promise<void> {
    await rootServer.community.communityMemberBans.kick({
      userId: args.userId,
    });

    // or you can import rootServer from the rdx.js package
    
    await helpers.reply("✅ User kicked!");
  }
}
```

## Creating Events

Events are automatically discovered from `/events` folders in your project.

### Basic Event

```typescript
import { RootEvent, RootEventType, type EventContext, type ChannelMessageCreatedEvent } from "rdx.js";

export default class MessageCreated extends RootEvent {
  constructor() {
    super({
      event: RootEventType.ChannelMessageCreated,
      enabled: true,
    });
  }

  async execute(context: EventContext<ChannelMessageCreatedEvent>): Promise<void> {
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

  validate(context: EventContext<CommunityJoinedEvent>): boolean {
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

### RDXServerApp (Server Applications)

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

> **Note:** Support for `@rootsdk/server-bot` coming soon.

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

### Disable Built-in !help Command

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
    cooldown: 5,
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

- **Example App** - Full-stack application with client and server
- **Moderation Commands** - Kick/ban commands with permissions
- **Event Handlers** - Welcome messages and event handling
- **Scheduled Jobs** - Daily reports and background tasks

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

- Node.js >= 22
- TypeScript >= 5.0
- Root SDK (`@rootsdk/server-app`)
- Root App Application ID & DEV_TOKEN

## License

MIT

## Support

This SDK is available exclusively for Root applications. For support:

- Contact Root support team
- Check Root SDK documentation
- Review example applications

---

**Built for Root** | **Type-Safe**
