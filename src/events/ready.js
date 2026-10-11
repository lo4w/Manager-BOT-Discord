const logger = require('../utils/logger');
const { startStatusRotation } = require('../handlers/statusHandler');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    logger.banner(client);
    startStatusRotation(client);

    const voiceChannelId = process.env.VOICE_CHANNEL_ID;
    if (voiceChannelId && client.voiceManager) {
      try {
        const channel = await client.channels.fetch(voiceChannelId).catch(() => null);
        if (channel && channel.isVoiceBased()) {
          await client.voiceManager.join(channel.guild, voiceChannelId);
          client.voiceManager.init(voiceChannelId);
        } else {
          logger.warn(`Configured VOICE_CHANNEL_ID (${voiceChannelId}) is not reachable or not a voice channel.`);
        }
      } catch (err) {
        logger.error('Failed to connect to initial voice channel:', err);
      }
    }
  }
};
