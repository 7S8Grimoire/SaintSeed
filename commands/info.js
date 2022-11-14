const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const { api, profiles } = require('../modules/api');
const i18next = require('i18next');
const Canvas = require('canvas');

module.exports = {
    categories: ["command_spam", "roulette"],
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Get user info')
        .addUserOption(option => option
            .setName('user')
            .setDescription('Select a user which info you need to see')
            .setRequired(false)
        ),
	async execute(interaction) {
        const user = interaction.options.getUser('user') ?? interaction.user;
        const profile = await profiles.show(interaction.guild.id, user.id);
        
        if (!profile) return;

        const member = interaction.guild.members.cache.get(user.id);

        const canvas = Canvas.createCanvas(400, 600);
		const context = canvas.getContext('2d');
        const textColor = "#ffffff";
        const backgroundColor = "#3e4147";
        const applyText = (canvas, text) => {
            const context = canvas.getContext('2d');
      
            // Declare a base size of the font
            let fontSize = 35;
        
            do {
              // Assign the font to the context and decrement it so it can be measured again
              context.font = `400 ${fontSize -= 5}px HelveticaNeue`;
              // Compare pixel width of the text to the canvas minus the approximate avatar size
              if (fontSize < 0) break;
            } while (context.measureText(text).width > canvas.width - 100);
      
            // Return the result to use in the actual canvas
            return context.font;
        };

        const width = canvas.width;
        const height = canvas.height;
        const displayName = member.displayName;
        
        const avatar = await Canvas.loadImage(member.displayAvatarURL({ format: 'png' }));
        const nameHeightOffset = 270;
        
        // Create bacground with gradient        
        let gradient = context.createRadialGradient(width / 2, 0, 0, width / 2, 0, width);
        gradient.addColorStop(0, "#6f7278");
        gradient.addColorStop(1, backgroundColor);
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);

        // Add user name
        context.font = applyText(canvas, displayName);
        // context.shadowColor="black";
        // context.shadowBlur=2;
        // context.lineWidth=5;
        context.textAlign = "center";
        context.fillStyle = textColor;
        context.fillText(displayName, width / 2, nameHeightOffset);
        context.shadowBlur=0;
        
        // Draw voice level progress circle
        let nextVoiceLevelExperience = (10 + profile.level) * 10 * profile.level * profile.level;
        let voiceProgress = profile.experience/nextVoiceLevelExperience*100;
        // voiceProgress = 67;
            // Draw progress bacground circle
        context.beginPath();
        context.lineWidth = 12;
        context.arc(width / 2, nameHeightOffset + 100, 50, 0, 2 * Math.PI);
        context.strokeStyle = '#212121';
        context.stroke();
            // Draw progress current %
        context.beginPath();
        context.arc(width / 2, nameHeightOffset + 100, 50, 0 * Math.PI + 2 * Math.PI, voiceProgress / 50 * Math.PI + 2 * Math.PI);
        context.strokeStyle = textColor;
        context.stroke();

        // Write user current voice level 
        context.font = `400 30px HelveticaNeue`;
        context.textAlign = "center";
        context.fillStyle = textColor;
        context.fillText(profile.level, width / 2, nameHeightOffset + 110);
        
        // Write voice profile details
        context.font = `400 10px HelveticaNeue`;
        context.fillText(`${Math.floor(voiceProgress)}%`, width / 2, nameHeightOffset + 130);
        context.fillText('Voice', width / 2, nameHeightOffset + 75);
        context.font = `400 12px HelveticaNeue`;
        context.textAlign = "start";        
        context.fillText(getFormatedTime(profile.timespent.global || 0), 25, nameHeightOffset + 110);
        context.textAlign = "end";
        context.fillText(`${profile.voicepoints} VP`, width-25, nameHeightOffset + 110);

        if (!profile.text) {
            profile.text = {
                level: 1,
                experience: 0,
                message_count: 0,
            };
        }
        
        // Draw text level progress circle
        let nextTextLevelExperience = (profile.text.level*(profile.text.level/2+0.5))*10;
        let textProgress = profile.text.experience/nextTextLevelExperience*100;
        // textProgress = 33;
            // Draw progress bacground circle
        context.beginPath();
        context.lineWidth = 12;
        context.arc(width / 2, nameHeightOffset + 220, 50, 0, 2 * Math.PI);
        context.strokeStyle = '#212121';
        context.stroke();
            // Draw progress current %
        context.beginPath();
        context.arc(width / 2, nameHeightOffset + 220, 50, 0 * Math.PI + 2 * Math.PI, textProgress / 50 * Math.PI + 2 * Math.PI);
        context.lineWidth = 12;
        context.strokeStyle = textColor;
        context.stroke();

        // Write user current voice level 
        context.font = `400 30px HelveticaNeue`;
        context.textAlign = "center";
        context.fillStyle = textColor;
        context.fillText(profile.text.level, width / 2, nameHeightOffset + 230);

        // Write voice profile details
        context.font = `400 10px HelveticaNeue`;
        context.fillText(`${Math.floor(textProgress)}%`, width / 2, nameHeightOffset + 250);
        context.fillText('Text', width / 2, nameHeightOffset + 195);
        context.font = `400 12px HelveticaNeue`;
        context.textAlign = "end";
        context.fillText(`${profile.text.message_count} messages`, width-25, nameHeightOffset + 220);

        // Draw user avatar
        context.beginPath();
        context.arc(width / 2 - 100 + 100, 25 + 100, 100, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();
        context.drawImage(avatar, width / 2 - 100, 25, 200, 200);
        
        // Send info
        const attachment = new MessageAttachment(canvas.toBuffer(), 'profile-image.png');
	    interaction.reply({ files: [attachment] });
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