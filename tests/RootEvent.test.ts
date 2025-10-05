import { describe, it, expect } from "vitest";
import { RootEvent } from "../src/lib/RootEvent";
import type { EventContext } from "../src/lib/RootEvent";
import { RootEventType } from "../src/lib/RootEventType";

class TestEvent extends RootEvent {
  constructor() {
    super({
      event: RootEventType.ChannelMessageCreated,
      enabled: true,
      once: false,
    });
  }

  async execute(context: EventContext): Promise<void> {
    // Mock implementation
  }
}

describe("RootEvent", () => {
  describe("constructor", () => {
    it("should initialize with correct properties", () => {
      const event = new TestEvent();

      expect(event.name).toBe(RootEventType.ChannelMessageCreated);
      expect(event.event).toBe(RootEventType.ChannelMessageCreated);
      expect(event.enabled).toBe(true);
      expect(event.once).toBe(false);
    });

    it("should use default values", () => {
      class MinimalEvent extends RootEvent {
        constructor() {
          super({
            event: RootEventType.ChannelMessageCreated,
          });
        }

        async execute(): Promise<void> {}
      }

      const event = new MinimalEvent();

      expect(event.enabled).toBe(true);
      expect(event.once).toBe(false);
    });
  });

  describe("execute", () => {
    it("should be callable", async () => {
      const event = new TestEvent();
      const mockContext = {
        event: "ChannelMessageCreated",
        data: {},
        rootServer: {},
        helpers: {},
      } as unknown as EventContext;

      await expect(event.execute(mockContext)).resolves.toBeUndefined();
    });
  });
});
