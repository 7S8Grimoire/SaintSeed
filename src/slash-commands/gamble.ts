import { profiles } from './../modules/api';
import { Command } from './../types/index.d';
import { SlashCommandBuilder } from 'discord.js';
import {  
  EmbedBuilder,    
  ActionRowBuilder,
  ButtonBuilder,
  ComponentType,
  ButtonStyle,
  ColorResolvable
} from "discord.js";
import i18next from "i18next";
import moment from "moment";
import Chance from "chance";

export default {
  // categories: ["roulette"],
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
    )
    .toJSON(),
  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();

    if (subCommand == "dice") {
      dice(interaction);
    }
  },
} as Command;

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

  const AcceptDiceDuel = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(componentId)
      .setLabel("GO")
      .setStyle(ButtonStyle.Secondary)
  );
	
  const EmbedDiceDuel = new EmbedBuilder()
    .setTitle(i18next.t("dice.embedTitle"))
    .setColor(`#${process.env.EMBED_PRIMARY_COLOR}`)
    .addFields(
      { name: i18next.t("dice.bet"),  value: `${bet} VP` }
    )
    .setAuthor({
      name: author.displayName,
      iconURL: interaction.user.displayAvatarURL({ extension: "png" })
    })
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
      componentType: ComponentType.Button,
      time: +process.env.INTERACTION_TIMEOUT * 3,
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

      const validateVoicePoints = (profile) => {
        if (bet > profile.voicepoints) {
          EmbedDiceDuel.setDescription(
            i18next.t("dice.duelVoicePointsNotEnough", {
              user: interaction.user,
            }),
          );
          return false;
        }
        return true;
      };

      if (
        !validateVoicePoints(playerOneProfile) ||
        !validateVoicePoints(playerTwoProfile)
      ) {
        EmbedDiceDuel.setFields([]);
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
				EmbedDiceDuel.addFields({ name: i18next.t('dice.result'), value: i18next.t('dice.winner', { winner: playerOneProfile.user_id }) });
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
				EmbedDiceDuel.addFields({ name: i18next.t('dice.result'), value: i18next.t('dice.winner', { winner: playerTwoProfile.user_id }) });
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
				EmbedDiceDuel.addFields({ name: i18next.t('dice.result'), value: i18next.t('dice.draw') });
			}

      return interaction.update({
        embeds: [EmbedDiceDuel],
        components: [],
      });
    })
    .catch((err) => {
      console.error(err);
      EmbedDiceDuel.setFields([]);
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
