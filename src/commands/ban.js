const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createSuccessCard, createErrorCard } = require('../components/v2');
const logger = require('../utils/logger');

module.exports = {
  name: 'ban',
  description: 'Ban a member from the server',
  guildOnly: true,
  permissions: [PermissionFlagsBits.BanMembers],

  async execute(message, args, client) {
    let user = message.mentions.users.first();
    if (!user && args[0]) {
      user = await client.users.fetch(args[0]).catch(() => null);
    }

    if (!user) {
      const errorCard = createErrorCard('Usage Error', 'Specify a user to ban: `.ban <@user/ID> [reason]`');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';
    const member = await message.guild.members.fetch(user.id).catch(() => null);

    if (member) {
      if (!member.bannable) {
        const errorCard = createErrorCard('Ban Failed', `Cannot ban <@${user.id}>. Target has higher or equal role hierarchy.`);
        return message.reply({
          components: [errorCard],
          flags: MessageFlags.IsComponentsV2
        });
      }

      if (member.id === message.author.id) {
        const errorCard = createErrorCard('Ban Failed', 'You cannot ban yourself.');
        return message.reply({
          components: [errorCard],
          flags: MessageFlags.IsComponentsV2
        });
      }
    }

    try {
      await message.guild.bans.create(user.id, {
        reason: `${reason} | Banned by ${message.author.tag}`
      });

      logger.info(`Member banned: ${user.tag} (${user.id}) by ${message.author.tag}`);

      const successCard = createSuccessCard(
        'Member Banned',
        `**User:** <@${user.id}> (${user.tag})\n**Moderator:** <@${message.author.id}>\n**Reason:** ${reason}`
      );

      await message.reply({
        components: [successCard],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (err) {
      logger.error(`Failed to ban ${user.id}:`, err);
      const errorCard = createErrorCard('Ban Error', `Failed to ban user: ${err.message}`);
      await message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};
