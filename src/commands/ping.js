const { MessageFlags } = require('discord.js');
const { createCard } = require('../components/v2');

module.exports = {
  name: 'ping',
  description: 'Check bot latency and API heartbeat',
  guildOnly: false,

  async execute(message, args, client) {
    const sent = await message.reply({
      components: [
        createCard({
          title: 'Ping',
          description: 'Calculating roundtrip latency...'
        })
      ],
      flags: MessageFlags.IsComponentsV2
    });

    const roundtrip = sent.createdTimestamp - message.createdTimestamp;
    const wsPing = client.ws.ping;

    const fields = [
      { name: 'Gateway Heartbeat', value: `${wsPing >= 0 ? wsPing : 0}ms` },
      { name: 'Roundtrip Latency', value: `${roundtrip}ms` }
    ];

    const card = createCard({
      title: 'Pong',
      description: 'System latency statistics',
      fields
    });

    await sent.edit({
      components: [card],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
