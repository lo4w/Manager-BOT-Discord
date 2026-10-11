const { MessageFlags } = require('discord.js');
const { createMediaCard, createErrorCard } = require('../components/v2');

module.exports = {
  name: 'banner',
  aliases: ['userbanner'],
  description: 'Display user profile banner in high resolution',
  guildOnly: false,

  async execute(message, args, client) {
    let user = message.mentions.users.first();
    if (!user && args[0]) {
      user = await client.users.fetch(args[0]).catch(() => null);
    }
    if (!user) {
      user = message.author;
    }

    const fetchedUser = await client.users.fetch(user.id, { force: true }).catch(() => null);
    const bannerUrl = fetchedUser ? fetchedUser.bannerURL({ size: 2048, extension: 'png' }) : null;

    if (!bannerUrl) {
      const errorCard = createErrorCard('Profile Banner', `<@${user.id}> does not have a profile banner set.`);
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const card = createMediaCard(
      `${user.username}'s Banner`,
      bannerUrl,
      `[Download Banner](${bannerUrl})`,
      `Requested by ${message.author.tag} • ID: ${user.id}`
    );

    await message.reply({
      components: [card],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
