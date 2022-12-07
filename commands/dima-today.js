const { SlashCommandBuilder, Collection, bold } = require('discord.js');
const { profiles } = require('../modules/api');
const i18next = require('i18next');
const dima_variants = require('../config/dima-variants.json');
const moment = require('moment');

module.exports = {	
	categories: ["command_spam"],
	guilds_white_list: [process.env.BREAD_BAKERY_ID],
	data: new SlashCommandBuilder()
		.setName('dima-today')
		.setDescription('Get what Dima you are today'),
	async execute(interaction) {
		const dimases_ids = process.env.DIMASES_IDS.split(',');
		if (!dimases_ids.includes(interaction.user.id)) {
			return await interaction.reply({
				content: "Сори, но ты не Димочка",
				ephemeral: true,
			})
		}
		await interaction.deferReply();
		const guild_id = interaction.guild.id
		const user_id = interaction.user.id
		let profile = await profiles.show(guild_id, user_id);
		const dima_today = _.sample(dima_variants);
		const now = moment();
		const last_dima_today = moment.unix(profile.data?.dima_today_at);
		if (!now.isSame(last_dima_today, 'day')) {
			profiles.add(guild_id, user_id, {
				data: {
					dima_today: dima_today,
					dima_today_at: now.unix(),
				}
			})
			await interaction.editReply({
				content: `Сегодня ты ${bold(dima_today)}`,
			});
		} else {
			await interaction.editReply({
				content: `Сегодня ты уже узнавал какой ты Дима - ты ${bold(profile.data.dima_today)}`,
			});
		}
	},
};