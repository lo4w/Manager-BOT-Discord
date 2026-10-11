const { MessageFlags } = require('discord.js');
const { createMediaCard, createErrorCard } = require('../components/v2');

module.exports = {
  name: 'serverbanner',
  aliases: ['sbanner'],
  description: 'Display server banner if configured',
  guildOnly: true,

  async execute(message) {
    const { guild } = message;
    const bannerUrl = guild.bannerURL({ size: 2048, extension: 'png' });

    if (!bannerUrl) {
      const errorCard = createErrorCard('Server Banner', 'This server does not have a banner.');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const card = createMediaCard(
      `${guild.name}'s Banner`,
      bannerUrl,
      `[Download Banner](${bannerUrl})`
    );

    await message.reply({
      components: [card],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
