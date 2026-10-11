const { ActivityType } = require('discord.js');
const config = require('../config');

function startStatusRotation(client) {
  let index = 0;

  const update = () => {
    if (!client.user) return;

    const firstGuild = client.guilds.cache.first();
    const serverName = firstGuild ? firstGuild.name : 'Server';

    const statusList = [
      { name: serverName, type: ActivityType.Custom },
      { name: 'Manager BOT', type: ActivityType.Custom },
      { name: '.help', type: ActivityType.Custom }
    ];

    const current = statusList[index % statusList.length];
    client.user.setPresence({
      activities: [{
        name: current.name,
        state: current.name,
        type: current.type
      }],
      status: 'idle'
    });

    index++;
  };

  update();
  setInterval(update, config.statusIntervalMs);
}

module.exports = {
  startStatusRotation
};
