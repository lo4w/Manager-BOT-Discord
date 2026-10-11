const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createSuccessCard, createErrorCard } = require('../components/v2');
const logger = require('../utils/logger');

module.exports = {
  name: 'vkick',
  aliases: ['voicedisconnect'],
  description: 'Disconnect a member from their current voice channel',
  guildOnly: true,
  permissions: [PermissionFlagsBits.MoveMembers],

  async execute(message, args, client) {
    let user = message.mentions.users.first();
    if (!user && args[0]) {
      user = await client.users.fetch(args[0]).catch(() => null);
    }

    if (!user) {
      const errorCard = createErrorCard('Usage Error', 'Usage:\n`.vkick <@user/ID> [reason]`');
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

    const oldChannelName = member.voice.channel.name;
    const reason = args.slice(1).join(' ') || 'Disconnected by staff';

    try {
      await member.voice.disconnect(`${reason} | By ${message.author.tag}`);
      logger.info(`Member disconnected from voice: ${user.tag} by ${message.author.tag}`);

      const successCard = createSuccessCard(
        'Member Disconnected',
        `### Voice Connection Terminated\n- **Target Member:** <@${user.id}> (\`${user.tag}\`)\n- **Channel:** \`#${oldChannelName}\`\n- **Moderator:** <@${message.author.id}>\n- **Reason:** ${reason}`,
        'Voice session ended'
      );

      await message.reply({
        components: [successCard],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (err) {
      logger.error('Failed to disconnect voice member:', err);
      const errorCard = createErrorCard('Voice Error', `Could not disconnect member: ${err.message}`);
      message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};
