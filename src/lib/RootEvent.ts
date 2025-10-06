import type { RootServer } from "@rootsdk/server-app";
import type { RootEventType, SDKEventType } from "./Types/RootEventType";
import { RootEventMap } from "./Types/RootEventType";

/**
 * Public API of EventHelpers that gets merged into event data
 */
export interface EventHelperMethods {
  mention(userId: string): Promise<string>;
  getMemberNickname(userId: string): Promise<string>;
  reply(content: string): Promise<void>;
  readonly channel: {
    id: string;
    createMessage: (content: string) => Promise<void>;
  };
  readonly rawClient: RootServer;
}

export interface EventOptions {
  event: RootEventType;
  once?: boolean;
  enabled?: boolean;
}

export interface EventContext<TEventData = unknown> {
  eventName: RootEventType;
  event: TEventData & EventHelperMethods;
  rootServer: RootServer;
}

export abstract class RootEvent<TEventData = unknown> {
  public readonly name: string;
  public readonly event: RootEventType;
  public readonly sdkEvent: SDKEventType;
  public readonly once: boolean;
  public readonly enabled: boolean;

  constructor(options: EventOptions) {
    this.name = options.event;
    this.event = options.event;
    this.sdkEvent = RootEventMap[options.event];
    this.once = options.once ?? false;
    this.enabled = options.enabled ?? true;
  }

  /**
   * Execute the event handler
   */
  public abstract execute(context: EventContext<TEventData>): Promise<void> | void;

  /**
   * Optional method to validate event execution
   */
  public validate?(context: EventContext<TEventData>): Promise<boolean> | boolean;

  /**
   * Optional method for event cleanup
   */
  public cleanup?(): Promise<void> | void;
}
