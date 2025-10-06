import { ChannelGuid, rootServer, UserGuid } from "@rootsdk/server-app";

/**
 * Helper methods for event handlers
 * Provides convenient methods for common operations
 */
export class EventHelpers {
  constructor(private channelId: ChannelGuid) {}

  public async mention(userId: string): Promise<string> {
    const nickname = await this.getMemberNickname(userId);
    return `[@${nickname}](root://user/${userId})`;
  }

  async getMemberNickname(userId: string): Promise<string> {
    const member = await rootServer.community.communityMembers.get({
      userId: userId as UserGuid,
    });

    return member.nickname;
  }

  async reply(content: string): Promise<void> {
    await rootServer.community.channelMessages.create({
      channelId: this.channelId,
      content: content,
    });
  }

  get channel() {
    return {
      id: this.channelId,
      createMessage: (content: string): Promise<void> => this.reply(content),
    };
  }

  /**
   * Get the original root server client for advanced usage
   */
  get rawClient() {
    return rootServer;
  }
}
