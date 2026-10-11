const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createSuccessCard, createErrorCard } = require('../components/v2');
const logger = require('../utils/logger');

module.exports = {
  name: 'hide',
  description: 'Hide the current channel from everyone',
  guildOnly: true,
  permissions: [PermissionFlagsBits.ManageChannels],

  async execute(message, args) {
    const reason = args.join(' ') || 'Channel hidden by staff';

    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        ViewChannel: false
      }, { reason: `${reason} | Hidden by ${message.author.tag}` });

      logger.info(`Channel hidden: #${message.channel.name} by ${message.author.tag}`);

      const successCard = createSuccessCard(
        'Channel Hidden',
        `### Channel Visibility\n- **Target Channel:** <#${message.channel.id}>\n- **Status:** Hidden from standard members\n- **Authorized Moderator:** <@${message.author.id}>\n- **Reason:** ${reason}`,
        'Visibility permissions updated'
      );

      await message.reply({
        components: [successCard],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (err) {
      logger.error('Failed to hide channel:', err);
      const errorCard = createErrorCard('Hide Error', `Could not hide channel: ${err.message}`);
      await message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};
