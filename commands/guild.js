const { SlashCommandBuilder } = require('@discordjs/builders');
const { Guild } = require("../modules/database");
const i18next = require('i18next');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('guild')
		.setDescription('Manage guild')
		.addSubcommand((subcommand) =>
			subcommand
				.setName("alert")
				.setDescription("Set alert channel (0 - remove)")
				.addStringOption((option) =>
					option
						.setName("channel_id")
						.setDescription("The text channel id")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("roulette")
				.setDescription("Set roulette channel (0 - remove)")
				.addStringOption((option) =>
					option
						.setName("channel_id")
						.setDescription("The text channel id")
						.setRequired(true)
				)
		),
	async execute(interaction) {
		let [ guild ] = await Guild.findOrCreate({ where: { guild_id: interaction.guild.id } });		
		if (interaction.options.getSubcommand() === "alert") {
			const channel_id = interaction.options.getString("channel_id");
			if (channel_id == '0') {
				guild.alert_channel_id = null;
				await guild.save();
				interaction.reply(`Guild settings saved successfully!`);
				return;
			}

			const channel = interaction.guild.channels.resolve(
				interaction.options.getString("channel_id")
			);
			if (!channel) {
				interaction.reply(`Сan't find the channel`);
				return;
			}
			
			if (!channel.isText()) {
				interaction.reply(`Сhannel "${channel.name}" is not text`);
				return;
			}
			
			
			guild.alert_channel_id = channel.id;
			await guild.save();			
		} else if (interaction.options.getSubcommand() === "roulette") {		
			const channel_id = interaction.options.getString("channel_id");
			if (channel_id == '0') {
				guild.roulette_channel_id = null;
				await guild.save();
				interaction.reply(`Guild settings saved successfully!`);
				return;
			}
			
			const channel = interaction.guild.channels.resolve(
				interaction.options.getString("channel_id")
			);
			if (!channel) {
				interaction.reply(`Сan't find the channel`);
				return;
			}
			if (!channel.isText()) {
				interaction.reply(`Сhannel "${channel.name}" is not text`);
				return;
			}

			guild.roulette_channel_id = channel.id;					
			await guild.save();
		}
		interaction.reply(`Guild settings saved successfully!`);
	},
};