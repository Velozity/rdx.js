# rdx.js

> **Root Development Experience** – A clean, file-driven framework for building Root applications with commands, events, jobs and services.

Retrieve your Application ID & Dev Token at https://dev.rootapp.com/apps

## Features

- 🎯 **Command System** - Auto-discovered commands with validation, cooldowns and usage
- 📡 **Event Handlers** - Type-safe event listeners
- ⏰ **Job Scheduler** - Scheduled background tasks
- 🛡️ **Type Safety** - Full TypeScript support
- 🚀 **Quick Start** - Create a new project with `npx create-rdx@latest`

## Quick Start

### Create a New Project

```bash
npx create-rdx@latest --app my-app
cd my-app
pnpm run dev:server
```

### Manual Installation

```bash
pnpm add rdx.js @rootsdk/server-app
```

> **Note:** `@rootsdk/server-app` is required and must be installed alongside rdx.js.

## Basic Setup

```typescript
// server/src/main.ts
import { RDXServerApp } from "rdx.js";

const app = new RDXServerApp({
  cmdPrefix: "!",
  onReady: () => console.log("App ready!"),
});
```

## Configuration

```typescript
const app = new RDXServerApp({
  cmdPrefix: "!", // Command prefix - Note: You can use an async function here to dynamically retrieve it
  // cmdPrefix: async () => {
  // return await rootServer.dataStore.appData.get("prefix");
  // }
  commandsFolderName: "commands", // Commands folder name (default: commands)
  eventsFolderName: "events", // Events folder name (default: events)
  jobsFolderName: "jobs", // Jobs folder name (default: jobs)
  disableHelpCommand: false, // Disable built-in !help (default: false)
  services: [], // Proto services
  onStarting: async () => {}, // Called before init
  onReady: () => {}, // Called after init
});
```

## File Organization

The SDK auto-discovers files from any matching folder:

```
server/src/
  main.ts
  commands/
    ping.ts
  events/
    welcome.ts
  jobs/
    backup.ts
  modules/
    automod/
      events/
        on-message-create.ts
    mod-tools/
      commands/
        ban.ts
        kick.ts
```

## Commands

Create a command in `server/src/commands/`:

```typescript
// server/src/commands/ping.ts
import { RootCommand, type CommandContext } from "rdx.js";

export default class PingCommand extends RootCommand {
  constructor() {
    super({
      name: "ping",
      description: "Ping the server",
      aliases: ["p"],
      cooldown: 1, // number in seconds
    });
  }

  async execute({ ctx }: CommandContext): Promise<void> {
    await ctx.reply("🏓 Pong!");
  }
}
```

### Command Options

```typescript
super({
  name: "ping", // Command name (required)
  description: "Ping", // Command description (required)
  aliases: ["p", "pong"], // Alternative names (optional)
  args: [
    // Command arguments (optional)
    {
      name: "message",
      description: "Message to send",
      required: true, // If true, validation fails without it
      options: ["a", "b"], // Restrict to specific values (optional)
    },
  ],
  usage: "ping [message]", // Custom usage string (optional)
  examples: ["ping", "ping hello"], // Example usages (optional)
  category: "Utility", // Command category (optional, default: "General")
  cooldown: 3, // Cooldown in seconds (optional, default: 0)
});
```

### Helper Methods on Context

Commands automatically have helper methods available on `ctx`:

```typescript
async execute({ ctx, args }: CommandContext): Promise<void> {
  // Reply to the command message
  await ctx.reply("Simple reply");
  await ctx.reply("Reply with mention", { includeMention: true });

  // Get user info
  const nickname = await ctx.getMemberNickname();
  const mention = await ctx.mention(); // [@Nickname](root://user/123)
  const userId = ctx.member.id;

  // Access command arguments
  const firstArg = args[0];
}

```

## Events

Create an event in `server/src/events/`:

```typescript
// server/src/events/welcome.ts
import { RootEvent, RootEventType, type EventContext } from "rdx.js";
import { rootServer, type ChannelMessageCreatedEvent } from "@rootsdk/server-app";

export default class WelcomeEvent extends RootEvent<ChannelMessageCreatedEvent> {
  constructor() {
    super({
      event: RootEventType.ChannelMessageCreated,
    });
  }

  async execute({ event }: EventContext<ChannelMessageCreatedEvent>): Promise<void> {
    // Helper methods are available on the event object
    await event.reply(`Welcome! You said: ${event.messageContent}`);

    await rootServer.community.channelMessages.create({
      channelId: event.channelId,
      content: "Hello!",
    });
  }
}
```

### Event Options

```typescript
super({
  event: RootEventType.ChannelMessageCreated, // Event type (required)
  once: false, // Run only once (optional, default: false)
  enabled: true, // Enable/disable event (optional, default: true)
});
```

## Jobs

Create a job in `server/src/jobs/`:

```typescript
// server/src/jobs/daily-backup.ts
import { RootJob, type JobContext } from "rdx.js";
import { JobInterval } from "@rootsdk/server-app";

export default class DailyBackup extends RootJob {
  constructor() {
    super({
      tag: "daily-backup",
      resourceId: "system",
      start: new Date(),
      jobInterval: JobInterval.Daily,
    });
  }

  async execute(context: JobContext): Promise<void> {
    console.log("Running daily backup...");
    // Access rootServer from context or import
    await context.rootServer.community.communities.get({
      communityId: "...",
    });
  }
}
```

## Examples

Check `/examples` directory for:

- Full-stack app with client + server
- Command examples with validation
- Event handlers
- Background jobs

## Requirements

- Node.js >= 22
- `@rootsdk/server-app` (peer dependency)
- Root Application ID & Dev Token from https://dev.rootapp.com/apps

## License

MIT

---

**Built for Root** | **Type-Safe** | **Easy**
