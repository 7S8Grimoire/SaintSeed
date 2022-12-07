const { SlashCommandBuilder } = require('discord.js');
const database = require("../models");
const i18next = require("i18next");
const { 
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits
} = require("discord.js");

module.exports = {
	raw: true,
  // ["command_spam", "alert", "roulette"],
  permissions: [ PermissionFlagsBits.Administrator ],
  categories: ["command_spam"],
  data: {
    name: "register",
    description: "Register guild in system",
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "server",
        description: "register a server to system",
        options: [],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "text-channel",
        description: "register a text channel to specific type",
        options: [
          {
            type: ApplicationCommandOptionType.Channel,
						channel_types: [ ChannelType.GuildText ],
            name: "channel",
            description: "Choose a channel",
            required: true,
          },
          {
            type: ApplicationCommandOptionType.String,
            name: "channel-category",
            description: "Choose a channel category",
            required: true,
            choices: [
              {
                name: "alert",
                value: "alert",
              },
              {
                name: "roulette",
                value: "roulette",
              },
              {
                name: "command spam",
                value: "command_spam",
              },
            ],
          },
					{
						type: ApplicationCommandOptionType.Boolean,
						name: 'channel-remove',
						description: 'Remove this channel from selected category',
						required: false,
					}
        ],
      },
    ],
  },
  async execute(interaction) {
		const subCommand = interaction.options.getSubcommand();
    const [guild, created] = await database.Guild.findOrCreate({
      where: {
        guild_id: interaction.guild.id,
      },
    });

		if (subCommand == 'server') {
			if (created) {
				interaction.reply(i18next.t("guild.registered.success"));
			} else {
				interaction.reply(i18next.t("guild.registered.already"));
			}
		}

		if (subCommand == 'text-channel') {
			const channel = interaction.options.getChannel('channel');
			const channel_category = interaction.options.getString('channel-category');
			const channel_remove = interaction.options.getBoolean('channel-remove');

			if (!channel_remove) {
				database.GuildChannel.findOrCreate({
					where: {
						guild_id: interaction.guild.id,
						channel_id: channel.id,
						category: channel_category,
					},
				});

				interaction.reply(i18next.t("guild.textChannel.registered", { category: channel_category }));
			} else {
				database.GuildChannel.destroy({
					where: {
						guild_id: interaction.guild.id,
						channel_id: channel.id,
						category: channel_category,
					}
				});

				interaction.reply(i18next.t("guild.textChannel.removed", { category: channel_category }));
			}
		}
  },
};
