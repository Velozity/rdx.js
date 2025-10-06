import { vi } from "vitest";

// Mock environment variables
process.env.DEV_TOKEN = "mock-dev-token";
process.env.NODE_ENV = "test";

// Prevent process.exit from actually exiting during tests
const exitSpy = vi.spyOn(process, "exit");
exitSpy.mockImplementation((() => {
  // Don't actually exit, just return undefined
  return undefined as never;
}) as any);

// Mock the Root SDK modules to prevent initialization issues
vi.mock("@rootsdk/server-app", () => ({
  rootServer: {
    lifecycle: {
      start: vi.fn(),
      addService: vi.fn(),
    },
    community: {
      channelMessages: {
        on: vi.fn(),
        once: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      communityMembers: {
        get: vi.fn().mockResolvedValue({ nickname: "TestUser" }),
        remove: vi.fn(),
        on: vi.fn(),
        once: vi.fn(),
      },
      channels: {
        get: vi.fn(),
        on: vi.fn(),
        once: vi.fn(),
      },
      channelGroups: {
        on: vi.fn(),
        once: vi.fn(),
      },
      channelDirectories: {
        on: vi.fn(),
        once: vi.fn(),
      },
      communityMemberBans: {
        on: vi.fn(),
        once: vi.fn(),
      },
      on: vi.fn(),
      once: vi.fn(),
    },
    jobScheduler: {
      create: vi.fn(),
      on: vi.fn(),
    },
  },
  ChannelMessageEvent: {
    ChannelMessageCreated: "ChannelMessageCreated",
    ChannelMessageEdited: "ChannelMessageEdited",
    ChannelMessageDeleted: "ChannelMessageDeleted",
    ChannelMessageReactionCreated: "ChannelMessageReactionCreated",
    ChannelMessageReactionDeleted: "ChannelMessageReactionDeleted",
    ChannelMessagePinCreated: "ChannelMessagePinCreated",
    ChannelMessagePinDeleted: "ChannelMessagePinDeleted",
    ChannelMessageSetTypingIndicator: "ChannelMessageSetTypingIndicator",
  },
  CommunityEvent: {
    CommunityJoined: "CommunityJoined",
    CommunityLeave: "CommunityLeave",
    CommunityEdited: "CommunityEdited",
  },
  CommunityMemberBanEvent: {
    CommunityMemberBanCreated: "CommunityMemberBanCreated",
    CommunityMemberBanDeleted: "CommunityMemberBanDeleted",
  },
  CommunityMemberEvent: {
    CommunityMemberAttach: "CommunityMemberAttach",
    CommunityMemberDetach: "CommunityMemberDetach",
    UserSetProfile: "UserSetProfile",
  },
  ChannelEvent: {
    ChannelCreated: "ChannelCreated",
    ChannelDeleted: "ChannelDeleted",
    ChannelEdited: "ChannelEdited",
    ChannelMoved: "ChannelMoved",
  },
  ChannelGroupEvent: {
    ChannelGroupCreated: "ChannelGroupCreated",
    ChannelGroupDeleted: "ChannelGroupDeleted",
    ChannelGroupEdited: "ChannelGroupEdited",
    ChannelGroupMoved: "ChannelGroupMoved",
  },
  ChannelDirectoryEvent: {
    ChannelDirectoryCreated: "ChannelDirectoryCreated",
    ChannelDirectoryDeleted: "ChannelDirectoryDeleted",
    ChannelDirectoryEdited: "ChannelDirectoryEdited",
    ChannelDirectoryMoved: "ChannelDirectoryMoved",
  },
  JobScheduleEvent: {
    Job: "Job",
  },
  JobInterval: {
    Daily: 86400000,
    Hourly: 3600000,
    Weekly: 604800000,
  },
}));

vi.mock("@rootsdk/server-bot", () => ({
  rootServer: {
    lifecycle: {
      start: vi.fn(),
      addService: vi.fn(),
    },
    community: {
      channelMessages: {
        on: vi.fn(),
        once: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      communityMembers: {
        get: vi.fn().mockResolvedValue({ nickname: "TestUser" }),
        remove: vi.fn(),
      },
      channels: {
        get: vi.fn(),
      },
    },
    jobScheduler: {
      create: vi.fn(),
      on: vi.fn(),
    },
  },
  ChannelMessageEvent: {
    ChannelMessageCreated: "ChannelMessageCreated",
    ChannelMessageUpdated: "ChannelMessageUpdated",
    ChannelMessageDeleted: "ChannelMessageDeleted",
  },
}));
