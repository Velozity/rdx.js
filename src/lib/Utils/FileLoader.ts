import { readdir } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { createLogger } from "./Logger";
import { RootCommand } from "../RootCommand";
import { RootEvent } from "../RootEvent";
import { RootJob } from "../RootJob";

const logger = createLogger("FileLoader");

export interface LoaderOptions {
  baseDir?: string;
  commandsDir?: string | string[];
  eventsDir?: string | string[];
  jobsDir?: string | string[];
  commandsFolderName?: string;
  eventsFolderName?: string;
  jobsFolderName?: string;
  extensions?: string[];
}

export class FileLoader {
  private readonly baseDir: string;
  private readonly commandsDirs: string[];
  private eventsDirs: string[];
  private jobsDirs: string[];
  private eventsDirsResolved = false;
  private jobsDirsResolved = false;
  private readonly commandsFolderName: string;
  private readonly eventsFolderName: string;
  private readonly jobsFolderName: string;
  private extensions: string[];
  private commands = new Map<string, RootCommand>();
  private events = new Map<string, RootEvent>();
  private jobs = new Map<string, RootJob>();

  constructor(options: LoaderOptions = {}) {
    // When compiled, __dirname will be dist/lib. We'll default to dist/ as the base directory
    const libraryRootDir = dirname(__dirname);

    this.baseDir = options.baseDir ? resolve(options.baseDir) : libraryRootDir;
    this.commandsFolderName = options.commandsFolderName ?? "commands";
    this.eventsFolderName = options.eventsFolderName ?? "events";
    this.jobsFolderName = options.jobsFolderName ?? "jobs";
    this.commandsDirs = this.normalizeDirs(
      options.commandsDir ?? join(this.baseDir, this.commandsFolderName)
    );
    this.eventsDirs = this.normalizeDirs(
      options.eventsDir ?? join(this.baseDir, this.eventsFolderName)
    );
    this.jobsDirs = this.normalizeDirs(options.jobsDir ?? join(this.baseDir, this.jobsFolderName));
    this.extensions = options.extensions ?? [".js", ".ts"];
  }

  /**
   * Load all commands from the commands directory
   */
  public async loadCommands(): Promise<Map<string, RootCommand>> {
    const commandDirs = await this.getCommandDirectories();
    const uniqueCommands = new Set<string>();

    if (commandDirs.length === 0) {
      logger.warn("No command directories discovered");
    }

    for (const dir of commandDirs) {
      try {
        const files = await this.getFiles(dir);

        for (const file of files) {
          try {
            const command = this.loadCommand(file);
            if (command) {
              this.commands.set(command.name, command);
              uniqueCommands.add(command.name);
            }
          } catch (error) {
            logger.error(`Failed to load command from ${file}: ${error}`);
          }
        }
      } catch {
        logger.warn(`Commands directory not found or inaccessible: ${dir}`);
      }
    }

    return this.commands;
  }

  /**
   * Load all events from the events directory
   */
  public async loadEvents(): Promise<Map<string, RootEvent>> {
    const eventDirs = await this.getEventDirectories();
    const uniqueEvents = new Set<string>();

    if (eventDirs.length === 0) {
      logger.warn("No event directories discovered");
    }

    for (const dir of eventDirs) {
      try {
        const files = await this.getFiles(dir);

        for (const file of files) {
          try {
            const event = this.loadEvent(file);
            if (event) {
              const key = this.getEventKey(event, file);
              this.events.set(key, event);
              uniqueEvents.add(key);
            }
          } catch (error) {
            logger.error(`Failed to load event from ${file}: ${error}`);
          }
        }
      } catch {
        logger.warn(`Events directory not found or inaccessible: ${dir}`);
      }
    }

    return this.events;
  }

