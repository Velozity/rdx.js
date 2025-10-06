# rdx.js

> **Root Development Experience** – Radix for your Root applications

A powerful, type-safe framework for building Root applications with elegant command, event, and job management systems.

> **Note:** This SDK is exclusively available for Root applications. It requires access to the Root platform and its SDK package `@rootsdk/server-app`. Support for `@rootsdk/server-bot` coming soon.
> Get your Application ID & Dev Token at https://dev.rootapp.com/apps

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

### Register Your App

Visit https://dev.rootapp.com/apps and register an app, taking note of the Application ID and Dev Token (found in the application settings).

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
import { EchoService } from "./services/echo.service";

const client = new RDXServerApp({
  cmdPrefix: "!",
  services: [EchoService],
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
      cooldown: 3, // Time in seconds
    });
  }

  async execute(context: CommandContext): Promise<void> {
    // Helper methods are now available directly on ctx
    await context.ctx.reply("🏓 Pong!", { includeMention: true });
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
        },
      ],
    });
  }

  async execute(context: CommandContext): Promise<void> {
    const message = context.args[0]; // First argument is the message
    await context.ctx.reply(message);
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
      args: [{ name: "userId", required: true }],
    });
  }

  async validate(context: CommandContext): Promise<boolean> {
    const hasPermission = await checkModeratorPermission(context.ctx.userId);
    if (!hasPermission) {
      await context.ctx.reply("❌ You don't have permission!", { includeMention: true });
      return false;
    }
    return true;
  }

  async execute({ client, ctx, args }: CommandContext): Promise<void> {
    const userId = args[0]; // First argument is the userId

    await client.community.communityMemberBans.kick({
      userId: userId,
    });

    // or you can import rootServer directly from @rootsdk/server-app

    await ctx.reply("✅ User kicked!");
  }
}
```

## Creating Events

Events are automatically discovered from `/events` folders in your project.

### Available Event Types

| Event Type                         | Category            | Description                                   |
| ---------------------------------- | ------------------- | --------------------------------------------- |
| `ChannelMessageCreated`            | Channel Messages    | Triggered when a message is created           |
| `ChannelMessageEdited`             | Channel Messages    | Triggered when a message is edited            |
| `ChannelMessageDeleted`            | Channel Messages    | Triggered when a message is deleted           |
| `ChannelMessageReactionCreated`    | Channel Messages    | Triggered when a reaction is added            |
| `ChannelMessageReactionDeleted`    | Channel Messages    | Triggered when a reaction is removed          |
| `ChannelMessagePinCreated`         | Channel Messages    | Triggered when a message is pinned            |
| `ChannelMessagePinDeleted`         | Channel Messages    | Triggered when a message is unpinned          |
| `ChannelMessageSetTypingIndicator` | Channel Messages    | Triggered when typing indicator is set        |
| `CommunityMemberJoined`            | Community Members   | Triggered when a member joins                 |
| `CommunityMemberLeft`              | Community Members   | Triggered when a member leaves                |
| `CommunityEdited`                  | Community           | Triggered when community is edited            |
| `CommunityMemberBanCreated`        | Community Bans      | Triggered when a member is banned             |
| `CommunityMemberBanDeleted`        | Community Bans      | Triggered when a ban is removed               |
| `CommunityMemberAttach`            | Community Members   | Triggered when a member is attached           |
| `CommunityMemberDetach`            | Community Members   | Triggered when a member is detached           |
| `UserSetProfile`                   | Community Members   | Triggered when a user updates their profile   |
| `ChannelCreated`                   | Channels            | Triggered when a channel is created           |
| `ChannelDeleted`                   | Channels            | Triggered when a channel is deleted           |
| `ChannelEdited`                    | Channels            | Triggered when a channel is edited            |
| `ChannelMoved`                     | Channels            | Triggered when a channel is moved             |
| `ChannelGroupCreated`              | Channel Groups      | Triggered when a channel group is created     |
| `ChannelGroupDeleted`              | Channel Groups      | Triggered when a channel group is deleted     |
| `ChannelGroupEdited`               | Channel Groups      | Triggered when a channel group is edited      |
| `ChannelGroupMoved`                | Channel Groups      | Triggered when a channel group is moved       |
| `ChannelDirectoryCreated`          | Channel Directories | Triggered when a channel directory is created |
| `ChannelDirectoryDeleted`          | Channel Directories | Triggered when a channel directory is deleted |
| `ChannelDirectoryEdited`           | Channel Directories | Triggered when a channel directory is edited  |
| `ChannelDirectoryMoved`            | Channel Directories | Triggered when a channel directory is moved   |

### Basic Event

```typescript
import {
  RootEvent,
  RootEventType,
  type EventContext,
  type ChannelMessageCreatedEvent,
} from "rdx.js";

