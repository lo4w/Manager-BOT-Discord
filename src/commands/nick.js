const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createSuccessCard, createErrorCard } = require('../components/v2');
const logger = require('../utils/logger');

module.exports = {
  name: 'nick',
  aliases: ['nickname', 'setnick'],
  description: 'Change or reset the nickname of a member',
  guildOnly: true,
  permissions: [PermissionFlagsBits.ManageNicknames],

  async execute(message, args, client) {
    let user = message.mentions.users.first();
    if (!user && args[0]) {
      user = await client.users.fetch(args[0]).catch(() => null);
    }

    if (!user) {
      const errorCard = createErrorCard('Usage Error', 'Usage:\n`.nick <@user/ID> [New Nickname]`\n*(Leave nickname empty to reset)*');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      const errorCard = createErrorCard('Member Not Found', 'Target user is not in this server.');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (!member.manageable && member.id !== message.guild.ownerId) {
      const errorCard = createErrorCard('Hierarchy Error', `Cannot change nickname for <@${user.id}> due to role hierarchy.`);
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const newNickname = args.slice(1).join(' ') || null;

    try {
      await member.setNickname(newNickname, `Nickname modified by ${message.author.tag}`);
      logger.info(`Nickname of ${user.tag} changed to "${newNickname || 'RESET'}" by ${message.author.tag}`);

      const successCard = createSuccessCard(
        'Nickname Updated',
        `### Nickname Changed\n- **Target Member:** <@${user.id}> (\`${user.tag}\`)\n- **New Nickname:** \`${newNickname || 'Reset to Username'}\`\n- **Moderator:** <@${message.author.id}>`,
        'Member details updated'
      );

      await message.reply({
        components: [successCard],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (err) {
      logger.error('Failed to change nickname:', err);
      const errorCard = createErrorCard('Nickname Error', `Could not modify nickname: ${err.message}`);
      message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};
