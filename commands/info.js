const { SlashCommandBuilder } = require('@discordjs/builders');
const { default: axios } = require('axios');
const i18next = require('i18next');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Get user info'),
	async execute(interaction) {
        console.log('info');
        api = axios.create({
            baseURL: process.env.REST_BASE_URL,    
            headers: {
                Authorization: process.env.REST_AUTHORIZATION,
                Cache: process.env.REST_CACHE
            }
        });
		await axios.get(`https://vp.thejebforge.com/profile/240492317679550465/240491981426393088`, {})
        .then(({ data }) => {
            console.log(data);
        }).catch(async err => {
            console.error(err);
        });
        await interaction.reply('info?');
	},
};