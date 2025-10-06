import type { JobInterval, RootServer } from "@rootsdk/server-app";

export interface JobOptions {
  tag: string;
  resourceId: string;
  start: Date;
  jobInterval: JobInterval;
  end?: Date;
  enabled?: boolean;
}

export interface JobContext {
  resourceId: string;
  jobTime: number;
  jobScheduleId: string;
  tag: string;
  rootServer: RootServer;
}

export abstract class RootJob {
  public readonly tag: string;
  public readonly resourceId: string;
  public readonly start: Date;
  public readonly jobInterval: JobInterval;
  public readonly end?: Date;
  public readonly enabled: boolean;
  public readonly name: string;

  constructor(options: JobOptions) {
    this.tag = options.tag;
    this.resourceId = options.resourceId;
    this.start = options.start;
    this.jobInterval = options.jobInterval;
    this.end = options.end;
    this.enabled = options.enabled ?? true;
    this.name = options.tag;
  }

  /**
   * Execute the job handler
   */
  public abstract execute(context: JobContext): Promise<void> | void;

  /**
   * Optional method to validate job execution
   */
  public validate?(context: JobContext): Promise<boolean> | boolean;

  /**
   * Optional method for job cleanup
   */
  public cleanup?(): Promise<void> | void;
}
