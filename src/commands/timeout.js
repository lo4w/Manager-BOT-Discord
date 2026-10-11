const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createSuccessCard, createErrorCard } = require('../components/v2');
const { parseDuration, formatDuration } = require('../utils/time');
const logger = require('../utils/logger');

module.exports = {
  name: 'timeout',
  aliases: ['mute'],
  description: 'Timeout a member',
  guildOnly: true,
  permissions: [PermissionFlagsBits.ModerateMembers],

  async execute(message, args, client) {
    let user = message.mentions.users.first();
    if (!user && args[0]) {
      user = await client.users.fetch(args[0]).catch(() => null);
    }

    if (!user || !args[1]) {
      const errorCard = createErrorCard('Usage Error', 'Usage: `.timeout <@user/ID> <duration> [reason]`\nExamples: `.timeout @user 10m`, `.timeout @user 2h Rule 1`');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const durationInput = args[1];
    const durationMs = parseDuration(durationInput);

    if (!durationMs || durationMs < 5000 || durationMs > 28 * 24 * 60 * 60 * 1000) {
      const errorCard = createErrorCard('Invalid Duration', 'Duration must be between 5s and 28d. Units: `s`, `m`, `h`, `d`.');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      const errorCard = createErrorCard('Timeout Failed', 'Target member is not in this server.');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (!member.moderatable) {
      const errorCard = createErrorCard('Timeout Failed', `Cannot timeout <@${user.id}>. Target has higher or equal role hierarchy.`);
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const reason = args.slice(2).join(' ') || 'No reason provided';

    try {
      await member.timeout(durationMs, `${reason} | Timeout by ${message.author.tag}`);

      logger.info(`Member timed out: ${user.tag} (${user.id}) for ${formatDuration(durationMs)} by ${message.author.tag}`);

      const successCard = createSuccessCard(
        'Member Timed Out',
        `**User:** <@${user.id}> (${user.tag})\n**Duration:** ${formatDuration(durationMs)}\n**Moderator:** <@${message.author.id}>\n**Reason:** ${reason}`
      );

      await message.reply({
        components: [successCard],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (err) {
      logger.error(`Failed to timeout ${user.id}:`, err);
      const errorCard = createErrorCard('Timeout Error', `Failed to apply timeout: ${err.message}`);
      await message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};
