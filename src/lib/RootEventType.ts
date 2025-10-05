import { ChannelMessageEvent } from "@rootsdk/server-app";

// 	ChannelMessageReactionCreated = "channelMessageReaction.created",
// 	ChannelMessageReactionDeleted = "channelMessageReaction.deleted",
// 	ChannelMessagePinCreated = "channelMessagePin.created",
// 	ChannelMessagePinDeleted = "channelMessagePin.deleted",
// 	ChannelMessageCreated = "channelMessage.created",
// 	ChannelMessageEdited = "channelMessage.edited",
// 	ChannelMessageDeleted = "channelMessage.deleted",
// 	ChannelMessageSetTypingIndicator = "channelMessage.set.typingIndicator"
// }
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

  // Add more event types here as needed
  // UserJoined = "UserJoined",
  // UserLeft = "UserLeft",
  // etc.
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

  // Community Member Events - TODO: Update with actual SDK events when available
  [RootEventType.CommunityMemberJoined]: "CommunityMemberJoined" as unknown as ChannelMessageEvent,
  [RootEventType.CommunityMemberLeft]: "CommunityMemberLeft" as unknown as ChannelMessageEvent,

  // Map additional events as they are added
} as const;