export default class MessageCreated extends RootEvent {
  constructor() {
    super({
      event: RootEventType.ChannelMessageCreated,
      enabled: true,
    });
  }

  async execute(context: EventContext<ChannelMessageCreatedEvent>): Promise<void> {
    console.log("Message received:", context.event.messageContent);
    // Helper methods are now directly on the event object
    await context.event.reply("Message received!");
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
    return !context.event.userId.includes("bot");
  }

  async execute(context: EventContext): Promise<void> {
    // Helper methods are available on the event object
    await context.event.reply(`Welcome ${context.event.nickname}!`);
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

### CommandContext

Available in command `execute()` and `validate()` methods:

```typescript
interface CommandContext<TArgs = unknown> {
  args: TArgs; // Parsed command arguments
  ctx: ChannelMessageCreatedEvent & CommandHelperMethods; // Message event with helper methods merged in
  client: RootServer; // Root server instance
}
```

**Example usage:**

```typescript
async execute(context: CommandContext) {
  // Access event data directly from ctx
  const userId = context.ctx.userId;
  const messageContent = context.ctx.messageContent;

  // Helper methods are merged into ctx and available alongside event properties
  await context.ctx.reply("Hello!", { includeMention: true });
  const nickname = await context.ctx.getMemberNickname();
  const mention = await context.ctx.mention();

  // Access parsed arguments
  const args = context.args;

  // Access the Root server instance
  const server = context.client;
}
```

### EventContext

Available in event `execute()` and `validate()` methods:

```typescript
interface EventContext<TEventData = unknown> {
  eventName: RootEventType; // The event type name
  event: TEventData & EventHelperMethods; // Event data with helper methods merged in
  rootServer: RootServer; // Root server instance
}
```

**Example usage:**

```typescript
async execute(context: EventContext<ChannelMessageCreatedEvent>) {
  // Access event data directly
  const message = context.event.messageContent;
  const userId = context.event.userId;
  const channelId = context.event.channelId;

  // Helper methods are merged into event and available alongside event properties
  await context.event.reply("Hello!");
  const mention = await context.event.mention(userId);
  const nickname = await context.event.getMemberNickname(userId);

  // Access event name
  console.log(`Handling: ${context.eventName}`);

  // Access the Root server instance
  const server = context.rootServer;
}
```

### JobContext

Available in job `execute()` and `validate()` methods:

```typescript
interface JobContext {
  resourceId: string;
  jobTime: number;
  jobScheduleId: string;
  tag: string;
  rootServer: RootServer;
}
```

## Helper Methods

### Command Helper Methods

Command helper methods are merged directly into `context.ctx` alongside the event properties:

```typescript
// In command handlers
await context.ctx.reply("Hello!"); // Send a reply
await context.ctx.reply("Hello!", { includeMention: true }); // Reply with mention
const mention = await context.ctx.mention(); // Get mention for command user
const nickname = await context.ctx.getMemberNickname(); // Get nickname of command user
const memberId = context.ctx.member.id; // Access member info
```

### Event Helper Methods

Event helper methods are merged directly into `context.event` alongside the event properties:

```typescript
// In event handlers
await context.event.reply("Hello!"); // Send a reply to the event's channel
const mention = await context.event.mention(userId); // Get mention markdown for a user
const nickname = await context.event.getMemberNickname(userId); // Get nickname of a user
const channelId = context.event.channel.id; // Access channel info
await context.event.channel.createMessage("Hello!"); // Create message in event's channel

// Access root server instance
context.rootServer;
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
