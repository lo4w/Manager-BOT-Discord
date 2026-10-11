module.exports = {
  name: 'voiceStateUpdate',
  once: false,
  async execute(oldState, newState, client) {
    if (client.voiceManager) {
      client.voiceManager.handleVoiceStateUpdate(oldState, newState);
    }
  }
};
