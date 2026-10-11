const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createSuccessCard, createErrorCard } = require('../components/v2');
const logger = require('../utils/logger');

module.exports = {
  name: 'nuke',
  description: 'Duplicate and recreate the current channel with identical permissions',
  guildOnly: true,
  permissions: [PermissionFlagsBits.ManageChannels],

  async execute(message) {
    const channel = message.channel;
    const position = channel.position;

    try {
      const cloned = await channel.clone({
        name: channel.name,
        permissions: channel.permissionOverwrites.cache,
        topic: channel.topic,
        nsfw: channel.nsfw,
        parent: channel.parent,
        rateLimitPerUser: channel.rateLimitPerUser,
        reason: `Channel nuked by ${message.author.tag}`
      });

      await cloned.setPosition(position);
      await channel.delete(`Nuked by ${message.author.tag}`).catch(() => null);

      logger.info(`Channel nuked: #${cloned.name} by ${message.author.tag}`);

      const successCard = createSuccessCard(
        'Channel Nuked',
        `### Channel Reconstructed\n- **Target Channel:** <#${cloned.id}> (\`#${cloned.name}\`)\n- **Authorized Moderator:** <@${message.author.id}>\n- **Action:** Complete history purge & channel clone`,
        'Channel history cleared'
      );

      await cloned.send({
        components: [successCard],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (err) {
      logger.error('Failed to nuke channel:', err);
      const errorCard = createErrorCard('Nuke Failed', `Could not nuke channel: ${err.message}`);
      message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};
