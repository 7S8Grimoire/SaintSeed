const { Collection } = require("discord.js");
const { client } = require("./client");
const fs = require("fs");
const database = require("../models");
const i18next = require("i18next");

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
const commands = [];
client.commands = new Collection();

for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  /* Skip if command is disabled */
  if (command.disabled) {
    continue;
  }

  /* Check is command raw or builded */
  const data = command.raw ? command.data : command.data.toJSON();

  /* Set whitelist guilds */
  data.guilds_white_list = command.guilds_white_list;
  commands.push(data);
  client.commands.set(command.data.name, command);
}

client.on("interactionCreate", async (interaction) => {
  /* Check is interaction - command */
  if (!interaction.isCommand()) return;

  let command = null;
  /* Use slash command or context-menu-commands */
  /* And search command */
  if (interaction.isUserContextMenuCommand()) {
    command = client.userContextCommands.get(interaction.commandName);
  } else {
    command = client.commands.get(interaction.commandName);
  }

  /* If command not found, drop error */
  if (!command) {
    await interaction.reply({
      content: "Command not found",
      ephemeral: true,
    });
  }

  /* Check has user a power to use this commands */
  const isPowered = command.powerlist?.includes(interaction.user.id);
  const isOwner = process.env.BOT_OWNERS.split(',').includes(interaction.user.id);
  const hasPowerPermissions = isPowered || isOwner;

  /* Validate user permissions */
  if (command.permissions?.length && !hasPowerPermissions) {
    const hasPermission = interaction.member.permissions.has(
      command.permissions
    );
    if (!hasPermission) {
      await interaction.reply({
        content: i18next.t(`commands.noPermissions`),
        ephemeral: true,
      });
      return;
    }
  }

  /* Validate channel category */
  if (command.categories?.length && !hasPowerPermissions) {
    const commandAvailableChannels = await database.GuildChannel.findAll({
      where: {
        guild_id: interaction.guildId,
        category: command.categories,
      },
    });
    if (commandAvailableChannels.length) {
      const isCategorized = commandAvailableChannels.some(
        (channel) => channel.channel_id == interaction.channelId
      );
      const channelsReferences = commandAvailableChannels.map(
        (channel) => `<#${channel.channel_id}>`
      );
      if (!isCategorized) {
        await interaction.reply({
          content: i18next.t(`commands.incorrectCategoryChannel`, {
            channels: channelsReferences.join(i18next.t("commands.incorrectCategoryChannelOr")),
          }),
          ephemeral: true,
        });
        // await interaction.reply({ content: `Go here: ${channelsReferences.join(' or ')}`, ephemeral: true });
        return;
      }
    }
  }

  /* Catch execution error */
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

exports.commands = commands;
