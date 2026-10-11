const { MessageFlags, ChannelType } = require('discord.js');
const { createCard } = require('../components/v2');

module.exports = {
  name: 'serverinfo',
  aliases: ['sinfo', 'guildinfo'],
  description: 'Display server statistics',
  guildOnly: true,

  async execute(message) {
    const { guild } = message;
    await guild.fetch();
    const owner = await guild.fetchOwner().catch(() => null);

    const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
    const categoryChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;

    const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:F> (<t:${Math.floor(guild.createdTimestamp / 1000)}:R>)`;

    const fields = [
      {
        name: 'General Information',
        value: `**Server Name:** ${guild.name}\n**Server ID:** \`${guild.id}\`\n**Owner:** ${owner ? `<@${owner.id}> (${owner.user.tag})` : 'Unknown'}`
      },
      {
        name: 'Member Counts',
        value: `**Total Members:** ${guild.memberCount}\n**Boost Tier:** Level ${guild.premiumTier}\n**Total Boosts:** ${guild.premiumSubscriptionCount || 0}`
      },
      {
        name: 'Channels and Roles',
        value: `**Text:** ${textChannels} | **Voice:** ${voiceChannels} | **Categories:** ${categoryChannels}\n**Roles:** ${guild.roles.cache.size} | **Emojis:** ${guild.emojis.cache.size}`
      },
      {
        name: 'Creation Date',
        value: createdAt
      }
    ];

    const card = createCard({
      title: `Server Information - ${guild.name}`,
      description: guild.description || 'No server description set.',
      thumbnail: guild.iconURL({ size: 512, extension: 'png' }),
      fields
    });

    await message.reply({
      components: [card],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
