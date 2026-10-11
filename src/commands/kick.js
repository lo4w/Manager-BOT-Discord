const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createSuccessCard, createErrorCard } = require('../components/v2');
const logger = require('../utils/logger');

module.exports = {
  name: 'kick',
  description: 'Kick a member from the server',
  guildOnly: true,
  permissions: [PermissionFlagsBits.KickMembers],

  async execute(message, args, client) {
    let user = message.mentions.users.first();
    if (!user && args[0]) {
      user = await client.users.fetch(args[0]).catch(() => null);
    }

    if (!user) {
      const errorCard = createErrorCard('Usage Error', 'Specify a member to kick: `.kick <@user/ID> [reason]`');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const member = await message.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      const errorCard = createErrorCard('Kick Failed', 'Target member is not in this server.');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (!member.kickable) {
      const errorCard = createErrorCard('Kick Failed', `Cannot kick <@${user.id}>. Target has higher or equal role hierarchy.`);
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (member.id === message.author.id) {
      const errorCard = createErrorCard('Kick Failed', 'You cannot kick yourself.');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await member.kick(`${reason} | Kicked by ${message.author.tag}`);

      logger.info(`Member kicked: ${user.tag} (${user.id}) by ${message.author.tag}`);

      const successCard = createSuccessCard(
        'Member Kicked',
        `**User:** <@${user.id}> (${user.tag})\n**Moderator:** <@${message.author.id}>\n**Reason:** ${reason}`
      );

      await message.reply({
        components: [successCard],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (err) {
      logger.error(`Failed to kick ${user.id}:`, err);
      const errorCard = createErrorCard('Kick Error', `Failed to kick member: ${err.message}`);
      await message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};
