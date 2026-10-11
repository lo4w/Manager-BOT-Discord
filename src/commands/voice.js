const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const { createSuccessCard, createErrorCard, createCard } = require('../components/v2');
const logger = require('../utils/logger');

module.exports = {
  name: 'voice',
  aliases: ['247', 'v247'],
  description: 'Manage 24/7 Voice connection',
  guildOnly: true,
  permissions: [PermissionFlagsBits.ManageGuild],

  async execute(message, args, client) {
    const sub = args[0] ? args[0].toLowerCase() : 'status';
    const connection = getVoiceConnection(message.guild.id);

    if (sub === 'status') {
      const isConnected = !!connection;
      const channelId = connection ? connection.joinConfig.channelId : null;
      const currentChannel = channelId ? message.guild.channels.cache.get(channelId) : null;

      const fields = [
        {
          name: 'Connection State',
          value: isConnected ? `Connected (${connection.state.status})` : 'Disconnected'
        },
        {
          name: 'Current Voice Channel',
          value: currentChannel ? `<#${currentChannel.id}> (${currentChannel.name})` : (channelId ? `<#${channelId}>` : 'None')
        },
        {
          name: '24/7 Auto-Reconnect Target',
          value: client.voiceManager && client.voiceManager.targetChannelId
            ? `<#${client.voiceManager.targetChannelId}>`
            : 'Not configured in environment'
        }
      ];

      const card = createCard({
        title: 'Voice Connection Status',
        description: 'Current 24/7 Voice Client health status.',
        fields
      });

      return message.reply({
        components: [card],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (sub === 'join') {
      const member = message.member;
      const voiceChannel = member.voice ? member.voice.channel : null;

      if (!voiceChannel) {
        const errorCard = createErrorCard('Voice Join Failed', 'You must be in a voice channel to run `.voice join`.');
        return message.reply({
          components: [errorCard],
          flags: MessageFlags.IsComponentsV2
        });
      }

      if (!client.voiceManager) {
        const errorCard = createErrorCard('Voice Error', 'Voice manager is not initialized.');
        return message.reply({
          components: [errorCard],
          flags: MessageFlags.IsComponentsV2
        });
      }

      const joined = await client.voiceManager.join(message.guild, voiceChannel.id);
      if (joined) {
        client.voiceManager.targetChannelId = voiceChannel.id;
        const successCard = createSuccessCard(
          'Connected to Voice',
          `Manager BOT has connected to <#${voiceChannel.id}> with 24/7 persistence.`
        );
        return message.reply({
          components: [successCard],
          flags: MessageFlags.IsComponentsV2
        });
      } else {
        const errorCard = createErrorCard('Voice Join Failed', `Could not join channel <#${voiceChannel.id}>.`);
        return message.reply({
          components: [errorCard],
          flags: MessageFlags.IsComponentsV2
        });
      }
    }

    if (sub === 'leave') {
      if (!connection) {
        const errorCard = createErrorCard('Voice Leave Failed', 'The bot is not currently connected to any voice channel.');
        return message.reply({
          components: [errorCard],
          flags: MessageFlags.IsComponentsV2
        });
      }

      connection.destroy();
      if (client.voiceManager) {
        client.voiceManager.targetChannelId = null;
      }

      logger.info(`Voice connection destroyed by ${message.author.tag}`);

      const successCard = createSuccessCard(
        'Voice Disconnected',
        `Manager BOT has left the voice channel.`
      );

      return message.reply({
        components: [successCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const usageCard = createErrorCard('Voice Command Usage', 'Usage:\n`.voice status` - Show status\n`.voice join` - Join your voice channel\n`.voice leave` - Disconnect from voice');
    return message.reply({
      components: [usageCard],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
