const { Collection } = require("discord.js");
const { client } = require("./client");
const fs = require("fs");
const log = require("log-beautify");
const database = require("../models");
const i18next = require("i18next");

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
const commands = [];
client.commands = new Collection();

for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
	if (command.disabled) {
		continue;
	}
  if (command.raw) {
    commands.push(command.data);
  } else {
    commands.push(command.data.toJSON());
  }
  client.commands.set(command.data.name, command);
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  const isPowered = command.powerlist?.includes(interaction.user.id);
  const isOwner = process.env.BOT_OWNERS.split(',').includes(interaction.user.id);

  const hasPowerPermissions = isPowered || isOwner;

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
