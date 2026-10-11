const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createCard } = require('../components/v2');
const logger = require('../utils/logger');

module.exports = {
  name: 'saycon',
  aliases: ['sayv2', 'embedsay'],
  description: 'Broadcast message in Components V2 container',
  guildOnly: true,
  permissions: [PermissionFlagsBits.Administrator],

  async execute(message, args) {
    if (args.length === 0) {
      return message.reply('Please provide a message. Format: `.saycon [Title |] <message>`');
    }

    const fullText = args.join(' ');
    let title = null;
    let content = fullText;

    if (fullText.includes('|')) {
      const parts = fullText.split('|');
      title = parts[0].trim();
      content = parts.slice(1).join('|').trim();
    }

    const card = createCard({
      title,
      description: content
    });

    await message.delete().catch(() => null);
    await message.channel.send({
      components: [card],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] }
    });

    logger.info(`Saycon container broadcasted in #${message.channel.name} by ${message.author.tag}`);
  }
};
