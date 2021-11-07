const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const i18next = require('i18next');
const { api, VoiceProfiles } = require('../modules/api');
const Canvas = require('canvas');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Get user info'),
	async execute(interaction) {
        const profile = await VoiceProfiles.show(interaction.guild.id, interaction.member.id);
        if (!profile) return;

        const canvas = Canvas.createCanvas(400, 500);
		const context = canvas.getContext('2d');
        const textColor = "#ffffff";
        const backgroundColor = "#3e4147";
        const applyText = (canvas, text) => {
            const context = canvas.getContext('2d');
      
            // Declare a base size of the font
            let fontSize = 35;
        
            do {
              // Assign the font to the context and decrement it so it can be measured again
              context.font = `400 ${fontSize -= 5}px Roboto, Arial, sans-serif`;
              // Compare pixel width of the text to the canvas minus the approximate avatar size
              if (fontSize < 0) break;
            } while (context.measureText(text).width > canvas.width - 100);
      
            // Return the result to use in the actual canvas
            return context.font;
        };

        const width = canvas.width;
        const height = canvas.height;
        const displayName = interaction.member.displayName;
        const avatar = await Canvas.loadImage(interaction.user.displayAvatarURL({ format: 'jpg' }));
        const nameHeightOffset = 260;
        // Create gradient
        let grd = context.createLinearGradient(0, 0, 0, height);
        grd.addColorStop(0, "#6f7278");
        grd.addColorStop(1, backgroundColor);
        context.fillStyle = grd;
        context.fillRect(0, 0, width, height);

        context.font = applyText(canvas, displayName);
        // context.shadowColor="black";
        // context.shadowBlur=2;
        // context.lineWidth=5;        
        context.textAlign = "center";
        context.fillStyle = textColor;
        context.fillText(displayName, width / 2, nameHeightOffset);
        context.shadowBlur=0;
        
        let nextLevelExperience = (10 + profile.level) * 10 * profile.level * profile.level;
        let progress = profile.experience/nextLevelExperience*100;
        context.beginPath();
        context.arc(width / 2, nameHeightOffset + 100, 50, 0 * Math.PI + 2 * Math.PI, progress / 50 * Math.PI + 2 * Math.PI);
        context.lineWidth = 12;
        context.strokeStyle = textColor;
        context.stroke();

        context.font = `400 30px Roboto, Arial, sans-serif`;
        context.textAlign = "center";
        context.fillStyle = textColor;
        context.fillText(profile.level, width / 2, nameHeightOffset + 110);
        
        context.font = `400 10px Roboto, Arial, sans-serif`;
        context.fillText(`${Math.floor(progress)}%`, width / 2, nameHeightOffset + 130);
        context.font = `400 15px Roboto, Arial, sans-serif`;
        context.textAlign = "start";
        context.fillText(getFormatedTime(profile.time_spents.global || 0), 25, nameHeightOffset + 110);
        context.textAlign = "end";
        context.fillText(`${profile.voicepoints} VP`, width-25, nameHeightOffset + 110);

        context.beginPath();
        context.arc(width / 2 - 100 + 100, 25 + 100, 100, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();
        context.drawImage(avatar, width / 2 - 100, 25, 200, 200);        

        const attachment = new MessageAttachment(canvas.toBuffer(), 'profile-image.png');
	    interaction.reply({ files: [attachment] });
        return;
        


        
        // const member = interaction.member;        
		// let profile = await VoiceProfiles.show(interaction.guild.id, interaction.member.id);
        // let nextLevelExperience = (10 + profile.level) * 10 * profile.level * profile.level;
        // let voiceProgressInfo = `Level ${profile.level} (${profile.experience}/${nextLevelExperience})\n`;
        // let voiceExperiencePercents = Math.floor(profile.experience/nextLevelExperience*100);
        // let voiceProgressBar = "[";
        
        // for (let i = 0; i < 20; i++) {
        //     if (i <= voiceExperiencePercents / 5)  {
        //         voiceProgressBar += "█";
        //     } else {
        //         voiceProgressBar += "░";                
        //     }
        // }
        // voiceProgressBar += `] (${voiceExperiencePercents}%)\n`;
        // voiceProgressInfo += voiceProgressBar;
        // voiceProgressInfo += `Time spent: ${getFormatedTime(profile.time_spents.global || 0)}\n`;
        // voiceProgressInfo += `Voice Points: ${profile.voicepoints}`;
        

        // const embed = new MessageEmbed()
        //     .setColor('#2cbbce')
        //     .setTitle(i18next.t('Member info'))                        
        //     .setDescription(member.displayName)
        //     .setThumbnail(interaction.member.displayAvatarURL())            
        //     .addField(i18next.t('Voice'), voiceProgressInfo, true)
        //     .setTimestamp();            

        
        // await interaction.reply({ embeds: [ embed ] });
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