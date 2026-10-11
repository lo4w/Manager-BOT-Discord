const { MessageFlags } = require('discord.js');
const { buildMainHelpCard, buildCategoryHelpCard } = require('../components/helpMenu');

const activeTimeouts = new Map();

function scheduleExpiration(message) {
  if (!message || !message.id) return;

  if (activeTimeouts.has(message.id)) {
    clearTimeout(activeTimeouts.get(message.id));
  }

  const timer = setTimeout(async () => {
    try {
      activeTimeouts.delete(message.id);
      const homeCard = buildMainHelpCard(true);
      await message.edit({
        components: [homeCard],
        flags: MessageFlags.IsComponentsV2
      });
    } catch {}
  }, 120000);

  activeTimeouts.set(message.id, timer);
}

module.exports = {
  name: 'help',
  description: 'Display Manager BOT interactive help center',
  guildOnly: false,

  async execute(message, args) {
    let card;
    if (args.length > 0) {
      const categoryArg = args[0].toLowerCase();
      card = buildCategoryHelpCard(categoryArg, false);
    } else {
      card = buildMainHelpCard(false);
    }

    const replyMsg = await message.reply({
      components: [card],
      flags: MessageFlags.IsComponentsV2
    });

    scheduleExpiration(replyMsg);
  },

  async handleHelpSelect(interaction) {
    const selected = interaction.values[0];
    const updatedCard = buildCategoryHelpCard(selected, false);

    await interaction.update({
      components: [updatedCard],
      flags: MessageFlags.IsComponentsV2
    });

    if (interaction.message) {
      scheduleExpiration(interaction.message);
    }
  }
};
