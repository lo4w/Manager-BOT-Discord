const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createSuccessCard, createErrorCard } = require('../components/v2');
const logger = require('../utils/logger');

module.exports = {
  name: 'lock',
  description: 'Lock current channel',
  guildOnly: true,
  permissions: [PermissionFlagsBits.ManageChannels],

  async execute(message, args) {
    const reason = args.join(' ') || 'Channel locked by staff';

    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false,
        SendMessagesInThreads: false,
        CreatePublicThreads: false,
        CreatePrivateThreads: false
      }, { reason: `${reason} | Locked by ${message.author.tag}` });

      logger.info(`Channel locked: #${message.channel.name} by ${message.author.tag}`);

      const successCard = createSuccessCard(
        'Channel Locked',
        `This channel (<#${message.channel.id}>) has been locked.\n**Moderator:** <@${message.author.id}>\n**Reason:** ${reason}`
      );

      await message.reply({
        components: [successCard],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (err) {
      logger.error('Failed to lock channel:', err);
      const errorCard = createErrorCard('Lock Error', `Could not lock channel: ${err.message}`);
      await message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};
