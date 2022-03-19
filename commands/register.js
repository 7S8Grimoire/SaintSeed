const { SlashCommandBuilder } = require("@discordjs/builders");
const database = require("../models");
const i18next = require("i18next");
const { Constants } = require("discord.js");

// let data = new SlashCommandBuilder()
// .setName('register')
// .setDescription('Register guild in system')
// .addSubcommand(subcommand => subcommand
// 	.setName('server')
// 	.setDescription('register a server to system')
// )
// .addSubcommand(subcommand => subcommand
// 	.setName('text-channel')
// 	.setDescription('register a text channel to specific type')
// 	.addChannelOption(option => option
// 		.setName('channel')
// 		.setDescription('Choose a channel')
// 		.setRequired(true)
// 	)
// 	.addStringOption(option => option
// 		.setName('channel-category')
// 		.setDescription('Choose a channel type')
// 		.setRequired(true)
// 		.addChoice('alert', 'alert')
// 		.addChoice('roulette', 'roulette')
// 		.addChoice('command spam', 'command_spam')
// 	)

// ).toJSON();

// console.log(JSON.stringify(data));
module.exports = {
	raw: true,
  data: {
    name: "register",
    description: "Register guild in system",
    options: [
      {
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: "server",
        description: "register a server to system",
        options: [],
      },
      {
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: "text-channel",
        description: "register a text channel to specific type",
        options: [
          {
            type: Constants.ApplicationCommandOptionTypes.CHANNEL,
						channel_types: [ Constants.ChannelTypes.GUILD_TEXT ],
            name: "channel",
            description: "Choose a channel",
            required: true,
          },
          {
            type: Constants.ApplicationCommandOptionTypes.STRING,
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
						type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
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
