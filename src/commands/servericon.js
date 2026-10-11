const { MessageFlags } = require('discord.js');
const { createMediaCard, createErrorCard } = require('../components/v2');

module.exports = {
  name: 'servericon',
  aliases: ['sicon', 'guildicon'],
  description: 'Display high resolution server icon',
  guildOnly: true,

  async execute(message) {
    const { guild } = message;
    const iconUrl = guild.iconURL({ size: 1024, extension: 'png' });

    if (!iconUrl) {
      const errorCard = createErrorCard('Server Icon', 'This server does not have an icon.');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const webpUrl = guild.iconURL({ size: 1024, extension: 'webp' });
    const card = createMediaCard(
      `${guild.name}'s Icon`,
      iconUrl,
      `[Download PNG](${iconUrl}) • [Download WEBP](${webpUrl})`
    );

    await message.reply({
      components: [card],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
