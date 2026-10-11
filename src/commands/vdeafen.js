const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createSuccessCard, createErrorCard } = require('../components/v2');
const logger = require('../utils/logger');

module.exports = {
  name: 'vdeafen',
  aliases: ['serverdeafen'],
  description: 'Server deafen a member in voice',
  guildOnly: true,
  permissions: [PermissionFlagsBits.DeafenMembers],

  async execute(message, args, client) {
    let user = message.mentions.users.first();
    if (!user && args[0]) {
      user = await client.users.fetch(args[0]).catch(() => null);
    }

    if (!user) {
      const errorCard = createErrorCard('Usage Error', 'Usage:\n`.vdeafen <@user/ID> [reason]`');
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

    const reason = args.slice(1).join(' ') || 'Server deafened by staff';

    try {
      await member.voice.setDeaf(true, `${reason} | By ${message.author.tag}`);
      logger.info(`Member server deafened: ${user.tag} by ${message.author.tag}`);

      const successCard = createSuccessCard(
        'Member Deafened',
        `### Voice Status Modified\n- **Target Member:** <@${user.id}> (\`${user.tag}\`)\n- **Voice Channel:** <#${member.voice.channel.id}>\n- **Moderator:** <@${message.author.id}>\n- **Reason:** ${reason}`,
        'Voice permissions enforced'
      );

      await message.reply({
        components: [successCard],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (err) {
      logger.error('Failed to deafen member:', err);
      const errorCard = createErrorCard('Voice Error', `Could not deafen member: ${err.message}`);
      message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};
