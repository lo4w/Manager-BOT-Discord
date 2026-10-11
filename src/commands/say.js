const { PermissionFlagsBits } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  name: 'say',
  description: 'Broadcast a plain text message',
  guildOnly: true,
  permissions: [PermissionFlagsBits.Administrator],

  async execute(message, args) {
    if (args.length === 0) {
      return message.reply('Please provide a message to send.');
    }

    const text = args.join(' ');
    await message.delete().catch(() => null);
    await message.channel.send({ content: text, allowedMentions: { parse: [] } });
    logger.info(`Say broadcasted by ${message.author.tag}: ${text}`);
  }
};
