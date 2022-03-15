const { SlashCommandBuilder } = require('@discordjs/builders');
const i18next = require('i18next');

module.exports = {	
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	categories: ["commands"],
	async execute(interaction) {
		await interaction.reply(i18next.t('Pong!'));
	},
};