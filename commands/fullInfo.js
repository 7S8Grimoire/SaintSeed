const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { api, profiles } = require('../modules/api');
const i18next = require('i18next');
const moment = require("moment");
const momentRandom = require('moment-random');

module.exports = {
    categories: ["command_spam", "roulette"],
	data: new SlashCommandBuilder()
		.setName('fullinfo')
		.setDescription('Get user full info')
        .addUserOption(option => option
            .setName('user')
            .setDescription('Select a user which info you need to see')
            .setRequired(false)
        ),
	async execute(interaction) {
        const user = interaction.options.getUser('user') ?? interaction.user;
        const profile = await profiles.show(interaction.guild.id, user.id);

        if (!profile) return;

        if (!profile.text) {
            profile.text = {
                level: 1,
                experience: 0,
                message_count: 0,
            };
        }

        const member = interaction.guild.members.cache.get(user.id);
        const nextVoiceLevelExperience = (10 + profile.level) * 10 * profile.level * profile.level;
        const voiceProgress = Math.floor(profile.experience/nextVoiceLevelExperience*100);
        const nextTextLevelExperience = (profile.text.level*(profile.text.level/2+0.5))*10;
        const textProgress = Math.floor(profile.text.experience/nextTextLevelExperience*100);
        const oneFifthPercentVoice = Math.floor(voiceProgress/5)
        const oneFifthPercentText = Math.floor(textProgress/5)
        
        const infoEmbed = new EmbedBuilder()
            .setColor(member.displayHexColor)
            .setTitle(i18next.t("profile.infoTitle", {name: member.displayName}));
        
        infoEmbed.setThumbnail(member.displayAvatarURL({ extension: 'png' }))
        infoEmbed.addFields([
            {
                name: `Voice level: ${profile.level}`,
                value: `${voiceProgress}% (${profile.experience}/${nextVoiceLevelExperience})`
            },

            {
                name: `Text level: ${profile.text.level}`,
                value: `${textProgress}% (${profile.text.experience}/${nextTextLevelExperience})`
            },

            {
                name: `Total messages`,
                value: `${profile.text.message_count} messages`
            },

            {
                name: "Time spent",
                value: getFormattedTime(profile.timespent.global || 0)
            },

            {
                name: "Joined to us",
                value: user.id == "281478128629579776" ?
                    `Impostor ${momentRandom().format('DD-MM-YYYY HH:mm')}` :
                    moment(member.joinedAt).format('DD-MM-YYYY HH:mm')
            }
        ])

        await interaction.reply({
            embeds: [ infoEmbed ],
            ephemeral: false,
        });
	},
};

function getFormattedTime(totalSeconds) {
    let days = Math.floor(totalSeconds / (3600 * 24));
    totalSeconds %= 60 * 60 * 24;
    let hours = (`0` + (Math.floor(totalSeconds / 3600))).slice(-2);
    totalSeconds %= 3600;
    let minutes = (`0` + (Math.floor(totalSeconds / 60))).slice(-2);
    let seconds = (`0` + (totalSeconds % 60)).slice(-2);
    let timeString =`${days} ${i18next.t('days')} ${hours}:${minutes}:${seconds}`;

    return timeString;
}