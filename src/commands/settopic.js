const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createSuccessCard, createErrorCard } = require('../components/v2');
const logger = require('../utils/logger');

module.exports = {
  name: 'settopic',
  aliases: ['topic'],
  description: 'Update the topic description of the current channel',
  guildOnly: true,
  permissions: [PermissionFlagsBits.ManageChannels],

  async execute(message, args) {
    if (args.length === 0) {
      const errorCard = createErrorCard('Usage Error', 'Usage:\n`.settopic <New channel topic>`');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const newTopic = args.join(' ');

    try {
      await message.channel.setTopic(newTopic, `Topic updated by ${message.author.tag}`);
      logger.info(`Channel topic in #${message.channel.name} updated by ${message.author.tag}`);

      const successCard = createSuccessCard(
        'Channel Topic Updated',
        `### Topic Modification\n- **Target Channel:** <#${message.channel.id}>\n- **New Topic:** ${newTopic}\n- **Moderator:** <@${message.author.id}>`,
        'Channel settings updated'
      );

      await message.reply({
        components: [successCard],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (err) {
      logger.error('Failed to set channel topic:', err);
      const errorCard = createErrorCard('Topic Error', `Could not update channel topic: ${err.message}`);
      message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};
