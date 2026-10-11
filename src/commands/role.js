const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createSuccessCard, createErrorCard } = require('../components/v2');
const logger = require('../utils/logger');

module.exports = {
  name: 'role',
  aliases: ['giverole', 'removerole'],
  description: 'Add or remove a role from a member',
  guildOnly: true,
  permissions: [PermissionFlagsBits.ManageRoles],

  async execute(message, args, client) {
    let user = message.mentions.users.first();
    if (!user && args[0]) {
      user = await client.users.fetch(args[0]).catch(() => null);
    }

    if (!user || !args[1]) {
      const errorCard = createErrorCard('Usage Error', 'Usage:\n`.role <@user/ID> <@role/RoleName/RoleID>`');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      const errorCard = createErrorCard('Role Error', 'Target user is not a member of this server.');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const roleQuery = args.slice(1).join(' ').toLowerCase();
    const role = message.mentions.roles.first() ||
      message.guild.roles.cache.get(args[1]) ||
      message.guild.roles.cache.find(r => r.name.toLowerCase() === roleQuery);

    if (!role) {
      const errorCard = createErrorCard('Role Not Found', 'Specified role was not found in this server.');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const botMember = message.guild.members.me;
    if (role.position >= botMember.roles.highest.position) {
      const errorCard = createErrorCard('Hierarchy Error', `Cannot manage \`@${role.name}\`. It is equal to or higher than the bot highest role.`);
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (role.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerId) {
      const errorCard = createErrorCard('Hierarchy Error', `Cannot manage \`@${role.name}\`. It is equal to or higher than your highest role.`);
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    try {
      const hasRole = member.roles.cache.has(role.id);
      if (hasRole) {
        await member.roles.remove(role, `Role removed by ${message.author.tag}`);
        logger.info(`Role @${role.name} removed from ${user.tag} by ${message.author.tag}`);

        const successCard = createSuccessCard(
          'Role Removed',
          `### Role Update\n- **Target Member:** <@${user.id}> (\`${user.tag}\`)\n- **Role:** \`@${role.name}\`\n- **Action:** Removed\n- **Moderator:** <@${message.author.id}>`,
          'Member role modified'
        );
        return message.reply({
          components: [successCard],
          flags: MessageFlags.IsComponentsV2
        });
      } else {
        await member.roles.add(role, `Role added by ${message.author.tag}`);
        logger.info(`Role @${role.name} added to ${user.tag} by ${message.author.tag}`);

        const successCard = createSuccessCard(
          'Role Added',
          `### Role Update\n- **Target Member:** <@${user.id}> (\`${user.tag}\`)\n- **Role:** \`@${role.name}\`\n- **Action:** Granted\n- **Moderator:** <@${message.author.id}>`,
          'Member role modified'
        );
        return message.reply({
          components: [successCard],
          flags: MessageFlags.IsComponentsV2
        });
      }
    } catch (err) {
      logger.error('Failed to toggle role:', err);
      const errorCard = createErrorCard('Role Error', `Could not update role: ${err.message}`);
      message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};
