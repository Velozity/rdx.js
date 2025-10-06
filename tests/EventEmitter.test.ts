import { describe, it, expect } from "vitest";
import {
  ChannelMessageEvent,
  CommunityEvent,
  CommunityMemberBanEvent,
  CommunityMemberEvent,
  ChannelEvent,
  ChannelGroupEvent,
  ChannelDirectoryEvent,
} from "@rootsdk/server-app";
import { RootEventMap } from "../src/lib/Types/RootEventType";

describe("Event Emitter Mapping", () => {
  it("should have all RootEventMap values correspond to valid SDK events", () => {
    const allSDKEvents = [
      ...Object.values(ChannelMessageEvent),
      ...Object.values(CommunityEvent),
      ...Object.values(CommunityMemberBanEvent),
      ...Object.values(CommunityMemberEvent),
      ...Object.values(ChannelEvent),
      ...Object.values(ChannelGroupEvent),
      ...Object.values(ChannelDirectoryEvent),
    ];

    // Check that every value in RootEventMap exists in one of the SDK event enums
    Object.values(RootEventMap).forEach((sdkEventValue) => {
      expect(
        allSDKEvents.includes(sdkEventValue),
        `Event ${sdkEventValue} should be a valid SDK event`
      ).toBe(true);
    });
  });

  it("should map ChannelMessageEvent types correctly", () => {
    const channelMessageEvents = Object.values(ChannelMessageEvent);

    Object.entries(RootEventMap).forEach(([rootEventType, sdkEventValue]) => {
      if (channelMessageEvents.includes(sdkEventValue as any)) {
        expect(
          rootEventType.startsWith("ChannelMessage"),
          `${rootEventType} should start with ChannelMessage for ChannelMessageEvent types`
        ).toBe(true);
      }
    });
  });

  it("should map CommunityEvent types correctly", () => {
    const communityEvents = Object.values(CommunityEvent);

    Object.entries(RootEventMap).forEach(([rootEventType, sdkEventValue]) => {
      if (communityEvents.includes(sdkEventValue as any)) {
        expect(
          rootEventType.includes("Community") || rootEventType.includes("Member"),
          `${rootEventType} should contain Community or Member for CommunityEvent types`
        ).toBe(true);
      }
    });
  });

  it("should map CommunityMemberBanEvent types correctly", () => {
    const communityMemberBanEvents = Object.values(CommunityMemberBanEvent);

    Object.entries(RootEventMap).forEach(([rootEventType, sdkEventValue]) => {
      if (communityMemberBanEvents.includes(sdkEventValue as any)) {
        expect(
          rootEventType.includes("Ban"),
          `${rootEventType} should contain Ban for CommunityMemberBanEvent types`
        ).toBe(true);
      }
    });
  });

  it("should map CommunityMemberEvent types correctly", () => {
    const communityMemberEvents = Object.values(CommunityMemberEvent);

    Object.entries(RootEventMap).forEach(([rootEventType, sdkEventValue]) => {
      if (communityMemberEvents.includes(sdkEventValue as any)) {
        expect(
          rootEventType.includes("Member") || rootEventType.includes("User"),
          `${rootEventType} should contain Member or User for CommunityMemberEvent types`
        ).toBe(true);
      }
    });
  });

  it("should map ChannelEvent types correctly", () => {
    const channelEvents = Object.values(ChannelEvent);

    Object.entries(RootEventMap).forEach(([rootEventType, sdkEventValue]) => {
      if (channelEvents.includes(sdkEventValue as any)) {
        // Should be Channel but not ChannelMessage, ChannelGroup, or ChannelDirectory
        expect(
          rootEventType.startsWith("Channel") &&
            !rootEventType.startsWith("ChannelMessage") &&
            !rootEventType.startsWith("ChannelGroup") &&
            !rootEventType.startsWith("ChannelDirectory"),
          `${rootEventType} should be a Channel event (not ChannelMessage, ChannelGroup, or ChannelDirectory)`
        ).toBe(true);
      }
    });
  });

  it("should map ChannelGroupEvent types correctly", () => {
    const channelGroupEvents = Object.values(ChannelGroupEvent);

    Object.entries(RootEventMap).forEach(([rootEventType, sdkEventValue]) => {
      if (channelGroupEvents.includes(sdkEventValue as any)) {
        expect(
          rootEventType.startsWith("ChannelGroup"),
          `${rootEventType} should start with ChannelGroup for ChannelGroupEvent types`
        ).toBe(true);
      }
    });
  });

  it("should map ChannelDirectoryEvent types correctly", () => {
    const channelDirectoryEvents = Object.values(ChannelDirectoryEvent);

    Object.entries(RootEventMap).forEach(([rootEventType, sdkEventValue]) => {
      if (channelDirectoryEvents.includes(sdkEventValue as any)) {
        expect(
          rootEventType.startsWith("ChannelDirectory"),
          `${rootEventType} should start with ChannelDirectory for ChannelDirectoryEvent types`
        ).toBe(true);
      }
    });
  });

  it("should have no duplicate SDK event values in RootEventMap", () => {
    const sdkEventValues = Object.values(RootEventMap);
    const uniqueValues = new Set(sdkEventValues);

    expect(
      sdkEventValues.length,
      "RootEventMap should not have duplicate SDK event values"
    ).toBe(uniqueValues.size);
  });

  it("should ensure getEventEmitter can handle all mapped events", () => {
    // This tests that every event in RootEventMap belongs to one of the known categories
    const allKnownEvents = new Set([
      ...Object.values(ChannelMessageEvent),
      ...Object.values(CommunityEvent),
      ...Object.values(CommunityMemberBanEvent),
      ...Object.values(CommunityMemberEvent),
      ...Object.values(ChannelEvent),
      ...Object.values(ChannelGroupEvent),
      ...Object.values(ChannelDirectoryEvent),
    ]);

    Object.entries(RootEventMap).forEach(([rootEventType, sdkEventValue]) => {
      expect(
        allKnownEvents.has(sdkEventValue),
        `${rootEventType} maps to ${sdkEventValue} which should be in a known event category`
      ).toBe(true);
    });
  });

  it("should categorize each RootEventMap entry into exactly one SDK event enum", () => {
    const categorizations = Object.entries(RootEventMap).map(([rootEventType, sdkEventValue]) => {
      let categoryCount = 0;

      if (Object.values(ChannelMessageEvent).includes(sdkEventValue as any)) categoryCount++;
      if (Object.values(CommunityEvent).includes(sdkEventValue as any)) categoryCount++;
      if (Object.values(CommunityMemberBanEvent).includes(sdkEventValue as any)) categoryCount++;
      if (Object.values(CommunityMemberEvent).includes(sdkEventValue as any)) categoryCount++;
      if (Object.values(ChannelEvent).includes(sdkEventValue as any)) categoryCount++;
      if (Object.values(ChannelGroupEvent).includes(sdkEventValue as any)) categoryCount++;
      if (Object.values(ChannelDirectoryEvent).includes(sdkEventValue as any)) categoryCount++;

      return { rootEventType, sdkEventValue, categoryCount };
    });

    categorizations.forEach(({ rootEventType, sdkEventValue, categoryCount }) => {
      expect(
        categoryCount,
        `${rootEventType} (${sdkEventValue}) should belong to exactly one SDK event enum, but belongs to ${categoryCount}`
      ).toBe(1);
    });
  });
});
