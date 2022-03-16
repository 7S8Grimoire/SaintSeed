const { SlashCommandBuilder } = require('@discordjs/builders');
const i18next = require('i18next');
const database = require('../models');
const { Constants } = require('discord.js');

module.exports = {
	// data: new SlashCommandBuilder()
	// 	.setName('dev')
	// 	.setDescription('Command for testing')
	// 	.addChannelOption(option => option
	// 		.setName('channel')
	// 		.setDescription('Select a channel')
	// 		.setRequired(true)
	// 	)
	// 	,
	raw: true,
	data: {
		name: "vroom",
		description: "Voice room management",
		options: [
			{
				name: 'channel',
				description: "Select a channel",
				required: true,
				type: Constants.ApplicationCommandOptionTypes.CHANNEL,
				channel_types: [ Constants.ChannelTypes.GUILD_VOICE ]
			},

			{
				name: 'experience',
				description: "Experience per tick",
				required: true,
				type: Constants.ApplicationCommandOptionTypes.NUMBER,				
			}
		]
	},
	async execute(interaction) {
		const [ voiceRoom, created ] = await database.VoiceRoom.findOrCreate({
			where: {
				guild_id: interaction.guild.id,
				channel_id: interaction.options.getChannel("channel").id,
			},
			defaults: {
				xp_per_tick: interaction.options.getNumber("experience"),
			}
		});	
		

		if (created) {
			interaction.reply("Created new voice room!");
		} else {
			voiceRoom.xp_per_tick = interaction.options.getNumber("experience");
			voiceRoom.save();
			interaction.reply("Updated voice room!");
		}
		

	},
};