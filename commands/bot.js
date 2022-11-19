const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const i18next = require('i18next');

const botName = _.upperFirst(_.toLower(process.env.BOT_PERSONALITY));

module.exports = {	
	// categories: ["command_spam", "roulette"],
	data: new SlashCommandBuilder()
		.setName(_.toLower(process.env.BOT_PERSONALITY))
		.setDescription(`Get info about ${botName}!`),
	async execute(interaction) {
		const botInfoEmbed = new EmbedBuilder()
        .setColor("#580ad6")
        .setThumbnail(interaction.client.user.displayAvatarURL({ format: 'png' }))
        .setTitle(botName)        

    botInfoEmbed.addFields(
			{ name: 'Version', value: process.env.BOT_VERSION, inline: true },
			{ name: 'Launched at', value: botLaunchedAt, inline: true },
			{ name: 'Baked with', value: 'ଘ(੭˃ᴗ˂)💜', inline: true },
		);

		await interaction.reply({
			embeds: [botInfoEmbed]
		});
	},
};