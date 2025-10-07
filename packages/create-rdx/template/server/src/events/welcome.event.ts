import { RootEvent, RootEventType, type EventContext } from "rdx.js";
import { ChannelMessageCreatedEvent } from "@rootsdk/server-app";

export default class WelcomeEvent extends RootEvent {
  constructor() {
    super({
      event: RootEventType.CommunityMemberJoined,
      enabled: true,
    });
  }

  async execute({ event, rootServer }: EventContext<ChannelMessageCreatedEvent>): Promise<void> {
    const user = await rootServer.community.communityMembers.get({
      userId: event.userId,
    });

    console.log(`New member joined: ${user.nickname} (${user.userId})`);

    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

    await event.reply(randomMessage.replace("{user}", await event.mention(event.userId)));
  }
}

const welcomeMessages = [
  "🎉 Welcome to the community, {user}!",
  "👋 Great to have you here, {user}!",
  "🌟 Welcome, {user}! Feel free to ask any questions!",
  "🎊 Welcome aboard! Enjoy your stay, {user}!",
];
