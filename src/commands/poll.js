const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  MessageFlags
} = require('discord.js');
const { createCard, createErrorCard } = require('../components/v2');
const { parseDuration, formatDuration } = require('../utils/time');

const activePolls = new Map();

function buildPollCard(poll, closed = false) {
  const totalVotes = Object.values(poll.votes).reduce((sum, count) => sum + count, 0);

  let description = `### ${poll.question}\n\n`;

  if (!closed) {
    description += poll.options.map((opt, i) => {
      const count = poll.votes[i] || 0;
      const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      return `- **Option ${i + 1}:** \`${opt}\` — **${count} votes** (${pct}%)`;
    }).join('\n');
  } else {
    description += `**__Final Poll Results__**\n`;
    description += poll.options.map((opt, i) => {
      const count = poll.votes[i] || 0;
      const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      return `- **Option ${i + 1}:** \`${opt}\` — **${count} votes** (${pct}%)`;
    }).join('\n');
    description += `\n**Total Participants:** \`${totalVotes}\``;
  }

  const buttons = poll.options.map((opt, i) =>
    new ButtonBuilder()
      .setCustomId(`poll_vote_${i}`)
      .setLabel(`Option ${i + 1}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(closed)
  );

  const actionRows = [];
  for (let i = 0; i < buttons.length; i += 5) {
    actionRows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
  }

  const endTimestamp = Math.floor(poll.endsAt / 1000);
  const footerText = closed
    ? 'Poll closed • Voting concluded'
    : `Poll closes <t:${endTimestamp}:R> • One vote per member`;

  return createCard({
    title: closed ? 'Community Poll — Concluded' : 'Community Poll',
    subtitle: `Created by ${poll.authorTag}`,
    description,
    footer: footerText,
    actionRows: closed ? [] : actionRows
  });
}

module.exports = {
  name: 'poll',
  description: 'Create a formal interactive Components V2 poll with buttons and duration',
  guildOnly: true,
  permissions: [PermissionFlagsBits.ManageMessages],

  async execute(message, args) {
    if (args.length === 0) {
      const errorCard = createErrorCard(
        'Usage Error',
        'Usage:\n`.poll <Duration> <Question>`\nor\n`.poll <Duration> <Question> | <Opt1> | <Opt2> | [Opt3]...`\n\nExamples:\n`.poll 5m Should we host an event?`\n`.poll 1h Game Night | Valorant | CS2 | GTA`'
      );
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const durationArg = args[0];
    const durationMs = parseDuration(durationArg);

    if (!durationMs || durationMs < 10000 || durationMs > 7 * 24 * 60 * 60 * 1000) {
      const errorCard = createErrorCard(
        'Invalid Duration',
        'Specify a duration between 10s and 7d as first argument.\nFormats: `1m`, `10m`, `2h`, `1d`.'
      );
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const raw = args.slice(1).join(' ').trim();
    if (!raw) {
      const errorCard = createErrorCard('Usage Error', 'Please provide a poll question.');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    let question = raw;
    let options = ['Yes', 'No'];

    if (raw.includes('|')) {
      const parts = raw.split('|').map(p => p.trim()).filter(Boolean);
      question = parts[0];
      options = parts.slice(1);
    }

    if (options.length < 2 || options.length > 10) {
      const errorCard = createErrorCard('Invalid Options', 'Polls require between 2 and 10 options.');
      return message.reply({
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const pollData = {
      question,
      options,
      authorTag: message.author.tag,
      authorId: message.author.id,
      endsAt: Date.now() + durationMs,
      votes: {},
      userVotes: new Map()
    };

    options.forEach((_, i) => {
      pollData.votes[i] = 0;
    });

    const card = buildPollCard(pollData, false);

    await message.delete().catch(() => null);

    const pollMessage = await message.channel.send({
      components: [card],
      flags: MessageFlags.IsComponentsV2
    });

    pollData.messageId = pollMessage.id;
    pollData.channelId = pollMessage.channel.id;
    activePolls.set(pollMessage.id, pollData);

    const timer = setTimeout(async () => {
      try {
        const p = activePolls.get(pollMessage.id);
        if (!p) return;
        activePolls.delete(pollMessage.id);

        const closedCard = buildPollCard(p, true);
        await pollMessage.edit({
          components: [closedCard],
          flags: MessageFlags.IsComponentsV2
        });
      } catch {}
    }, durationMs);

    pollData.timer = timer;
  },

  async handlePollButton(interaction) {
    const poll = activePolls.get(interaction.message.id);
    if (!poll) {
      return interaction.reply({
        content: 'This poll has already concluded.',
        ephemeral: true
      });
    }

    const match = interaction.customId.match(/^poll_vote_(\d+)$/);
    if (!match) return;

    const optionIndex = parseInt(match[1], 10);
    const userId = interaction.user.id;
    const previousVote = poll.userVotes.get(userId);

    if (previousVote === optionIndex) {
      return interaction.reply({
        content: `You already voted for Option ${optionIndex + 1}: \`${poll.options[optionIndex]}\`.`,
        ephemeral: true
      });
    }

    if (previousVote !== undefined) {
      poll.votes[previousVote] = Math.max(0, (poll.votes[previousVote] || 1) - 1);
    }

    poll.votes[optionIndex] = (poll.votes[optionIndex] || 0) + 1;
    poll.userVotes.set(userId, optionIndex);

    const updatedCard = buildPollCard(poll, false);

    await interaction.update({
      components: [updatedCard],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
