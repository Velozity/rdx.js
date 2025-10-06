import {
  ChannelMessageCreatedEvent,
  RootEvent,
  RootEventType,
  type EventContext
} from "rdx.js";

export default class WelcomeEvent extends RootEvent {
  constructor() {
    super({
      event: RootEventType.CommunityMemberJoined,
      enabled: true,
    });
  }

  async execute({
    data,
    helpers
  }: EventContext<ChannelMessageCreatedEvent>): Promise<void> {
    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

    await helpers.reply(randomMessage.replace("{user}", await helpers.mention(data.userId)));

    // If you want to do it manually, you can use the rootServer instance
    // await rootServer.community.channelMessages.create({
    //   channelId: data.channelId,
    //   content: randomMessage.replace("{user}", await helpers.mention(data.userId)),
    // });
  }
}

const welcomeMessages = [
  "🎉 Welcome to the community, {user}!",
  "👋 Great to have you here, {user}!",
  "🌟 Welcome, {user}! Feel free to ask any questions!",
  "🎊 Welcome aboard! Enjoy your stay, {user}!",
];
