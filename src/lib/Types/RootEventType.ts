import { ChannelMessageEvent, CommunityEvent, CommunityMemberBanEvent, CommunityMemberEvent, ChannelEvent, ChannelGroupEvent, ChannelDirectoryEvent } from "@rootsdk/server-app";

/**
 * Unified enum for all Root SDK events that can be handled by RDXClient
 */
export enum RootEventType {
  // Channel Message Events
  ChannelMessageCreated = "ChannelMessageCreated",
  ChannelMessageEdited = "ChannelMessageEdited",
  ChannelMessageDeleted = "ChannelMessageDeleted",
  ChannelMessageReactionCreated = "ChannelMessageReactionCreated",
  ChannelMessageReactionDeleted = "ChannelMessageReactionDeleted",
  ChannelMessagePinCreated = "ChannelMessagePinCreated",
  ChannelMessagePinDeleted = "ChannelMessagePinDeleted",
  ChannelMessageSetTypingIndicator = "ChannelMessageSetTypingIndicator",

  // Community Member Events
  CommunityMemberJoined = "CommunityMemberJoined",
  CommunityMemberLeft = "CommunityMemberLeft",
  CommunityEdited = "CommunityEdited",

  CommunityMemberBanCreated = "CommunityMemberBanCreated",
  CommunityMemberBanDeleted = "CommunityMemberBanDeleted",

  CommunityMemberAttach = "CommunityMemberAttach",
  CommunityMemberDetach = "CommunityMemberDetach",
  UserSetProfile = "UserSetProfile",

  // Channel events
  ChannelCreated = "ChannelCreated",
  ChannelDeleted = "ChannelDeleted",
  ChannelEdited = "ChannelEdited",
  ChannelMoved = "ChannelMoved",

  // Channel Group events
  ChannelGroupCreated = "ChannelGroupCreated",
  ChannelGroupDeleted = "ChannelGroupDeleted",
  ChannelGroupEdited = "ChannelGroupEdited",
  ChannelGroupMoved = "ChannelGroupMoved",

  // Channel Directory events
  ChannelDirectoryCreated = "ChannelDirectoryCreated",
  ChannelDirectoryDeleted = "ChannelDirectoryDeleted",
  ChannelDirectoryEdited = "ChannelDirectoryEdited",
  ChannelDirectoryMoved = "ChannelDirectoryMoved",
}

/**
 * Map RootEventType to the actual SDK event enums
 */
export const RootEventMap = {
  [RootEventType.ChannelMessageCreated]: ChannelMessageEvent.ChannelMessageCreated,
  [RootEventType.ChannelMessageEdited]: ChannelMessageEvent.ChannelMessageEdited,
  [RootEventType.ChannelMessageDeleted]: ChannelMessageEvent.ChannelMessageDeleted,
  [RootEventType.ChannelMessageReactionCreated]: ChannelMessageEvent.ChannelMessageReactionCreated,
  [RootEventType.ChannelMessageReactionDeleted]: ChannelMessageEvent.ChannelMessageReactionDeleted,
  [RootEventType.ChannelMessagePinCreated]: ChannelMessageEvent.ChannelMessagePinCreated,
  [RootEventType.ChannelMessagePinDeleted]: ChannelMessageEvent.ChannelMessagePinDeleted,
  [RootEventType.ChannelMessageSetTypingIndicator]:
    ChannelMessageEvent.ChannelMessageSetTypingIndicator,


  [RootEventType.CommunityMemberJoined]: CommunityEvent.CommunityJoined,
  [RootEventType.CommunityMemberLeft]: CommunityEvent.CommunityLeave,
  [RootEventType.CommunityEdited]: CommunityEvent.CommunityEdited,

  [RootEventType.CommunityMemberBanCreated]: CommunityMemberBanEvent.CommunityMemberBanCreated,
  [RootEventType.CommunityMemberBanDeleted]: CommunityMemberBanEvent.CommunityMemberBanDeleted,

  [RootEventType.CommunityMemberAttach]: CommunityMemberEvent.CommunityMemberAttach,
  [RootEventType.CommunityMemberDetach]: CommunityMemberEvent.CommunityMemberDetach,
  [RootEventType.UserSetProfile]: CommunityMemberEvent.UserSetProfile,

  [RootEventType.ChannelCreated]: ChannelEvent.ChannelCreated,
  [RootEventType.ChannelDeleted]: ChannelEvent.ChannelDeleted,
  [RootEventType.ChannelEdited]: ChannelEvent.ChannelEdited,
  [RootEventType.ChannelMoved]: ChannelEvent.ChannelMoved,

  [RootEventType.ChannelGroupCreated]: ChannelGroupEvent.ChannelGroupCreated,
  [RootEventType.ChannelGroupDeleted]: ChannelGroupEvent.ChannelGroupDeleted,
  [RootEventType.ChannelGroupEdited]: ChannelGroupEvent.ChannelGroupEdited,
  [RootEventType.ChannelGroupMoved]: ChannelGroupEvent.ChannelGroupMoved,

  [RootEventType.ChannelDirectoryCreated]: ChannelDirectoryEvent.ChannelDirectoryCreated,
  [RootEventType.ChannelDirectoryDeleted]: ChannelDirectoryEvent.ChannelDirectoryDeleted,
  [RootEventType.ChannelDirectoryEdited]: ChannelDirectoryEvent.ChannelDirectoryEdited,
  [RootEventType.ChannelDirectoryMoved]: ChannelDirectoryEvent.ChannelDirectoryMoved,
} as const;

/**
 * Type helper to get the SDK event type from RootEventMap
 */
export type SDKEventType = typeof RootEventMap[keyof typeof RootEventMap];
