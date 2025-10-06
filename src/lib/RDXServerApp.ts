/* eslint-disable */
import type {
  ChannelMessageCreatedEvent,
  RootServer,
  RootServerService,
} from "@rootsdk/server-app";
import {
  JobScheduleEvent,
  rootServer,
  ChannelMessageEvent,
  CommunityEvent,
  CommunityMemberBanEvent,
  CommunityMemberEvent,
  ChannelEvent,
  ChannelGroupEvent,
  ChannelDirectoryEvent,
} from "@rootsdk/server-app";

import { existsSync } from "node:fs";
import { join } from "node:path";
import { HelpCommand } from "./BaseCommands/HelpCommand";
import { CommandHelpers } from "./Helpers/CommandHelpers";
import { EventHelpers } from "./Helpers/EventHelpers";
import type { LoaderOptions } from "./Utils/FileLoader";
import { FileLoader } from "./Utils/FileLoader";
import { createLogger } from "./Utils/Logger";
import type { RootCommand } from "./RootCommand";
import type { EventContext, RootEvent } from "./RootEvent";
import type { RootJob } from "./RootJob";

type RootClientOptions = {
  onStarting?: () => void | Promise<void>;
  onReady?: () => void | Promise<void>;
  services?: RootServerService[];
  loader?: LoaderOptions;
  cmdPrefix?: string;
  baseDir?: string;
  commandsFolderName?: string;
  eventsFolderName?: string;
  jobsFolderName?: string;
  disableHelpCommand?: boolean;
};

const logger = createLogger("RDXServerApp");

class RDXServerApp {
  private fileLoader: FileLoader;
  private commands = new Map<string, RootCommand<unknown>>();
  private events = new Map<string, RootEvent>();
  private jobs = new Map<string, RootJob>();
  private commandCooldowns = new Map<string, number>();
  private cmdPrefix: string;
  private disableHelpCommand: boolean;
  private jobListenerRegistered = false;

  constructor(options: RootClientOptions = {}) {
    this.disableHelpCommand = options.disableHelpCommand ?? false;
    let baseDir = options.baseDir;

    if (!baseDir) {
      const cwd = process.cwd();

      const distPath = join(cwd, "dist");
      const srcPath = join(cwd, "src");

      const isRunningFromDist = __filename.includes("dist");

      if (isRunningFromDist && existsSync(distPath)) {
        baseDir = distPath;
      } else if (existsSync(srcPath)) {
        baseDir = srcPath;
      } else if (existsSync(distPath)) {
        baseDir = distPath;
      } else {
        baseDir = srcPath;
      }
    }

    const defaultLoaderOptions: LoaderOptions = {
      baseDir,
      commandsFolderName: options.commandsFolderName ?? "commands",
      eventsFolderName: options.eventsFolderName ?? "events",
      jobsFolderName: options.jobsFolderName ?? "jobs",
      commandsDir: join(baseDir, options.commandsFolderName ?? "commands"),
      eventsDir: join(baseDir, options.eventsFolderName ?? "events"),
      jobsDir: join(baseDir, options.jobsFolderName ?? "jobs"),
      ...options.loader,
    };

    this.fileLoader = new FileLoader(defaultLoaderOptions);
    this.cmdPrefix = options.cmdPrefix ?? "!";

    void this.initialize({
      onStarting: options.onStarting,
      onReady: options.onReady,
      services: options.services,
    });
  }

