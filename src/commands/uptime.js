const { MessageFlags } = require('discord.js');
const { createCard } = require('../components/v2');
const { formatDuration } = require('../utils/time');

module.exports = {
  name: 'uptime',
  description: 'Display how long the bot has been continuously online',
  guildOnly: false,

  async execute(message, args, client) {
    const formatted = formatDuration(client.uptime);
    const readyTimestamp = Math.floor((Date.now() - client.uptime) / 1000);

    const card = createCard({
      title: 'Bot Uptime',
      description: `**Current Uptime:** \`${formatted}\`\n**Online Since:** <t:${readyTimestamp}:F> (<t:${readyTimestamp}:R>)`
    });

    await message.reply({
      components: [card],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
