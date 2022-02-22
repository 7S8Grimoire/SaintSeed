const { SlashCommandBuilder } = require('@discordjs/builders');
const i18next = require('i18next');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('echo')
		.setDescription('Return info!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('server')
				.setDescription('Info about the server'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Info about a user')
				.addUserOption(option => option.setName('target').setDescription('The user'))
			),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'user') {
			const user = interaction.options.getUser('target');
			if (user) {
				await interaction.reply(`Username: ${user.username}\nID: ${user.id}`);
			} else {
				await interaction.reply(`Your username: ${interaction.user.username}\nYour ID: ${interaction.user.id}`);
			}
		} else if (interaction.options.getSubcommand() === 'server') {
			await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
		}
	},
};