import {
  ChannelDirectoryEvent,
  ChannelEvent,
  ChannelGroupEvent,
  ChannelMessageEvent,
  CommunityEvent,
  CommunityMemberBanEvent,
  CommunityMemberEvent,
} from "@rootsdk/server-app";

/**
 * Aggregated map of all Root SDK events that can be handled by RDXClient.
 * This avoids manual duplication while keeping strong typing.
 */
export const RootEventMap = {
  ...ChannelMessageEvent,
  ...CommunityEvent,
  ...CommunityMemberBanEvent,
  ...CommunityMemberEvent,
  ...ChannelEvent,
  ...ChannelGroupEvent,
  ...ChannelDirectoryEvent,
} as const;

type RootEventKey = keyof typeof RootEventMap;

/**
 * Enum-like object mirroring RootEventMap keys for developer-friendly usage.
 */
export const RootEventType = Object.freeze(
  (Object.keys(RootEventMap) as RootEventKey[]).reduce(
    (acc, key) => {
      acc[key] = key;
      return acc;
    },
    {} as Record<RootEventKey, RootEventKey>
  )
);

export type RootEventType = RootEventKey;

/**
 * Type helper to get the SDK event type from RootEventMap
 */
export type SDKEventType = (typeof RootEventMap)[RootEventKey];