  private async initialize({
    onStarting,
    onReady,
    services,
  }: {
    onStarting: RootClientOptions["onStarting"];
    onReady: RootClientOptions["onReady"];
    services: RootClientOptions["services"];
  }) {
    try {
      if (services) {
        for (const service of services) {
          rootServer.lifecycle.addService(service);
        }
        logger.info(`Loaded ${services.length} services`);
      }

      const asyncOnStarting = onStarting
        ? async () => {
            const result = onStarting();

            if (result instanceof Promise) {
              await result;
            }
          }
        : undefined;

      await rootServer.lifecycle.start(asyncOnStarting);

      await this.loadCommands();
      await this.loadEvents();
      await this.loadJobs();

      this.setupMessageHandler();

      void onReady?.();

      logger.info("RDXServerApp initialized successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to initialize RDXServerApp: ${errorMessage}`);
      process.exit(1);
    }
  }

  private setupMessageHandler(): void {
    rootServer.community.channelMessages.on(ChannelMessageEvent.ChannelMessageCreated, (evt) => {
      if (!evt.messageContent.startsWith(this.cmdPrefix)) {
        return;
      }

      const content = evt.messageContent.slice(this.cmdPrefix.length).trim();
      const args = content.split(/\s+/);
      const commandName = args.shift()?.toLowerCase();

      if (!commandName) {
        return;
      }

      void this.executeCommand(commandName, args, evt);
    });
  }

  private async loadCommands(): Promise<void> {
    const loadedCommands = await this.fileLoader.loadCommands();

    for (const [name, command] of loadedCommands) {
      this.commands.set(name, command);
      // Also register aliases
      for (const alias of command.aliases) {
        this.commands.set(alias, command);
      }
    }

    if (!this.disableHelpCommand) {
      const helpCommand = new HelpCommand(this.commands);
      this.commands.set(helpCommand.name, helpCommand);
      for (const alias of helpCommand.aliases) {
        this.commands.set(alias, helpCommand);
      }
    }

    logger.info(`Registered ${loadedCommands.size} commands`);
  }

  private async loadEvents(): Promise<void> {
    const loadedEvents = await this.fileLoader.loadEvents();

    for (const [name, event] of loadedEvents) {
      if (!event.enabled) {
        logger.info(`Skipping disabled event: ${name}`);
        continue;
      }

      const eventKey = this.createEventKey(event, name);
      this.events.set(eventKey, event);
      this.registerEvent(event);
    }

    logger.info(`Registered ${this.events.size} events`);
  }

  private async loadJobs(): Promise<void> {
    const loadedJobs = await this.fileLoader.loadJobs();

    for (const [name, job] of loadedJobs) {
      if (!job.enabled) {
        logger.info(`Skipping disabled job: ${name}`);
        continue;
      }

      const jobKey = this.createJobKey(job, name);
      this.jobs.set(jobKey, job);
      this.registerJob(job);
    }

    // Set up the global job event listener after all jobs are loaded
    this.setupJobListener();

    logger.info(`Registered ${this.jobs.size} job${this.jobs.size === 1 ? "" : "s"}`);
  }

  private registerJob(job: RootJob): void {
    void rootServer.jobScheduler.create({
      tag: job.tag,
      resourceId: job.resourceId,
      start: job.start,
      jobInterval: job.jobInterval,
      end: job.end,
    });
  }

  private setupJobListener(): void {
    // Register the global job listener only once for all jobs
    if (this.jobListenerRegistered) {
      return;
    }

    this.jobListenerRegistered = true;

    rootServer.jobScheduler.on(JobScheduleEvent.Job, (evt) => {
      // Find the matching job from our registered jobs
      const matchingJob = Array.from(this.jobs.values()).find(
        (j) => j.tag === evt.tag && j.resourceId === evt.resourceId
      );

      if (!matchingJob) {
        return;
      }

      void (async () => {
        const jobContext = {
          resourceId: evt.resourceId,
          jobTime: evt.jobTime,
          jobScheduleId: evt.jobScheduleId,
          tag: evt.tag ?? matchingJob.tag,
          rootServer: rootServer as RootServer,
        };

        if (
          matchingJob.validate &&
          !matchingJob.validate(jobContext as unknown as Parameters<typeof matchingJob.validate>[0])
        ) {
          return;
        }

        try {
          await matchingJob.execute(
            jobContext as unknown as Parameters<typeof matchingJob.execute>[0]
          );
        } catch (error) {
          logger.error(`Error executing job ${matchingJob.name}: ${String(error)}`);
        }
      })();
    });
  }

  private createJobKey(job: RootJob, fallbackName: string): string {
    const constructorName = job.constructor?.name ?? "AnonymousJob";
    const baseName = job.name ?? fallbackName;
    return `${baseName}:${constructorName}`;
  }

  private registerEvent(event: RootEvent): void {
    const listener = (data: unknown) => {
      void (async () => {
        const channelId = (data as any)?.channelId || "";
        const helpers = new EventHelpers(channelId);

        // Merge helpers into the event data
        const eventWithHelpers = Object.assign(
          Object.create(EventHelpers.prototype),
          data,
          helpers
        );

        const eventContext: EventContext = {
          eventName: event.event,
          event: eventWithHelpers,
          rootServer: rootServer,
        };

        if (event.validate && !event.validate(eventContext)) {
          return;
        }

        try {
          await event.execute(eventContext);
        } catch (error) {
          logger.error(`Error executing event ${event.name}: ${String(error)}`);
        }
      })();
    };

    // Determine which event emitter to use based on the event type
    const eventValue = event.sdkEvent;
    const eventEmitter = this.getEventEmitter(eventValue);

    if (event.once) {
      eventEmitter.once(eventValue, listener);
    } else {
      eventEmitter.on(eventValue, listener);
    }
  }

  private getEventEmitter(eventValue: any): any & {
    on: (event: string, listener: (...args: any[]) => void) => void;
    once: (event: string, listener: (...args: any[]) => void) => void;
  } {
    if (Object.values(ChannelMessageEvent).includes(eventValue)) {
      return rootServer.community.channelMessages;
    } else if (Object.values(CommunityEvent).includes(eventValue)) {
      return rootServer.community.communities;
    } else if (Object.values(CommunityMemberBanEvent).includes(eventValue)) {
      return rootServer.community.communityMemberBans;
    } else if (Object.values(CommunityMemberEvent).includes(eventValue)) {
      return rootServer.community.communityMembers;
    } else if (Object.values(ChannelEvent).includes(eventValue)) {
      return rootServer.community.channels;
    } else if (Object.values(ChannelGroupEvent).includes(eventValue)) {
      return rootServer.community.channelGroups;
    } else if (Object.values(ChannelDirectoryEvent).includes(eventValue)) {
      return rootServer.community.channelDirectories;
    }

    logger.error(`Unknown event type ${eventValue}`);
    throw new Error(`Unknown event type: ${eventValue}`);
  }

  private createEventKey(event: RootEvent, fallbackName: string): string {
    const constructorName = event.constructor?.name ?? "AnonymousEvent";
    const baseName = event.name ?? fallbackName;
    return `${baseName}:${constructorName}`;
  }

  public async executeCommand(
    name: string,
    args: string[],
    ctx: ChannelMessageCreatedEvent
  ): Promise<boolean> {
    const command = this.commands.get(name.toLowerCase());

    if (!command) {
      return false;
    }

    const parsedArgs = command.parseArgs(args);
    if (!parsedArgs.valid) {
      const helpers = new CommandHelpers(ctx);
      const ctxWithHelpers = Object.assign(Object.create(CommandHelpers.prototype), ctx, helpers);
      await ctxWithHelpers.reply(`❌ ${parsedArgs.error}\n\nUsage: \`!${command.getUsage()}\``);
      return false;
    }

    const cooldownKey = `${name}:${ctx.userId}`;
    const lastExecution = this.commandCooldowns.get(cooldownKey) ?? 0;
    const now = Date.now();

    if (now - lastExecution < command.cooldown * 1000) {
      logger.warn(`Command ${name} is on cooldown`);
      return false;
    }

    try {
      const helpers = new CommandHelpers(ctx);

      // Merge helpers into ctx
      const ctxWithHelpers = Object.assign(Object.create(CommandHelpers.prototype), ctx, helpers);

      const context = {
        args: parsedArgs.args,
        ctx: ctxWithHelpers,
        client: rootServer as RootServer,
      };

      if (command.validate && !(await command.validate(context))) {
        logger.warn(`Command validation failed for ${name}`);
        return false;
      }

      if (command.cooldown > 0) {
        this.commandCooldowns.set(cooldownKey, now);
      }

      await command.execute(context);

      logger.info(`Executed command: ${name}`);
      return true;
    } catch (error) {
      logger.error(`Error executing command ${name}: ${String(error)}`);
      return false;
    }
  }

  public getCommand(name: string): RootCommand<unknown> | undefined {
    return this.commands.get(name.toLowerCase());
  }

  public getCommands(): Map<string, RootCommand<unknown>> {
    return this.commands;
  }

  public getEvents(): Map<string, RootEvent> {
    return this.events;
  }

  public getJobs(): Map<string, RootJob> {
    return this.jobs;
  }

  public getCommandPrefix(): string {
    return this.cmdPrefix;
  }

  on<T extends keyof EventsMap>(event: T, listener: EventsMap[T]) {
    if (Object.values(ChannelMessageEvent).includes(event)) {
      rootServer.community.channelMessages.on(event, listener);
    } else {
      throw new Error(`Unknown event: ${event}`);
    }
  }
}

type EventsMap = {
  [K in ChannelMessageEvent]: () => void;
};

export { RDXServerApp };
