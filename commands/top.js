const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const i18next = require("i18next");
const { profiles } = require("../modules/api");
const moment = require("moment");

module.exports = {
  categories: ["command_spam", "roulette"],
  data: new SlashCommandBuilder()
    .setName("top")
    .setDescription("Gives the top 5 list")
    .addSubcommand((subcommand) =>
      subcommand.setName("voice-level").setDescription("voice level top")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("voice-time").setDescription("voice time top")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("voicepoints").setDescription("voicepoints top")
    ),
  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();
    const topEmbed = new MessageEmbed()
      .setColor(process.env.EMBED_PRIMARY_COLOR)
    let data = [];
    if (subCommand == "voice-level") {
      let place = 1;
      data = await profiles.levelTop(interaction.guild.id)
      topEmbed.setTitle(i18next.t("top.voiceLevel"));    
      data.some((profile) => {
        let member = interaction.guild.members.cache.get(profile.user_id);
        if (member) {
            let nextLevel = (10+profile.level)*10*profile.level*profile.level;
            let percentage = Math.floor(profile.experience/nextLevel*100);
            topEmbed.addField(`#${ place++ } ${ member.displayName }`, i18next.t('top.voiceLevelRow', { 
              level: profile.level,
              experience: profile.experience,
              percentage: percentage,
            }));
        }
        return place > 5;
      });
    }

    if (subCommand == "voice-time") {
      data = await profiles.timeTop(interaction.guild.id)
      topEmbed.setTitle(i18next.t("top.voiceTime"));
      let place = 1;
      data.some((profile) => {
        let member = interaction.guild.members.cache.get(profile.user_id);
        if (member) {
            let totalSeconds = profile.timespent.global ?? 0;
            let days = Math.floor(totalSeconds / (3600 * 24));
            totalSeconds %= 60 * 60 * 24;
            let hours = (`0` + (Math.floor(totalSeconds / 3600))).slice(-2);
            totalSeconds %= 3600;
            let minutes = (`0` + (Math.floor(totalSeconds / 60))).slice(-2);
            let seconds = (`0` + (totalSeconds % 60)).slice(-2);
            
            let timeString = i18next.t('time.format', {days, hours, minutes, seconds});
            topEmbed.addField(`#${ place++ } ${ member.displayName  }`, i18next.t('top.voiceTimeRow', {timeString}));            
        }
        return place > 5;
      });
    }

    if (subCommand == "voicepoints") {
      data = await profiles.pointsTop(interaction.guild.id)
      topEmbed.setTitle(i18next.t("top.voicepoints"));
      let place = 1;
      data.some((profile) => {
        let member = interaction.guild.members.cache.get(profile.user_id);
        if (member) {
          topEmbed.addField(`#${ place++ } ${member.displayName}`,  i18next.t('top.voicepointsRow', { voicepoints: profile.voicepoints }));
        }
        return place > 5;
      });      
    }
    interaction.reply({
      embeds: [topEmbed]
    });
  },
};
