const { SlashCommandBuilder } = require('@discordjs/builders');
const { Constants } = require('discord.js');
const { MessageEmbed, MessageButton } = require('discord.js');

const i18next = require('i18next');
const database = require('../models');
// const paginationEmbed = require('discordjs-button-pagination');
const { paginationEmbed } = require('../modules/helpers');

module.exports = {
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
		const guild = interaction.guild;

		if (subCommand === 'register') {
			const [ voiceRoom, created ] = await database.VoiceRoom.findOrCreate({
				where: {
					guild_id: guild.id,
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

			vRoomEmbed.addField(i18next.t('vRoom.visitorCount'), channel.members.size.toString());

			if (vRoom) {
				vRoomEmbed.addField(i18next.t('vRoom.xpPerTick'), vRoom.xp_per_tick.toString());
			} else {
				vRoomEmbed.setDescription(i18next.t('vRoom.notPartOfSystem'));
			}
			
				

			interaction.reply({ embeds: [vRoomEmbed] });
		}

		if (subCommand === 'list') {
			
			const vRooms = await database.VoiceRoom.findAll({ where: { guild_id: guild.id  }, raw: true,
				nest: true, });

			if (!vRooms.length) return interaction.reply(i18next.t('vRoom.listEmpty'));

			const channels = guild.channels.cache.filter(channel => {
				const vRoom = vRooms.find(vRoom => vRoom.channel_id == channel.id);
				if (vRoom) {
					channel.vRoom = vRoom;
					return true;
				}
			});
						
			let seqNumber = 1;
			let pageInfo = "";
			let pages = [];

			const previousBtn = new MessageButton()
				.setCustomId('previousbtn')
				.setLabel(i18next.t('pagination.prev'))
				.setStyle('SECONDARY');

			const nextBtn = new MessageButton()
				.setCustomId('nextbtn')
				.setLabel(i18next.t('pagination.next'))
				.setStyle('SECONDARY');
			
			channels.forEach(channel => {
				pageInfo += `[${seqNumber++}] ${channel.name} | XP: ${channel.vRoom.xp_per_tick} \n`;
				if (seqNumber > 10) {
					const vRoomEmbed = new MessageEmbed()
						.setColor(process.env.EMBED_PRIMARY_COLOR)
						.setTitle(i18next.t('vRoom.listTitle'))
						.setDescription(pageInfo);
					pages.push(vRoomEmbed);
					seqNumber = 1;
					pageInfo = "";
				}
			});

			if (pageInfo) {
				const vRoomEmbed = new MessageEmbed()
						.setColor(process.env.EMBED_PRIMARY_COLOR)
						.setTitle(i18next.t('vRoom.listTitle'))
						.setDescription(pageInfo);
				pages.push(vRoomEmbed);
			}
			
			paginationEmbed(interaction, pages, [previousBtn, nextBtn]);
		}

	},
};