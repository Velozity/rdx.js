import type { ChannelMessageCreatedEvent, CommunityMember } from "@rootsdk/server-app";
import { rootServer } from "@rootsdk/server-app";

export class CommandHelpers {
  constructor(private evt: ChannelMessageCreatedEvent) {}

  public async mention(): Promise<string> {
    const nickname = await this.getMemberNickname();
    return `[@${nickname}](root://user/${this.evt.userId})`;
  }

  async getMemberNickname(): Promise<string> {
    const member: CommunityMember = await rootServer.community.communityMembers.get({
      userId: this.evt.userId,
    });

    return member.nickname;
  }

  /**
   * Reply to the message that triggered the command
   */
  async reply(
    content: string,
    options?: {
      includeMention?: boolean;
    }
  ): Promise<void> {
    const shouldMention = options?.includeMention ?? false;
    const finalContent = shouldMention ? (await this.mention()) + " " + content : content;

    await rootServer.community.channelMessages.create({
      channelId: this.evt.channelId,
      content: finalContent,
    });
  }

  get member() {
    return {
      id: this.evt.userId,
      mention: () => this.mention(),
    };
  }

  /**
   * Get the original root server client for advanced usage
   */
  get rawClient() {
    return rootServer;
  }

  /**
   * Get the original event for advanced usage
   */
  get rawEvent() {
    return this.evt;
  }
}
