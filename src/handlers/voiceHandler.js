const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const logger = require('../utils/logger');
const config = require('../config');

class VoiceManager {
  constructor(client) {
    this.client = client;
    this.targetChannelId = null;
    this.currentGuildId = null;
    this.healthInterval = null;
    this.reconnectAttempts = 0;
  }

  init(targetChannelId) {
    if (!targetChannelId) {
      logger.warn('VOICE_CHANNEL_ID not set. 24/7 Voice connection disabled.');
      return;
    }
    this.targetChannelId = targetChannelId;
    this.startHealthCheck();
    logger.info(`24/7 Voice Manager initialized for channel ${this.targetChannelId}`);
  }

  async join(guild, channelId) {
    try {
      const channel = await guild.channels.fetch(channelId).catch(() => null);
      if (!channel || !channel.isVoiceBased()) {
        logger.error(`Cannot join: channel ${channelId} is invalid or not voice-based.`);
        return false;
      }

      const existingConnection = getVoiceConnection(guild.id);
      if (existingConnection && existingConnection.joinConfig.channelId === channelId) {
        return true;
      }
      if (existingConnection) {
        existingConnection.destroy();
      }

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: true,
        selfMute: false
      });

      this.currentGuildId = guild.id;
      this.reconnectAttempts = 0;
      this.bindEvents(connection, channel.name);
      logger.info(`Joined voice channel: ${channel.name} (${channel.id}) with self-deafen.`);
      return true;
    } catch (error) {
      logger.error(`Error joining voice channel ${channelId}:`, error);
      return false;
    }
  }

  bindEvents(connection, channelName) {
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      logger.warn(`Disconnected from voice channel ${channelName}, reconnecting...`);
      let attempts = 0;
      const maxAttempts = config.maxReconnectionAttempts;
      const baseDelay = 1000;

      while (attempts < maxAttempts) {
        try {
          await entersState(connection, VoiceConnectionStatus.Signalling, 5000);
          await entersState(connection, VoiceConnectionStatus.Ready, 5000);
          logger.info(`Reconnected successfully to voice channel ${channelName}`);
          this.reconnectAttempts = 0;
          return;
        } catch (error) {
          attempts++;
          const delay = baseDelay * Math.pow(2, attempts);
          logger.warn(`Voice reconnect attempt ${attempts}/${maxAttempts} failed. Retrying in ${delay}ms...`);
          if (attempts >= maxAttempts) break;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      logger.error(`Failed to reconnect after ${maxAttempts} attempts. Resetting connection.`);
      connection.destroy();
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
      logger.warn(`Voice connection destroyed for ${channelName}. Health check will restore.`);
    });

    connection.on('error', error => {
      logger.error(`Voice connection error in ${channelName}:`, error);
    });
  }

  async checkHealth() {
    if (!this.targetChannelId || !this.currentGuildId) return;
    const guild = this.client.guilds.cache.get(this.currentGuildId);
    if (!guild) return;

    const connection = getVoiceConnection(this.currentGuildId);
    if (!connection || connection.joinConfig.channelId !== this.targetChannelId) {
      logger.info('Voice health check: connection missing or wrong channel. Reconnecting...');
      await this.join(guild, this.targetChannelId);
    }
  }

  startHealthCheck() {
    if (this.healthInterval) clearInterval(this.healthInterval);
    this.healthInterval = setInterval(() => this.checkHealth(), config.voiceHealthCheckInterval);
  }

  handleVoiceStateUpdate(oldState, newState) {
    if (!this.currentGuildId || !this.targetChannelId) return;
    if (newState.guild.id !== this.currentGuildId) return;

    const botId = this.client.user.id;
    const botNewState = newState.member.id === botId ? newState : null;

    if (botNewState && !botNewState.channelId) {
      logger.warn('Bot was disconnected or kicked from voice channel. Health check will rejoin.');
      const guild = this.client.guilds.cache.get(this.currentGuildId);
      if (guild) this.join(guild, this.targetChannelId);
    } else if (botNewState && botNewState.channelId && botNewState.channelId !== this.targetChannelId) {
      logger.warn(`Bot moved to different channel (${botNewState.channelId}). Rejoining target channel.`);
      const guild = this.client.guilds.cache.get(this.currentGuildId);
      if (guild) this.join(guild, this.targetChannelId);
    }
  }
}

module.exports = VoiceManager;
