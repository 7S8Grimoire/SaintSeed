const { SlashCommandBuilder } = require('discord.js');
const { profiles } = require('../modules/api');
const i18next = require("i18next");

module.exports = {
  categories: ["command_spam", "roulette"],
  data: new SlashCommandBuilder()
    .setName("give")
    .setDescription("Give someone your voicepoints")
    .addUserOption((option) =>
      option.setName("who").setDescription("WHO?").setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName("voicepoints").setDescription("How much").setRequired(true)
    ),
  async execute(interaction) {
    const who = interaction.options.getUser("who");
    const voicepoints = interaction.options.getInteger("voicepoints");

		if (interaction.user.id == who.id) {
			return interaction.reply({
        content: i18next.t("give.self"),
        ephemeral: true,
      });
		}

    if (voicepoints <= 0) {
      return interaction.reply({
        content: i18next.t("give.min"),
        ephemeral: true,
      });
    }

    const profile = await profiles.show(interaction.guild.id, interaction.user.id);
    const giveToProfile = await profiles.show(interaction.guild.id, who.id);

    if (voicepoints > profile.voicepoints) {
      return interaction.reply({
        content: i18next.t("give.voicePointsNotEnough", {
          voicepoints: profile.voicepoints,
        }),
        ephemeral: true,
      });
    }

    await profiles.transaction({
      from: {
        user_id: profile.user_id,
        guild_id: profile.guild_id,
      },
      to: {
        user_id: giveToProfile.user_id,
        guild_id: giveToProfile.guild_id,
      },
      amount: voicepoints,
      reason: "give",
    });

    await interaction.reply(i18next.t("give.success", {
			userFrom: interaction.user,
			userTo: who,
			voicepoints: voicepoints,
		}));
  },
};