  /**
   * Load all jobs from the jobs directory
   */
  public async loadJobs(): Promise<Map<string, RootJob>> {
    const jobDirs = await this.getJobDirectories();
    const uniqueJobs = new Set<string>();

    if (jobDirs.length === 0) {
      logger.warn("No job directories discovered");
    }

    for (const dir of jobDirs) {
      try {
        const files = await this.getFiles(dir);

        for (const file of files) {
          try {
            const job = this.loadJob(file);
            if (job) {
              const key = this.getJobKey(job, file);
              this.jobs.set(key, job);
              uniqueJobs.add(key);
            }
          } catch (error) {
            logger.error(`Failed to load job from ${file}: ${error}`);
          }
        }
      } catch {
        logger.warn(`Jobs directory not found or inaccessible: ${dir}`);
      }
    }

    logger.info(`Total jobs in map: ${this.jobs.size}`);
    return this.jobs;
  }

  /**
   * Get all files with valid extensions from a directory
   */
  private async getFiles(dir: string): Promise<string[]> {
    const items = await readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const item of items) {
      const fullPath = join(dir, item.name);

      if (item.isDirectory()) {
        // Recursively load from subdirectories
        const subFiles = await this.getFiles(fullPath);
        files.push(...subFiles);
      } else if (item.isFile() && this.isValidFile(item.name)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  private normalizeDirs(dirOrDirs: string | string[]): string[] {
    const dirs = Array.isArray(dirOrDirs) ? dirOrDirs : [dirOrDirs];
    const resolved = dirs.map((dir) => resolve(dir));
    return Array.from(new Set(resolved));
  }

  private async getCommandDirectories(): Promise<string[]> {
    const discovered = await this.discoverCommandDirectories(this.baseDir);
    const combined = new Set<string>(
      [...this.commandsDirs, ...discovered].map((dir) => resolve(dir))
    );
    return Array.from(combined);
  }

  private async getEventDirectories(): Promise<string[]> {
    if (!this.eventsDirsResolved) {
      const discovered = await this.discoverEventDirectories(this.baseDir);
      const combined = new Set<string>(
        [...this.eventsDirs, ...discovered].map((dir) => resolve(dir))
      );
      this.eventsDirs = Array.from(combined);
      this.eventsDirsResolved = true;
    }

    return this.eventsDirs;
  }

  private async getJobDirectories(): Promise<string[]> {
    if (!this.jobsDirsResolved) {
      const discovered = await this.discoverJobDirectories(this.baseDir);
      const combined = new Set<string>(
        [...this.jobsDirs, ...discovered].map((dir) => resolve(dir))
      );
      this.jobsDirs = Array.from(combined);
      this.jobsDirsResolved = true;
    }

    return this.jobsDirs;
  }

  private async discoverCommandDirectories(startDir: string): Promise<string[]> {
    const stack = [startDir];
    const discovered = new Set<string>();

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        continue;
      }

      let entries;
      try {
        entries = await readdir(current, { withFileTypes: true });
      } catch {
        continue;
      }

      for (const entry of entries) {
        if (!entry.isDirectory()) {
          continue;
        }

        const fullPath = join(current, entry.name);

        if (entry.name === this.commandsFolderName) {
          discovered.add(resolve(fullPath));
        }

        stack.push(fullPath);
      }
    }

    return Array.from(discovered);
  }

  private async discoverEventDirectories(startDir: string): Promise<string[]> {
    const stack = [startDir];
    const discovered = new Set<string>();

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        continue;
      }

      let entries;
      try {
        entries = await readdir(current, { withFileTypes: true });
      } catch {
        continue;
      }

