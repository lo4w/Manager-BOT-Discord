const { MessageFlags } = require('discord.js');
const { createCard } = require('../components/v2');

module.exports = {
  name: 'roles',
  aliases: ['rolelist'],
  description: 'Display all roles configured in the server',
  guildOnly: true,

  async execute(message) {
    const { guild } = message;
    const roles = guild.roles.cache
      .filter(r => r.id !== guild.id)
      .sort((a, b) => b.position - a.position);

    const totalRoles = roles.size;
    const roleList = roles
      .map(r => `\`@${r.name}\``)
      .slice(0, 35)
      .join(' ');

    const fields = [
      {
        name: 'Role Hierarchy Structure',
        value: roleList || '`No custom roles found`'
      }
    ];

    const card = createCard({
      title: `Server Roles — ${guild.name}`,
      subtitle: `Total configured roles: ${totalRoles}`,
      description: `### Role Architecture\nListing the top highest hierarchy roles in **${guild.name}** without pinging.`,
      thumbnail: guild.iconURL({ size: 512, extension: 'png' }),
      fields,
      footer: `Guild ID: ${guild.id} • Displaying up to 35 roles`
    });

    await message.reply({
      components: [card],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
