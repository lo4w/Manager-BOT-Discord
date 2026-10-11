const { MessageFlags } = require('discord.js');
const { createCard } = require('../components/v2');

module.exports = {
  name: 'userinfo',
  aliases: ['whois', 'uinfo'],
  description: 'Display detailed user profile',
  guildOnly: true,

  async execute(message, args, client) {
    let user = message.mentions.users.first();
    if (!user && args[0]) {
      user = await client.users.fetch(args[0]).catch(() => null);
    }
    if (!user) {
      user = message.author;
    }

    const member = await message.guild.members.fetch(user.id).catch(() => null);

    const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:F> (<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`;
    const joinedAt = member && member.joinedTimestamp
      ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F> (<t:${Math.floor(member.joinedTimestamp / 1000)}:R>)`
      : 'Not in this server';

    const rolesList = member && member.roles.cache.size > 1
      ? member.roles.cache
          .filter(r => r.id !== message.guild.id)
          .sort((a, b) => b.position - a.position)
          .map(r => `\`@${r.name}\``)
          .slice(0, 20)
          .join(' ')
      : '`@everyone`';

    const fields = [
      {
        name: 'Account Identification',
        value: `- **Tag:** \`${user.tag}\`\n- **User ID:** \`${user.id}\`\n- **Bot Account:** \`${user.bot ? 'True' : 'False'}\``
      },
      {
        name: 'Registration & Membership',
        value: `- **Registered:** ${createdAt}\n- **Joined Server:** ${joinedAt}`
      },
      {
        name: `Server Roles (${member ? member.roles.cache.size - 1 : 0})`,
        value: rolesList
      }
    ];

    const card = createCard({
      title: `User Information — ${user.username}`,
      subtitle: `Viewing profile details for ${user.tag}`,
      description: `### User Profile Overview\nDetailed security and membership telemetry for **${user.username}**.`,
      thumbnail: user.displayAvatarURL({ size: 512, extension: 'png' }),
      fields,
      footer: `Requested by ${message.author.tag} • ID: ${user.id}`
    });

    await message.reply({
      components: [card],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
