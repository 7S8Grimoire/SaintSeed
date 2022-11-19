const { SlashCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandOptionType, ChannelType } = require('discord.js');
const { PermissionFlagsBits, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');

const i18next = require('i18next');
const database = require('../models');
// const paginationEmbed = require('discordjs-button-pagination');
const { paginationEmbed } = require('../modules/helpers');

const previousBtn = new ButtonBuilder()
	.setCustomId('previousbtn')
	.setLabel(i18next.t('pagination.prev'))
	.setStyle(ButtonStyle.Secondary);

const nextBtn = new ButtonBuilder()
	.setCustomId('nextbtn')
	.setLabel(i18next.t('pagination.next'))
	.setStyle(ButtonStyle.Secondary);
			

module.exports = {
	raw: true,
	permissions: [ PermissionFlagsBits.Administrator ],
	categories: ["command_spam"],
	data: {
		name: "vroom",
		description: "Voice room management",
		options: [
			{
				name: 'info',
				description: "Get info about voice room",				
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'channel',
						description: "Select a channel",
						required: true,
						type: ApplicationCommandOptionType.Channel,
						channel_types: [ ChannelType.GuildVoice ]
					},
				]
			},

			{
				name: 'list',
				description: "Get list of voice rooms",				
				type: ApplicationCommandOptionType.Subcommand,
			},

			{
				name: 'register',
				description: "Register a new or update existing voice room",
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'channel',
						description: "Select a channel",
						required: true,
						type: ApplicationCommandOptionType.Channel,
						channel_types: [ ChannelType.GuildVoice ]
					},

					{
						name: 'experience',
						description: "Experience per tick",
						required: true,
						type: ApplicationCommandOptionType.Number,				
					},
				]
			},

			{
				name: 'remove',
				description: "Removes a voice room",
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'channel',
						description: "Select a channel",
						required: true,
						type: ApplicationCommandOptionType.Channel,
						channel_types: [ ChannelType.GuildVoice ]
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

			const vRoomEmbed = new EmbedBuilder()
				.setColor(process.env.EMBED_PRIMARY_COLOR)
				.setTitle(channel.name);

			vRoomEmbed.addFields({ name: i18next.t('vRoom.visitorCount'), value: channel.members.size.toString() });

			if (vRoom) {
				vRoomEmbed.addFields({ name: i18next.t('vRoom.xpPerTick'),  value: vRoom.xp_per_tick.toString() });
			} else {
				vRoomEmbed.setDescription(i18next.t('vRoom.notPartOfSystem'));
			}
			
				

			interaction.reply({ embeds: [vRoomEmbed] });
		}

		if (subCommand === 'list') {
			
			const vRooms = await database.VoiceRoom.findAll({ where: { guild_id: guild.id  }, raw: true, nest: true, });

			let pageItemCount = 1;
			let pageInfo = "";
			let pages = [];

			vRooms.forEach((vRoom, index) => {
				const channel = guild.channels.cache.get(vRoom.channel_id);
				if (!channel) return;

				pageInfo += `[**${index+1}**] ${channel.name} | XP: ${vRoom.xp_per_tick} \n`;
				pageItemCount++;

				if (pageItemCount > 10 || index == vRooms.length-1) {
					const vRoomEmbed = new EmbedBuilder()
						.setColor(process.env.EMBED_PRIMARY_COLOR)
						.setTitle(i18next.t('vRoom.listTitle'))
						.setDescription(pageInfo);
					pages.push(vRoomEmbed);
					pageItemCount = 1;
					pageInfo = "";
				}
			});

			if (!pages.length) return interaction.reply(i18next.t('vRoom.listEmpty'));
			
			paginationEmbed(interaction, pages);
		}

	},
};