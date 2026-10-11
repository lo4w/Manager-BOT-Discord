const { handleHelpSelect } = require('../commands/help');
const { handlePollButton } = require('../commands/poll');
const logger = require('../utils/logger');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    try {
      if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'help_category_select') {
          await handleHelpSelect(interaction);
          return;
        }
      }

      if (interaction.isButton()) {
        if (interaction.customId.startsWith('poll_vote_')) {
          await handlePollButton(interaction);
          return;
        }
      }
    } catch (error) {
      logger.error('Error handling interaction:', error);
    }
  }
};
