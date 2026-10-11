const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createSuccessCard, createErrorCard } = require('../components/v2');
const config = require('../config');
const logger = require('../utils/logger');

module.exports = {
  name: 'clear',
  aliases: ['purge', 'clean'],
  description: 'Purge messages from channel',
  guildOnly: true,
  permissions: [PermissionFlagsBits.ManageMessages],

  async execute(message, args) {
    if (!args[0] || isNaN(args[0])) {
      const errorCard = createErrorCard('Usage Error', `Specify amount: \`.clear <1-${config.maxClearLimit}>\``);
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const amount = parseInt(args[0], 10);
    if (amount < 1 || amount > config.maxClearLimit) {
      const errorCard = createErrorCard('Invalid Amount', `Amount must be between 1 and ${config.maxClearLimit}.`);
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    try {
      await message.delete().catch(() => null);
      const deleted = await message.channel.bulkDelete(amount, true);

      logger.info(`Cleared ${deleted.size} messages in #${message.channel.name} by ${message.author.tag}`);

      const successCard = createSuccessCard(
        'Messages Cleared',
        `Successfully deleted **${deleted.size}** messages in <#${message.channel.id}>.`
      );

      const replyMsg = await message.channel.send({
        components: [successCard],
        flags: MessageFlags.IsComponentsV2
      });

      setTimeout(() => replyMsg.delete().catch(() => null), 5000);
    } catch (err) {
      logger.error('Failed to bulkDelete messages:', err);
      const errorCard = createErrorCard('Clear Error', `Could not delete messages: ${err.message}`);
      message.channel.send({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};
