const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createSuccessCard, createErrorCard } = require('../components/v2');
const { parseDuration } = require('../utils/time');
const logger = require('../utils/logger');

module.exports = {
  name: 'slowmode',
  aliases: ['slow'],
  description: 'Set channel slowmode cooldown rate',
  guildOnly: true,
  permissions: [PermissionFlagsBits.ManageChannels],

  async execute(message, args) {
    if (!args[0]) {
      const errorCard = createErrorCard('Usage Error', 'Specify a duration:\n`.slowmode 5s`\n`.slowmode 1m`\n`.slowmode 0` (to disable)');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    let seconds = 0;
    if (args[0] === '0' || args[0].toLowerCase() === 'off') {
      seconds = 0;
    } else {
      const parsed = parseDuration(args[0]);
      if (parsed === null) {
        const errorCard = createErrorCard('Invalid Format', 'Use valid formats like `5s`, `10s`, `1m`, `5m`, `6h`. Maximum is `6h`.');
        return message.reply({
          components: [errorCard],
          flags: MessageFlags.IsComponentsV2
        });
      }
      seconds = Math.floor(parsed / 1000);
    }

    if (seconds > 21600 || seconds < 0) {
      const errorCard = createErrorCard('Invalid Range', 'Slowmode rate must be between 0 seconds and 6 hours.');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    try {
      await message.channel.setRateLimitPerUser(seconds, `Slowmode adjusted by ${message.author.tag}`);
      logger.info(`Slowmode set to ${seconds}s in #${message.channel.name} by ${message.author.tag}`);

      const successCard = createSuccessCard(
        'Slowmode Updated',
        `### Channel Cooldown Rate\n- **Target Channel:** <#${message.channel.id}>\n- **New Rate Limit:** \`${seconds} seconds\` per user\n- **Moderator:** <@${message.author.id}>`,
        'Slowmode policy active'
      );

      await message.reply({
        components: [successCard],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (err) {
      logger.error('Failed to set slowmode:', err);
      const errorCard = createErrorCard('Slowmode Failed', `Could not update slowmode: ${err.message}`);
      message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};
