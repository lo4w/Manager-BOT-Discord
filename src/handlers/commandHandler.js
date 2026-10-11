const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

function loadCommands(client) {
  client.commands.clear();
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
      delete require.cache[require.resolve(filePath)];
      const command = require(filePath);
      if (command && command.name && command.execute) {
        client.commands.set(command.name.toLowerCase(), command);
        if (command.aliases && Array.isArray(command.aliases)) {
          for (const alias of command.aliases) {
            client.commands.set(alias.toLowerCase(), command);
          }
        }
      } else {
        logger.warn(`Command at ${file} is missing required name or execute property.`);
      }
    } catch (error) {
      logger.error(`Failed to load command ${file}:`, error);
    }
  }
}

module.exports = {
  loadCommands
};