      for (const entry of entries) {
        if (!entry.isDirectory()) {
          continue;
        }

        const fullPath = join(current, entry.name);

        if (entry.name === this.eventsFolderName) {
          discovered.add(resolve(fullPath));
        }

        stack.push(fullPath);
      }
    }

    return Array.from(discovered);
  }

  private async discoverJobDirectories(startDir: string): Promise<string[]> {
    const stack = [startDir];
    const discovered = new Set<string>();

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        continue;
      }

      let entries;
      try {
        entries = await readdir(current, { withFileTypes: true });
      } catch {
        continue;
      }

      for (const entry of entries) {
        if (!entry.isDirectory()) {
          continue;
        }

        const fullPath = join(current, entry.name);

        if (entry.name === this.jobsFolderName) {
          discovered.add(resolve(fullPath));
        }

        stack.push(fullPath);
      }
    }

    return Array.from(discovered);
  }

  /**
   * Check if file has a valid extension
   */
  private isValidFile(filename: string): boolean {
    const ext = extname(filename);
    // Exclude .d.ts files
    if (filename.endsWith(".d.ts")) {
      return false;
    }
    return this.extensions.includes(ext);
  }

  private getEventKey(event: RootEvent, filePath: string): string {
    const normalizedPath = resolve(filePath);
    return `${event.name}:${normalizedPath}`;
  }

  private getJobKey(job: RootJob, filePath: string): string {
    const normalizedPath = resolve(filePath);
    return `${job.name}:${normalizedPath}`;
  }

  /**
   * Load a single command file
   */
  private loadCommand(filePath: string): RootCommand | null {
    // Use require for CommonJS
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const module = require(filePath) as Record<string, unknown>;

    // Look for default export or named export
    const CommandClass = module.default || module.Command;

    if (!CommandClass) {
      logger.warn(`No command class found in ${filePath}`);
      return null;
    }

    if (typeof CommandClass !== "function") {
      logger.warn(`Command export is not a constructor in ${filePath}`);
      return null;
    }

    const instance = new (CommandClass as new () => unknown)();

    if (!(instance instanceof RootCommand)) {
      logger.warn(`Command class does not extend RootCommand in ${filePath}`);
      return null;
    }

    return instance;
  }

  /**
   * Load a single event file
   */
  private loadEvent(filePath: string): RootEvent | null {
    // Use require for CommonJS
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const module = require(filePath) as Record<string, unknown>;

    // Look for default export or named export
    const EventClass = module.default || module.Event;

    if (!EventClass) {
      logger.warn(`No event class found in ${filePath}`);
      return null;
    }

    if (typeof EventClass !== "function") {
      logger.warn(`Event export is not a constructor in ${filePath}`);
      return null;
    }

    const instance = new (EventClass as new () => unknown)();

    if (!(instance instanceof RootEvent)) {
      logger.warn(`Event class does not extend RootEvent in ${filePath}`);
      return null;
    }

    return instance;
  }

  /**
   * Load a single job file
   */
  private loadJob(filePath: string): RootJob | null {
    // Use require for CommonJS
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const module = require(filePath) as Record<string, unknown>;

    // Look for default export or named export
    const JobClass = module.default || module.Job;

    if (!JobClass) {
      logger.warn(`No job class found in ${filePath}`);
      return null;
    }

    if (typeof JobClass !== "function") {
      logger.warn(`Job export is not a constructor in ${filePath}`);
      return null;
    }

    const instance = new (JobClass as new () => unknown)();

    if (!(instance instanceof RootJob)) {
      logger.warn(`Job class does not extend RootJob in ${filePath}`);
      return null;
    }

    return instance;
  }

  /**
   * Get loaded commands
   */
  public getCommands(): Map<string, RootCommand> {
    return this.commands;
  }

  /**
   * Get loaded events
   */
  public getEvents(): Map<string, RootEvent> {
    return this.events;
  }

  /**
   * Get a specific command by name
   */
  public getCommand(name: string): RootCommand | undefined {
    return this.commands.get(name);
  }

  /**
   * Get a specific event by name
   */
  public getEvent(name: string): RootEvent | undefined {
    return this.events.get(name);
  }

  /**
   * Get loaded jobs
   */
  public getJobs(): Map<string, RootJob> {
    return this.jobs;
  }

  /**
   * Get a specific job by name
   */
  public getJob(name: string): RootJob | undefined {
    return this.jobs.get(name);
  }
}
