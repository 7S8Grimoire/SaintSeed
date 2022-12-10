import { Command } from './../types/index.d';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import i18next from 'i18next';
import client from '../modules/client';
import moment from 'moment';
import _ from 'lodash';

const botName = _.upperFirst(_.toLower(process.env.BOT_PERSONALITY));

export default {	
	// categories: ["command_spam", "roulette"],
	data: new SlashCommandBuilder()
		.setName(_.toLower(process.env.BOT_PERSONALITY))
		.setDescription(`Get info about ${botName}!`)
		.toJSON(),
	async execute(interaction) {		
		const botInfoEmbed = new EmbedBuilder()
        .setColor("#580ad6")
        .setThumbnail(interaction.client.user.displayAvatarURL({ extension: 'png' }))
        .setTitle(botName)        
		const readyAt = client.readyAt;
    botInfoEmbed.addFields(
			{ name: 'Version', value: process.env.BOT_VERSION, inline: true },
			{ name: 'Started at', value: moment(readyAt).format('DD-MM-YYYY HH:mm'), inline: true },
			{ name: 'About', value: `I am not evil and not good, I am unlabeled, I am who I am` },
		);

		await interaction.reply({
			embeds: [botInfoEmbed]
		});
	},
} as Command;