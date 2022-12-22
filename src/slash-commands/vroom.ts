import { Command } from './../types/index.d';
import { 
	PermissionFlagsBits, ButtonBuilder, EmbedBuilder,
	ButtonStyle, ApplicationCommandOptionType, ChannelType
} from 'discord.js';

import i18next from 'i18next';
import database from '../modules/database';
import { paginationEmbed } from '../helpers';
			
export default {
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
			const [ voiceRoom, created ] = await database.models['VoiceRoom'].findOrCreate({
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
			await database.models['VoiceRoom'].destroy({
				where: {
					channel_id: interaction.options.getChannel("channel").id,
				}
			});

			interaction.reply(i18next.t('vRoom.deleted'));
		}

		if (subCommand === 'info') {
			const channel = interaction.guild.channels.cache.get(interaction.options.getChannel("channel").id);
			const vRoom = await database.models['VoiceRoom'].findOne({ where: { channel_id: channel.id } });

			const vRoomEmbed = new EmbedBuilder()
				.setColor(`#${process.env.EMBED_PRIMARY_COLOR}`)
				.setTitle(channel.name);

			if (channel.type != ChannelType.GuildVoice) return;
			vRoomEmbed.addFields({ name: i18next.t('vRoom.visitorCount'), value: channel.members.size.toString() });

			if (vRoom) {
				vRoomEmbed.addFields({ name: i18next.t('vRoom.xpPerTick'),  value: vRoom.xp_per_tick.toString() });
			} else {
				vRoomEmbed.setDescription(i18next.t('vRoom.notPartOfSystem'));
			}
			
				

			interaction.reply({ embeds: [vRoomEmbed] });
		}

		if (subCommand === 'list') {
			
			const vRooms = await database.models['VoiceRoom'].findAll({ where: { guild_id: guild.id  }, raw: true, nest: true, });

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
						.setColor(`#${process.env.EMBED_PRIMARY_COLOR}`)
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
} as Command;