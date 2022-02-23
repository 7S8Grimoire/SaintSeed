const { SlashCommandBuilder } = require('@discordjs/builders');
const i18next = require('i18next');
const database = require('../models');
const { Constants } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vrole')
		.setDescription('Voice role management')
		.addRoleOption(option => option
			.setName('role')
			.setDescription('Select a role')
			.setRequired(true)
		),
	async execute(interaction) {	
		const [ voiceRole, created ] = await database.VoiceRole.findOrCreate({
			where: {
				guild_id: interaction.guild.id,
				role_id: interaction.options.getRole('role').id,
			},
		});

		if (created) {
			interaction.reply("Voice level created successfully!");
		} else {
			interaction.reply("Voice level updated successfully!");
		}
	},
};