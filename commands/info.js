const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const i18next = require('i18next');
const { api, VoiceProfiles } = require('../modules/api');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Get user info'),
	async execute(interaction) {        
		let profile = await VoiceProfiles.show(interaction.guild.id, interaction.member.id);
        const member = interaction.member;        
        let nextLevelExperience = (10 + profile.level) * 10 * profile.level * profile.level;
        let voiceProgressInfo = `Level ${profile.level} (${profile.experience}/${nextLevelExperience})\n`;
        let voiceExperiencePercents = Math.floor(profile.experience/nextLevelExperience*20);
        let voiceProgressBar = "[";

        for (let i = 0; i < 20; i++) {
            if (i <= voiceExperiencePercents)  {
                voiceProgressBar += "█";
            } else {
                voiceProgressBar += "░";                
            }
        }
        voiceProgressBar += `] (${voiceExperiencePercents}%)\n`;
        voiceProgressInfo += voiceProgressBar;
        voiceProgressInfo += `Time spent: ${getFormatedTime(profile.time_spents.global || 0)}\n`;
        voiceProgressInfo += `Voice Points: ${profile.voicepoints}`;
        

        const embed = new MessageEmbed()
            .setColor('#2cbbce')
            .setTitle(i18next.t('Member info'))                        
            .setDescription(member.nickname || member.user.username)
            .setThumbnail(interaction.member.displayAvatarURL())            
            .addField(i18next.t('Voice'), voiceProgressInfo, true)
            .setTimestamp();            
        await interaction.reply({ embeds: [ embed ] });
	},
};

function getFormatedTime(totalSeconds) {    
    let days = Math.floor(totalSeconds / (3600 * 24));
    totalSeconds %= 60 * 60 * 24;
    let hours = (`0` + (Math.floor(totalSeconds / 3600))).slice(-2);
    totalSeconds %= 3600;
    let minutes = (`0` + (Math.floor(totalSeconds / 60))).slice(-2);
    let seconds = (`0` + (totalSeconds % 60)).slice(-2);
    let timeString =`${days} ${i18next.t('days')} ${hours}:${minutes}:${seconds}`;

    return timeString;
}