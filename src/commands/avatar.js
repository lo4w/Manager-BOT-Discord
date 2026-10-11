const { MessageFlags } = require('discord.js');
const { createMediaCard } = require('../components/v2');

module.exports = {
  name: 'avatar',
  aliases: ['av', 'pfp'],
  description: 'Display avatar of user',
  guildOnly: false,

  async execute(message, args, client) {
    let user = message.mentions.users.first();
    if (!user && args[0]) {
      user = await client.users.fetch(args[0]).catch(() => null);
    }
    if (!user) {
      user = message.author;
    }

    const avatarUrl = user.displayAvatarURL({ size: 1024, extension: 'png' });
    const webpUrl = user.displayAvatarURL({ size: 1024, extension: 'webp' });

    const card = createMediaCard(
      `${user.username}'s Avatar`,
      avatarUrl,
      `[Download PNG](${avatarUrl}) • [Download WEBP](${webpUrl})`
    );

    await message.reply({
      components: [card],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
