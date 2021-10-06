const { SlashCommandBuilder } = require('@discordjs/builders');
const i18next = require('i18next');
const { api } = require('../modules/api');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Get user info'),
	async execute(interaction) {        
		await api.get(`https://vp.thejebforge.com/profile/240492317679550465/${interaction.user.id}`, {})
        .then(({ data }) => {
            console.log(data);
        }).catch(async err => {
            console.error(err);
        });
        await interaction.reply(i18next.t('info?'));
	},
};