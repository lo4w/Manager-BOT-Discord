const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags
} = require('discord.js');
const config = require('../config');

function createCard({ title, subtitle, description, fields = [], thumbnail = null, footer = null, accentColor = config.accentColor, actionRows = [] }) {
  const container = new ContainerBuilder();
  if (accentColor !== null) {
    container.setAccentColor(accentColor);
  }

  if (title) {
    let headerText = `## __${title}__`;
    if (subtitle) {
      headerText += `\n-# ${subtitle}`;
    }
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(headerText)
    );
  }

  if (description) {
    if (title) {
      container.addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      );
    }

    if (thumbnail) {
      container.addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(description)
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(thumbnail)
          )
      );
    } else {
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(description)
      );
    }
  }

  if (fields.length > 0) {
    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );

    const formattedFields = fields.map(f => `**__${f.name}__**\n${f.value}`).join('\n\n');
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(formattedFields)
    );
  }

  if (footer) {
    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# ${footer}`)
    );
  }

  for (const row of actionRows) {
    container.addActionRowComponents(row);
  }

  return container;
}

function createSuccessCard(title, message, footer = 'Operation completed successfully') {
  return createCard({
    title,
    description: message,
    footer,
    accentColor: config.accentColor
  });
}

function createErrorCard(title, message, footer = 'System notification') {
  return createCard({
    title,
    description: message,
    footer,
    accentColor: config.accentColor
  });
}

function createMediaCard(title, imageUrl, extraText = null, footer = null) {
  const container = new ContainerBuilder().setAccentColor(config.accentColor);

  if (title) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## __${title}__`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
  }

  container.addMediaGalleryComponents(
    new MediaGalleryBuilder().addItems(
      new MediaGalleryItemBuilder().setURL(imageUrl).setDescription(title || 'Image')
    )
  );

  if (extraText) {
    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(extraText)
    );
  }

  if (footer) {
    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# ${footer}`)
    );
  }

  return container;
}

module.exports = {
  createCard,
  createSuccessCard,
  createErrorCard,
  createMediaCard
};
