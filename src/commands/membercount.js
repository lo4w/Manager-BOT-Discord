const { MessageFlags } = require('discord.js');
const { createCard } = require('../components/v2');

module.exports = {
  name: 'membercount',
  aliases: ['members', 'mc'],
  description: 'Display member and bot counts for the server',
  guildOnly: true,

  async execute(message) {
    const { guild } = message;
    await guild.members.fetch();

    const total = guild.memberCount;
    const humans = guild.members.cache.filter(m => !m.user.bot).size;
    const bots = guild.members.cache.filter(m => m.user.bot).size;

    const fields = [
      { name: 'Total Members', value: `\`${total.toLocaleString()}\`` },
      { name: 'Humans', value: `\`${humans.toLocaleString()}\`` },
      { name: 'Bots', value: `\`${bots.toLocaleString()}\`` }
    ];

    const card = createCard({
      title: `Member Count - ${guild.name}`,
      description: `Detailed member composition for **${guild.name}**`,
      thumbnail: guild.iconURL({ size: 512, extension: 'png' }),
      fields
    });

    await message.reply({
      components: [card],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
