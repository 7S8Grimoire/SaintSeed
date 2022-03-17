const { SlashCommandBuilder } = require('@discordjs/builders');
const i18next = require('i18next');
const database = require('../models');
const { Constants } = require('discord.js');
const { MessageEmbed } = require('discord.js');

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
				name: 'info',
				description: "Get info about voice room",				
				type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
				options: [
					{
						name: 'channel',
						description: "Select a channel",
						required: true,
						type: Constants.ApplicationCommandOptionTypes.CHANNEL,
						channel_types: [ Constants.ChannelTypes.GUILD_VOICE ]
					},
				]
			},

			{
				name: 'list',
				description: "Get list of voice rooms",				
				type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
			},

			{
				name: 'register',
				description: "Register a new or update existing voice room",				
				type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
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
					},
				]
			},

			{
				name: 'remove',
				description: "Removes a voice room",				
				type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
				options: [
					{
						name: 'channel',
						description: "Select a channel",
						required: true,
						type: Constants.ApplicationCommandOptionTypes.CHANNEL,
						channel_types: [ Constants.ChannelTypes.GUILD_VOICE ]
					},
				]
			},
		]
	},
	async execute(interaction) {
		const subCommand = interaction.options.getSubcommand();

		if (subCommand === 'register') {
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
				interaction.reply(i18next.t('vRoom.created'));
			} else {
				voiceRoom.xp_per_tick = interaction.options.getNumber("experience");
				voiceRoom.save();
				interaction.reply(i18next.t('vRoom.updated'));
			}
		}

		if (subCommand === 'remove') {
			await database.VoiceRoom.destroy({
				where: {
					channel_id: interaction.options.getChannel("channel").id,
				}
			});

			interaction.reply(i18next.t('vRoom.deleted'));
		}

		if (subCommand === 'info') {
			const channel = interaction.options.getChannel("channel");
			const vRoom = await database.VoiceRoom.findOne({ where: { channel_id: channel.id } });

			const vRoomEmbed = new MessageEmbed()
				.setColor(process.env.EMBED_PRIMARY_COLOR)
				.setTitle(channel.name);

			vRoomEmbed.addField('Visitor count', channel.members.size.toString());

			if (vRoom) {
				vRoomEmbed.addField('Experience per tick', vRoom.xp_per_tick.toString());
			}
			
				

			interaction.reply({ embeds: [vRoomEmbed] });
		}

		if (subCommand === 'list') {
			interaction.reply(i18next.t('tipo list'));
		}

	},
};