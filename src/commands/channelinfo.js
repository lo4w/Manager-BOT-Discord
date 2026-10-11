const { MessageFlags } = require('discord.js');
const { createCard } = require('../components/v2');

module.exports = {
  name: 'channelinfo',
  aliases: ['cinfo', 'ci'],
  description: 'Display detailed channel statistics and settings',
  guildOnly: true,

  async execute(message, args) {
    let channel = message.mentions.channels.first();
    if (!channel && args[0]) {
      channel = message.guild.channels.cache.get(args[0]);
    }
    if (!channel) {
      channel = message.channel;
    }

    const createdAt = `<t:${Math.floor(channel.createdTimestamp / 1000)}:F> (<t:${Math.floor(channel.createdTimestamp / 1000)}:R>)`;

    const fields = [
      {
        name: 'Channel Identification',
        value: `**Name:** <#${channel.id}> (\`${channel.name}\`)\n**ID:** \`${channel.id}\`\n**Type:** \`${channel.type}\``
      },
      {
        name: 'Configuration',
        value: `**Category:** ${channel.parent ? channel.parent.name : 'None'}\n**Position:** \`${channel.position}\`\n**NSFW:** \`${channel.nsfw ? 'Yes' : 'No'}\`\n**Rate Limit:** \`${channel.rateLimitPerUser || 0}s\``
      },
      {
        name: 'Creation Date',
        value: createdAt
      }
    ];

    const card = createCard({
      title: `Channel Information - #${channel.name}`,
      description: channel.topic ? `**Topic:** ${channel.topic}` : 'No topic set for this channel.',
      fields
    });

    await message.reply({
      components: [card],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
