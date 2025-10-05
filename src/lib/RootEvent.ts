import type { ChannelMessageEvent, rootServer } from "@rootsdk/server-app";
import type { EventHelpers } from "./Helpers/EventHelpers";
import type { RootEventType } from "./RootEventType";
import { RootEventMap } from "./RootEventType";

export interface EventOptions {
  event: RootEventType; // Now required and uses our unified enum
  once?: boolean; // Whether the event should only fire once
  enabled?: boolean;
}

export interface EventContext<TEventData = unknown> {
  event: ChannelMessageEvent;
  data: TEventData;
  rootServer: typeof rootServer;
  helpers: EventHelpers;
  // Add more context properties as needed based on Root SDK
}

export abstract class RootEvent<TEventData = unknown> {
  public readonly name: string;
  public readonly event: RootEventType;
  public readonly sdkEvent: ChannelMessageEvent; // The actual SDK event
  public readonly once: boolean;
  public readonly enabled: boolean;

  constructor(options: EventOptions) {
    // Derive name from the event type if not provided
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
