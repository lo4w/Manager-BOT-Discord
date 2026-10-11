const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createSuccessCard, createErrorCard } = require('../components/v2');
const logger = require('../utils/logger');

module.exports = {
  name: 'vundeafen',
  aliases: ['serverundeafen'],
  description: 'Server undeafen a member in voice',
  guildOnly: true,
  permissions: [PermissionFlagsBits.DeafenMembers],

  async execute(message, args, client) {
    let user = message.mentions.users.first();
    if (!user && args[0]) {
      user = await client.users.fetch(args[0]).catch(() => null);
    }

    if (!user) {
      const errorCard = createErrorCard('Usage Error', 'Usage:\n`.vundeafen <@user/ID> [reason]`');
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

    const reason = args.slice(1).join(' ') || 'Server undeafened by staff';

    try {
      await member.voice.setDeaf(false, `${reason} | By ${message.author.tag}`);
      logger.info(`Member server undeafened: ${user.tag} by ${message.author.tag}`);

      const successCard = createSuccessCard(
        'Member Undeafened',
        `### Voice Status Modified\n- **Target Member:** <@${user.id}> (\`${user.tag}\`)\n- **Voice Channel:** <#${member.voice.channel.id}>\n- **Moderator:** <@${message.author.id}>\n- **Reason:** ${reason}`,
        'Voice permissions restored'
      );

      await message.reply({
        components: [successCard],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (err) {
      logger.error('Failed to undeafen member:', err);
      const errorCard = createErrorCard('Voice Error', `Could not undeafen member: ${err.message}`);
      message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};
