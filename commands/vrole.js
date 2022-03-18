const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton } = require('discord.js');
const { Constants } = require('discord.js');

const i18next = require('i18next');
const database = require('../models');

const { paginationEmbed } = require('../modules/helpers');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vrole')
		.setDescription('Voice role management')
		.addSubcommand(subcommand => subcommand
			.setName('register')
			.setDescription('Register a new or update existing voice role')
			.addRoleOption(option => option
				.setName('role')
				.setDescription('Select a role')
				.setRequired(true)
			).addNumberOption(option => option
				.setName('add-on-level')
				.setDescription('Add on level')
				.setRequired(true)
			).addNumberOption(option => option
				.setName('remove-on-level')
				.setDescription('Remove on level')
				.setRequired(false)
			),
		)
		.addSubcommand(subcommand => subcommand
			.setName('list')
			.setDescription('Get list of voice rooms')
		).
		addSubcommand(subcommand => subcommand
			.setName('remove')
			.setDescription('Removes a voice role')
			.addRoleOption(option => option
				.setName('role')
				.setDescription('Select a role')
				.setRequired(true)
			)
		),
	async execute(interaction) {
		const subCommand = interaction.options.getSubcommand();
		const guild = interaction.guild;

		if (subCommand == 'register') {
			const [ vRole, created ] = await database.VoiceRole.findOrCreate({
				where: {
					guild_id: interaction.guild.id,
					role_id: interaction.options.getRole('role').id,
				},
			});
			
			if (created) {
				interaction.reply(i18next.t('vRole.created'));
			} else {
				vRole.conditions = {};
				vRole.conditions.addOnLevel = interaction.options.getNumber("add-on-level");
				vRole.conditions.removeOnLevel = interaction.options.getNumber("remove-on-level");
				vRole.save();
				interaction.reply(i18next.t('vRole.updated'));
			}
		}

		if (subCommand === 'remove') {
			await database.VoiceRole.destroy({
				where: {
					guild_id: interaction.guild.id,
					role_id: interaction.options.getRole('role').id,
				}
			});

			interaction.reply(i18next.t('vRole.deleted'));
		}

		if (subCommand === 'list') {
			const vRoles = await database.VoiceRole.findAll({
				where: {
					guild_id: interaction.guild.id,					
				},
			});

			if (!vRoles.length) return interaction.reply(i18next.t('vRole.listEmpty'));

			const roles = guild.roles.cache.filter(role => {
				const vRole = vRoles.find(vRole => vRole.role_id == role.id);
				if (vRole) {
					role.vRole = vRole;
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
			


				roles.forEach(role => {
				pageInfo += `[${seqNumber++}] ${role.name} | +(${role.vRole.conditions?.addOnLevel}) -(${role.vRole.conditions?.removeOnLevel ?? 'n'}) \n`;
				if (seqNumber > 10) {
					const vRoleEmbed = new MessageEmbed()
						.setColor(process.env.EMBED_PRIMARY_COLOR)
						.setTitle(i18next.t('vRole.listTitle'))
						.setDescription(pageInfo);
					pages.push(vRoleEmbed);
					seqNumber = 1;
					pageInfo = "";
				}
			});

			if (pageInfo) {
				const vRoleEmbed = new MessageEmbed()
						.setColor(process.env.EMBED_PRIMARY_COLOR)
						.setTitle(i18next.t('vRovRoleom.listTitle'))
						.setDescription(pageInfo);
				pages.push(vRoleEmbed);
			}
			
			paginationEmbed(interaction, pages, [previousBtn, nextBtn]);
		}
	},
};