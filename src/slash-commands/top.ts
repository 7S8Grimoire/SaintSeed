import { Command } from './../types/index.d';
import { SlashCommandBuilder } from 'discord.js';
import { EmbedBuilder }  from "discord.js";
import { profiles } from "../modules/api";
import i18next  from "i18next";
import moment  from "moment";
import momentRandom from 'moment-random';
import { paginationEmbed } from '../helpers';

export default {
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
    )
    .addSubcommand((subCommand) =>
      subCommand.setName('connected').setDescription("connected to server top")
    )
    .addSubcommand((subCommand) =>
      subCommand.setName('pray-total').setDescription("prays top")
    )
    .toJSON(),
  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();
    const topEmbed = new EmbedBuilder()
      .setColor(`#${process.env.EMBED_PRIMARY_COLOR}`)
    let data = [];
    if (subCommand == "voice-level") {
      let place = 1;
      data = await profiles.levelTop(interaction.guild.id)
      topEmbed.setTitle(i18next.t("top.voiceLevel"));
      data.some((profile) => {
        let member = interaction.guild.members.cache.get(profile.user_id);
        if (member) {
          let nextLevel = (10 + profile.level) * 10 * profile.level * profile.level;
          let percentage = Math.floor(profile.experience / nextLevel * 100);
          topEmbed.addFields({
            name: `#${place++} ${member.displayName}`, value: i18next.t('top.voiceLevelRow', {
              level: profile.level,
              experience: profile.experience,
              percentage: percentage,
            })
          });
        }
        return place > 5;
      });
    }

    if (subCommand == "voice-time") {
      data = await profiles.timeTop(interaction.guild.id);
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

          let timeString = i18next.t('time.format', { days, hours, minutes, seconds });
          topEmbed.addFields({ name: `#${place++} ${member.displayName}`, value: i18next.t('top.voiceTimeRow', { timeString }) });
        }
        return place > 20;
      });
    }

    if (subCommand == "voicepoints") {
      data = await profiles.pointsTop(interaction.guild.id)
      topEmbed.setTitle(i18next.t("top.voicepoints"));
      let place = 1;
      data.some((profile) => {
        let member = interaction.guild.members.cache.get(profile.user_id);
        if (member) {
          topEmbed.addFields({
            name: `#${place++} ${member.displayName}`,
            value: i18next.t('top.voicepointsRow', { voicepoints: profile.voicepoints })
          });
        }
        return place > 5;
      });
    }

    if (subCommand == "connected") {
      let members = (await interaction.guild.members.fetch()).map(member => {
        if (member.user.id == "281478128629579776") {
          member.joinedTimestamp = momentRandom(1646161203000, 1488394803000).toDate().getTime();
        }
        return member;
      });

      members = members.sort((a, b) => {
        return a.joinedTimestamp - b.joinedTimestamp
      });

      let place = 1;
      let pageItemCount = 1;
      let pages = [];
      let connectedTopEmbed = new EmbedBuilder()
        .setColor(`#${process.env.EMBED_PRIMARY_COLOR}`)
        .setTitle(i18next.t("top.connected"));

      members.forEach((member) => {
        connectedTopEmbed.addFields({
          name: `#${place++} ${member.displayName}`,
          value: i18next.t('top.joinedAt', { joinedDate: moment(member.joinedTimestamp).format('DD-MM-YYYY HH:mm') })
        });
        pageItemCount++;

        if (pageItemCount > 10 || place > members.length) {
          pageItemCount = 1;
          pages.push(connectedTopEmbed);
          connectedTopEmbed = new EmbedBuilder()
            .setColor(`#${process.env.EMBED_PRIMARY_COLOR}`)
            .setTitle(i18next.t("top.connected"));
        }
      });

      return paginationEmbed(interaction, pages, 3 * 60 * 1000, true);
    }

    if (subCommand == "pray-total") {
      data = (await profiles.prayStreakTop(interaction.guild.id)).sort((a, b) => {
        return b.pray.total - a.pray.total;
      });
      topEmbed.setTitle(i18next.t("top.prayStreak"));
      let place = 1;
      data.some((profile) => {
        let member = interaction.guild.members.cache.get(profile.user_id);
        if (member) {
          topEmbed.addFields({
            name: `#${place++} ${member.displayName}`,
            value: i18next.t('top.prayTotalRow', { prayTotal: profile.pray.total })
          });
        }
        return place > 10;
      });

    }


    interaction.reply({
      embeds: [ topEmbed ]
    });
  },
} as Command;
