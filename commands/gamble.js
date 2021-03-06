const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  Constants,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
} = require("discord.js");
const i18next = require("i18next");
const moment = require("moment");
const Chance = require("chance");

module.exports = {
  categories: ["roulette"],
  data: new SlashCommandBuilder()
    .setName("gamble")
    .setDescription("It's time to gamble")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("dice")
        .setDescription("Dice with your friends!")
        .addUserOption((option) =>
          option
            .setName("opponent")
            .setDescription("Choose your opponent")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option.setName("bet").setDescription("your bet").setRequired(true)
        )
    ),
  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();

    if (subCommand == "dice") {
      dice(interaction);
    }
  },
};

async function dice(interaction) {
  // const opponent = interaction.guild.members.cache.get(interaction.options.getUser('opponent').id);
  const opponent = interaction.options.getUser("opponent");
  const author = interaction.member;
  const bet = interaction.options.getInteger("bet");

  if (opponent.bot) {
    return await interaction.reply({
      content: i18next.t(`dice.opponentBot`),
      ephemeral: true,
    });
  }

  if (opponent.id == author.user.id) {
    return await interaction.reply({
      content: i18next.t(`dice.opponentSelf`),
      ephemeral: true,
    });
  }

  let profile = await profiles.show(interaction.guild.id, author.id);

  if (bet < 0) {
    return await interaction.reply({
      content: i18next.t(`dice.betMin`),
      ephemeral: true,
    });
  }

  if (bet > profile.voicepoints) {
    return await interaction.reply({
      content: i18next.t(`dice.betVoicePointsNotEnough`, {
        voicepoints: profile.voicepoints,
      }),
      ephemeral: true,
    });
  }

  const componentId = `gable-dice-${moment().unix()}-${interaction.guild.id}`;

  const AcceptDiceDuel = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId(componentId)
      .setLabel("GO")
      .setStyle("SECONDARY")
  );
	
  const EmbedDiceDuel = new MessageEmbed()
    .setTitle(i18next.t("dice.embedTitle"))
    .setColor(process.env.EMBED_PRIMARY_COLOR)
    .addField(i18next.t("dice.bet"), `${bet} VP`)
    .setAuthor(
      author.displayName,
      interaction.user.displayAvatarURL({ format: "png" })
    )
    .setDescription(
      i18next.t("dice.embedDescription", {
        from: interaction.user,
        to: opponent,
      })
    )
    .setTimestamp();
  const filter = (input) => {    
    return input.user.id === opponent.id && input.customId === componentId;
  };

  interaction.channel
    .awaitMessageComponent({
      filter,
      componentType: Constants.MessageComponentTypes.BUTTON,
      time: process.env.INTERACTION_TIMEOUT * 3,
    })
    .then(async (interaction) => {
      let playerOneProfile = await profiles.show(
        interaction.guild.id,
        author.id
      );
      let playerTwoProfile = await profiles.show(
        interaction.guild.id,
        interaction.member.id
      );

      validateVoicePoints = (profile) => {
        if (bet > profile.voicepoints) {
          EmbedDiceDuel.setDescription(
            i18next.t("dice.duelVoicePointsNotEnough", {
              user: interaction.user,
            }),
            {
              user: author.id,
            }
          );
          return false;
        }
        return true;
      };

      if (
        !validateVoicePoints(playerOneProfile) ||
        !validateVoicePoints(playerTwoProfile)
      ) {
        EmbedDiceDuel.fields = null;
        return interaction.update({
          embeds: [EmbedDiceDuel],
          components: [],
        });
      }

      const gambleSeed = process.env.GAMBLE_RANDOM_SEED;
      const playerOne = [
        new Chance(`${gambleSeed}-${moment().unix()}-${author.id}`).d6(),
        new Chance(
          `${gambleSeed}-${moment().unix()}-${interaction.guild.id}`
        ).d6(),
      ];

      const playerTwo = [
        new Chance(
          `${gambleSeed}-${moment().unix()}-${interaction.channel.id}`
        ).d6(),
        new Chance(`${gambleSeed}-${moment().unix()}-${interaction.id}`).d6(),
      ];

      const gameResultText = [
        `${author.displayName}: \`${playerOne[0]}\` \`${playerOne[1]}\``,
        `${interaction.member.displayName}: \`${playerTwo[0]}\` \`${playerTwo[1]}\``,
      ];
      EmbedDiceDuel.setTitle(i18next.t("dice.resultsTitle"));
      EmbedDiceDuel.setDescription(gameResultText.join("\n"));
			const pOneResult = playerOne.reduce((sum, cube) => sum + cube, 0);
			const pTwoResult = playerTwo.reduce((sum, cube) => sum + cube, 0);
			if (pOneResult > pTwoResult) {
				EmbedDiceDuel.addField(i18next.t('dice.result'), i18next.t('dice.winner', { winner: playerOneProfile.user_id }));
				await profiles.transaction({
					from: {
						user_id: playerTwoProfile.user_id,
						guild_id: playerTwoProfile.guild_id,
					},
					to: {
						user_id: playerOneProfile.user_id,
						guild_id: playerOneProfile.guild_id,
					},
					amount: bet,
					reason: `Gamble | Dice | Bet: ${bet} `,
				});
			} else if (pOneResult < pTwoResult) {
				EmbedDiceDuel.addField(i18next.t('dice.result'), i18next.t('dice.winner', { winner: playerTwoProfile.user_id }));
				await profiles.transaction({					
					from: {
						user_id: playerOneProfile.user_id,
						guild_id: playerOneProfile.guild_id,
					},
					to: {
						user_id: playerTwoProfile.user_id,
						guild_id: playerTwoProfile.guild_id,
					},
					amount: bet,
					reason: `Gamble | Dice | Bet: ${bet} `,
				});
			} else {
				EmbedDiceDuel.addField(i18next.t('dice.result'), i18next.t('dice.draw'));
			}

      return interaction.update({
        embeds: [EmbedDiceDuel],
        components: [],
      });
    })
    .catch((err) => {
      console.error(err);
      EmbedDiceDuel.fields = null;
      EmbedDiceDuel.setDescription(i18next.t("dice.timeOut"));
      interaction.editReply({
        embeds: [EmbedDiceDuel],
        components: [],
      });
    });

  await interaction.reply({
    embeds: [EmbedDiceDuel],
    components: [AcceptDiceDuel],
  });
}
