const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createSuccessCard, createErrorCard } = require('../components/v2');
const logger = require('../utils/logger');

module.exports = {
  name: 'vmove',
  aliases: ['movevoice'],
  description: 'Move a member to a target voice channel',
  guildOnly: true,
  permissions: [PermissionFlagsBits.MoveMembers],

  async execute(message, args, client) {
    let user = message.mentions.users.first();
    if (!user && args[0]) {
      user = await client.users.fetch(args[0]).catch(() => null);
    }

    if (!user || !args[1]) {
      const errorCard = createErrorCard('Usage Error', 'Usage:\n`.vmove <@user/ID> <TargetVoiceChannelID>`');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member || !member.voice.channel) {
      const errorCard = createErrorCard('Voice Error', 'Target member is not currently in a voice channel.');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const targetChannelId = args[1].replace(/[^0-9]/g, '');
    const targetChannel = message.guild.channels.cache.get(targetChannelId);

    if (!targetChannel || !targetChannel.isVoiceBased()) {
      const errorCard = createErrorCard('Voice Error', 'Specified target is not a valid voice channel in this server.');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    try {
      await member.voice.setChannel(targetChannel, `Moved by ${message.author.tag}`);
      logger.info(`Member ${user.tag} moved to ${targetChannel.name} by ${message.author.tag}`);

      const successCard = createSuccessCard(
        'Member Voice Relocated',
        `### Voice Transfer\n- **Target Member:** <@${user.id}> (\`${user.tag}\`)\n- **Destination:** <#${targetChannel.id}> (\`${targetChannel.name}\`)\n- **Moderator:** <@${message.author.id}>`,
        'Voice routing completed'
      );

      await message.reply({
        components: [successCard],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (err) {
      logger.error('Failed to move voice member:', err);
      const errorCard = createErrorCard('Voice Error', `Could not move member: ${err.message}`);
      message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};
