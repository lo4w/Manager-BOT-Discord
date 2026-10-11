const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createSuccessCard, createErrorCard } = require('../components/v2');
const logger = require('../utils/logger');

module.exports = {
  name: 'untimeout',
  aliases: ['unmute'],
  description: 'Remove timeout from a member',
  guildOnly: true,
  permissions: [PermissionFlagsBits.ModerateMembers],

  async execute(message, args, client) {
    let user = message.mentions.users.first();
    if (!user && args[0]) {
      user = await client.users.fetch(args[0]).catch(() => null);
    }

    if (!user) {
      const errorCard = createErrorCard('Usage Error', 'Specify a member: `.untimeout <@user/ID> [reason]`');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      const errorCard = createErrorCard('Untimeout Failed', 'Target member is not in this server.');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (!member.communicationDisabledUntil) {
      const errorCard = createErrorCard('Untimeout Failed', `<@${user.id}> is not currently timed out.`);
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (!member.moderatable) {
      const errorCard = createErrorCard('Untimeout Failed', `Cannot untimeout <@${user.id}> due to role hierarchy.`);
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await member.timeout(null, `${reason} | Untimeout by ${message.author.tag}`);

      logger.info(`Member untimed out: ${user.tag} (${user.id}) by ${message.author.tag}`);

      const successCard = createSuccessCard(
        'Timeout Removed',
        `**User:** <@${user.id}> (${user.tag})\n**Moderator:** <@${message.author.id}>\n**Reason:** ${reason}`
      );

      await message.reply({
        components: [successCard],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (err) {
      logger.error(`Failed to untimeout ${user.id}:`, err);
      const errorCard = createErrorCard('Untimeout Error', `Failed to remove timeout: ${err.message}`);
      await message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};
