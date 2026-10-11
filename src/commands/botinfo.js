const { MessageFlags, version: djsVersion } = require('discord.js');
const { createCard } = require('../components/v2');
const { formatDuration } = require('../utils/time');
const os = require('os');

module.exports = {
  name: 'botinfo',
  aliases: ['stats', 'binfo'],
  description: 'Display Manager BOT system statistics',
  guildOnly: false,

  async execute(message, args, client) {
    const uptimeStr = formatDuration(client.uptime);
    const memoryUsageMB = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
    const totalMemGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeMemGB = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);

    const fields = [
      {
        name: 'Bot Status',
        value: `**Tag:** ${client.user.tag}\n**ID:** \`${client.user.id}\`\n**Uptime:** ${uptimeStr}\n**Guilds:** ${client.guilds.cache.size}`
      },
      {
        name: 'Technical Environment',
        value: `**Node.js:** ${process.version}\n**Discord.js:** v${djsVersion}\n**Platform:** ${os.platform()} (${os.arch()})`
      },
      {
        name: 'Resource Usage',
        value: `**Process Memory:** ${memoryUsageMB} MB\n**System RAM:** ${freeMemGB} GB free of ${totalMemGB} GB`
      }
    ];

    const card = createCard({
      title: 'Manager BOT System Information',
      description: 'Production Discord Bot running Components V2 architecture.',
      thumbnail: client.user.displayAvatarURL({ size: 512, extension: 'png' }),
      fields
    });

    await message.reply({
      components: [card],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
