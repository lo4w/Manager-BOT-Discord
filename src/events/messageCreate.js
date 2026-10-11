const { PermissionsBitField, MessageFlags } = require('discord.js');
const config = require('../config');
const logger = require('../utils/logger');
const { createErrorCard } = require('../components/v2');

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message, client) {
    if (!message || message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    if (!commandName) return;

    const command = client.commands.get(commandName);
    if (!command) return;

    if (command.guildOnly && !message.guild) {
      return message.reply({
        content: 'This command can only be used in a server.'
      });
    }

    if (command.permissions && message.guild) {
      const member = message.member;
      const missing = [];
      for (const perm of command.permissions) {
        if (!member.permissions.has(perm)) {
          missing.push(perm);
        }
      }

      if (missing.length > 0) {
        const errorCard = createErrorCard('Missing Permissions', `You lack the required permission(s) to run this command.`);
        return message.reply({
          components: [errorCard],
          flags: MessageFlags.IsComponentsV2
        });
      }
    }

    try {
      logger.cmd(commandName, message.author.tag, message.guild ? message.guild.name : 'DM');
      await command.execute(message, args, client);
    } catch (error) {
      logger.error(`Error executing command .${commandName}:`, error);
      const errorCard = createErrorCard('Command Error', 'An unexpected error occurred while executing this command.');
      message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      }).catch(err => logger.error('Failed to reply with error card:', err));
    }
  }
};
