const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../models');
const i18next = require('i18next');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register guild in system'),
	async execute(interaction) {

		const [ guild, created ] = await database.Guild.findOrCreate({
			where: {
				guild_id: interaction.guild.id,
			},
		});

		if (created) {
			// interaction.reply(i18next.t("Your guild has been registered successfully!"));
			interaction.reply(i18next.t('guild.registered.success'));
		} else {
			// interaction.reply(i18next.t("Your guild is already registered!"));
			interaction.reply(i18next.t('guild.registered.already'));
		}
	},
};