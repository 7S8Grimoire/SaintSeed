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
		name: "dev",
		description: "test",
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
		const [ newChannel ] = await database.VoiceRoom.findOrCreate({
			where: {
				guildId: interaction.guild.id,
				roomId: interaction.options.getChannel("channel").id,
			}			
		});

		newChannel.xpPerTick = interaction.options.getNumber("experience");
		await newChannel.save();

		interaction.reply(newChannel.roomId);
	},
};