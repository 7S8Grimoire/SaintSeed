import { Command } from "./../types/index.d";
import {
	SlashCommandBuilder,
	Collection,
	bold,
	strikethrough,
	EmbedBuilder,
} from "discord.js";
import { profiles } from "../modules/api";
import i18next from "i18next";
import dima_variants from "../config/dima-variants.json";
import moment from "moment";
import _ from "lodash";

export default {
	categories: ["command_spam"],
	guilds_white_list: [process.env.BREAD_BAKERY_ID],
	data: new SlashCommandBuilder()
		.setName("dima-today")
		.setDescription("Get what Dima you are today")
		.toJSON(),
	async execute(interaction) {
		const dimases_ids = process.env.DIMASES_IDS.split(",");
		if (!dimases_ids.includes(interaction.user.id)) {
			return await interaction.reply({
				content: "Сори, но ты не Димочка",
				ephemeral: true,
			});
		}
		await interaction.deferReply();
		const guild_id = interaction.guild.id;
		const user_id = interaction.user.id;
		const embed = new EmbedBuilder().setTitle("Сегодня ты...");
		
		let profile = await profiles.show(guild_id, user_id);
		const now = moment();
		const last_dima_today = moment.unix(profile.data?.dima_today_at);

		if (!now.isSame(last_dima_today, "day")) {
			const dima_variant = _.sample(dima_variants);			

			let dima_today = `${strikethrough("Н")}Дикто`;
			let gif = null;

			if (typeof dima_variant === "string") {
				dima_today = dima_variant;
			} else {
				dima_today = dima_variant.value;
				gif = _.sample(dima_variant.gifs);
			}

			profiles.add(guild_id, user_id, {
				data: {
					dima_today: dima_today,
					dima_today_at: now.unix(),
					dima_today_gif: gif,
				},
			});

			embed.setDescription(dima_today);

			if (gif) {				
				embed.setImage(gif);
			}

			await interaction.editReply({
				embeds: [embed],
			});
		} else {
			embed.setDescription(
				`узнавал какой ты Дима - ты ${bold(profile.data.dima_today)}`
			);

			if (profile.data.dima_today_gif) {
				embed.setImage(profile.data.dima_today_gif);
			}
			await interaction.editReply({
				embeds: [embed],
			});
		}
	},
} as Command;
