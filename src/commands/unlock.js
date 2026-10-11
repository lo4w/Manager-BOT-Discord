const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createSuccessCard, createErrorCard } = require('../components/v2');
const logger = require('../utils/logger');

module.exports = {
  name: 'unlock',
  description: 'Unlock current channel',
  guildOnly: true,
  permissions: [PermissionFlagsBits.ManageChannels],

  async execute(message, args) {
    const reason = args.join(' ') || 'Channel unlocked by staff';

    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: null,
        SendMessagesInThreads: null,
        CreatePublicThreads: null,
        CreatePrivateThreads: null
      }, { reason: `${reason} | Unlocked by ${message.author.tag}` });

      logger.info(`Channel unlocked: #${message.channel.name} by ${message.author.tag}`);

      const successCard = createSuccessCard(
        'Channel Unlocked',
        `This channel (<#${message.channel.id}>) has been unlocked.\n**Moderator:** <@${message.author.id}>\n**Reason:** ${reason}`
      );

      await message.reply({
        components: [successCard],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (err) {
      logger.error('Failed to unlock channel:', err);
      const errorCard = createErrorCard('Unlock Error', `Could not unlock channel: ${err.message}`);
      await message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};
