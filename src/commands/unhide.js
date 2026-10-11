const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createSuccessCard, createErrorCard } = require('../components/v2');
const logger = require('../utils/logger');

module.exports = {
  name: 'unhide',
  description: 'Reveal and unhide the current channel to everyone',
  guildOnly: true,
  permissions: [PermissionFlagsBits.ManageChannels],

  async execute(message, args) {
    const reason = args.join(' ') || 'Channel revealed by staff';

    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        ViewChannel: null
      }, { reason: `${reason} | Revealed by ${message.author.tag}` });

      logger.info(`Channel revealed: #${message.channel.name} by ${message.author.tag}`);

      const successCard = createSuccessCard(
        'Channel Revealed',
        `### Channel Visibility\n- **Target Channel:** <#${message.channel.id}>\n- **Status:** Visible to standard members\n- **Authorized Moderator:** <@${message.author.id}>\n- **Reason:** ${reason}`,
        'Visibility permissions restored'
      );

      await message.reply({
        components: [successCard],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (err) {
      logger.error('Failed to reveal channel:', err);
      const errorCard = createErrorCard('Unhide Error', `Could not unhide channel: ${err.message}`);
      await message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};
