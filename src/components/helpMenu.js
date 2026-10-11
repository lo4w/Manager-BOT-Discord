const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} = require('discord.js');
const { createCard } = require('./v2');

const CATEGORIES = {
  general: {
    label: 'General',
    description: 'General utilities, information, and profile tools',
    commands: [
      { name: '.ping', desc: 'Check bot latency and gateway heartbeat' },
      { name: '.avatar [@user]', desc: 'Display user avatar in high resolution' },
      { name: '.banner [@user]', desc: 'Display user profile banner in high resolution' },
      { name: '.userinfo [@user]', desc: 'Detailed user account and server member profile' },
      { name: '.serverinfo', desc: 'Server statistics, channels, counts, and owner' },
      { name: '.servericon', desc: 'Display high resolution server icon' },
      { name: '.serverbanner', desc: 'Display server banner if configured' },
      { name: '.membercount', desc: 'Display total members, humans, and bots count' },
      { name: '.channelinfo [#channel]', desc: 'Detailed channel statistics and configuration' },
      { name: '.roles', desc: 'Display server roles list and hierarchy structure' },
      { name: '.uptime', desc: 'Display current continuous bot uptime' },
      { name: '.botinfo', desc: 'Manager BOT statistics, uptime, and system status' },
      { name: '.help [category]', desc: 'Display interactive menu with all commands and guides' }
    ]
  },
  moderation: {
    label: 'Moderation',
    description: 'Administration, member enforcement, and channel security',
    commands: [
      { name: '.ban <@user> [reason]', desc: 'Permanently ban a member from the server' },
      { name: '.kick <@user> [reason]', desc: 'Kick a member from the server' },
      { name: '.timeout <@user> <duration> [reason]', desc: 'Timeout a member (e.g. 10m, 2h, 1d)' },
      { name: '.untimeout <@user> [reason]', desc: 'Remove timeout status from a member' },
      { name: '.clear <amount>', desc: 'Bulk purge up to 100 messages from text channel' },
      { name: '.lock [reason]', desc: 'Lock the current channel to prevent members from typing' },
      { name: '.unlock [reason]', desc: 'Unlock the current channel allowing members to send messages' },
      { name: '.hide [reason]', desc: 'Hide channel from standard members visibility' },
      { name: '.unhide [reason]', desc: 'Reveal channel to standard members visibility' },
      { name: '.slowmode <duration>', desc: 'Configure channel slowmode rate limit' },
      { name: '.nuke', desc: 'Duplicate and recreate channel with identical permissions' },
      { name: '.role <@user> <@role>', desc: 'Add or remove role from a member' },
      { name: '.nick <@user> [name]', desc: 'Change or reset member nickname' },
      { name: '.settopic <topic>', desc: 'Update topic description of current channel' }
    ]
  },
  communication: {
    label: 'Administration & Broadcast',
    description: 'Announcements, official broadcasts, and community polls',
    commands: [
      { name: '.say <message>', desc: 'Broadcast a plain text message to the channel (Admin only)' },
      { name: '.saycon [title |] <message>', desc: 'Broadcast message in white Components V2 container (Admin only)' },
      { name: '.poll <question> [| opt1 | opt2]', desc: 'Create a formal Components V2 poll (Staff only)' }
    ]
  },
  voice: {
    label: 'Voice 24/7 & Voice Moderation',
    description: '24/7 voice persistence and voice channel moderation',
    commands: [
      { name: '.voice status', desc: 'Show current 24/7 voice connection details' },
      { name: '.voice join', desc: 'Connect the bot to your current voice channel' },
      { name: '.voice leave', desc: 'Disconnect the bot from the current voice channel' },
      { name: '.vmute <@user> [reason]', desc: 'Server mute member in voice' },
      { name: '.vunmute <@user> [reason]', desc: 'Server unmute member in voice' },
      { name: '.vkick <@user> [reason]', desc: 'Disconnect member from voice channel' },
      { name: '.vdeafen <@user> [reason]', desc: 'Server deafen member in voice' },
      { name: '.vundeafen <@user> [reason]', desc: 'Server undeafen member in voice' },
      { name: '.vmove <@user> <channelID>', desc: 'Move member to target voice channel' }
    ]
  }
};

function buildHelpSelectMenu(selectedCategory = null, disabled = false) {
  const select = new StringSelectMenuBuilder()
    .setCustomId('help_category_select')
    .setPlaceholder(disabled ? 'Menu expired (Returned to Home Panel)' : 'Select a command category...')
    .setDisabled(disabled);

  for (const [key, cat] of Object.entries(CATEGORIES)) {
    const option = new StringSelectMenuOptionBuilder()
      .setLabel(cat.label)
      .setValue(key)
      .setDescription(cat.description);

    if (selectedCategory === key) {
      option.setDefault(true);
    }

    select.addOptions(option);
  }

  return new ActionRowBuilder().addComponents(select);
}

function buildMainHelpCard(disabled = false) {
  const fields = [
    {
      name: 'Command Categories',
      value: '- **General:** `13 commands`\n- **Moderation:** `14 commands`\n- **Administration & Broadcast:** `3 commands`\n- **Voice 24/7 & Moderation:** `9 commands`'
    }
  ];

  const menuRow = buildHelpSelectMenu(null, disabled);

  return createCard({
    title: 'Manager BOT — Command Center',
    subtitle: 'High-performance Discord Management Bot',
    description: '### System Navigation\nSelect any category from the dropdown menu below or type `.help <category>` to inspect command parameters.',
    fields,
    footer: disabled ? 'Menu session closed • Showing Home Panel' : 'Use prefix "." before each command name • Active for 2 minutes',
    actionRows: disabled ? [] : [menuRow]
  });
}

function buildCategoryHelpCard(categoryKey, disabled = false) {
  const cat = CATEGORIES[categoryKey];
  if (!cat) return buildMainHelpCard(disabled);

  const commandList = cat.commands.map(cmd => `- **\`${cmd.name}\`**\n  -# ${cmd.desc}`).join('\n\n');

  const fields = [
    {
      name: `${cat.label} Commands (${cat.commands.length})`,
      value: commandList
    }
  ];

  const menuRow = buildHelpSelectMenu(categoryKey, disabled);

  return createCard({
    title: `Help Center — ${cat.label}`,
    subtitle: cat.description,
    description: `### Category Commands\nDetailed syntax and parameter guide for all commands under **${cat.label}**.`,
    fields,
    footer: disabled ? 'Menu session closed • Showing Home Panel' : 'Use prefix "." before each command name • Active for 2 minutes',
    actionRows: disabled ? [] : [menuRow]
  });
}

module.exports = {
  CATEGORIES,
  buildMainHelpCard,
  buildCategoryHelpCard,
  buildHelpSelectMenu
};
