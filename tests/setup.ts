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
