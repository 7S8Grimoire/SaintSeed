const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const i18next = require('i18next');

const botName = _.upperFirst(_.toLower(process.env.BOT_PERSONALITY));

module.exports = {	
	// categories: ["command_spam", "roulette"],
	data: new SlashCommandBuilder()
		.setName(_.toLower(process.env.BOT_PERSONALITY))
		.setDescription(`Get info about ${botName}!`),
	async execute(interaction) {
		const botInfoEmbed = new MessageEmbed()
        .setColor("#580ad6")
        .setThumbnail(interaction.client.user.displayAvatarURL({ format: 'png' }))
        .setTitle(botName)        

    botInfoEmbed.addField('Version', process.env.BOT_VERSION, true);
    botInfoEmbed.addField('Launched at', botLaunchedAt, true);
    botInfoEmbed.addField('Baked with', 'ଘ(੭˃ᴗ˂)💜', true);        

		await interaction.reply({
			embeds: [botInfoEmbed]
		});
	},
};