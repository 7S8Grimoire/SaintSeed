const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
} = require("discord.js");
const { VoiceRole } = require("../modules/database");
const i18next = require("i18next");
const moment = require("moment");

function sendErrorEmbed(interaction, message) {
  const errorEmbed = new MessageEmbed();
  errorEmbed
    .setTitle(i18next.t("Alert"))
    .setDescription(i18next.t(message))
    .setColor(process.env.EMBED_DANGER_COLOR)
    .setThumbnail("attachment://close.png");
  interaction.editReply({
    content: null,
    embeds: [errorEmbed],
    components: [],
    files: [
      {
        attachment: "./assets/close64x64.png",
        name: "close.png",
      },
    ],
  });
}

async function firstStep(interaction) {
  // Getting roles
  const roles = interaction.guild.roles.cache.map((role) => {
    return {
      label: role.name,
      value: role.id,
    };
  });

  // Generating select component
  const componentId = `vrole-${moment().unix()}`;
  const row = new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId(componentId)
      .setPlaceholder("Nothing selected")
      .addOptions(roles)
  );
  const filter = (i) => {
    return i.user.id === interaction.user.id && i.customId === componentId;
  };

  await interaction.reply({
    content: i18next.t("Select a role"),
    components: [row],
  });

  interaction.channel
    .awaitMessageComponent({
      filter,
      componentType: "SELECT_MENU",
      time: process.env.INTERACTION_TIMEOUT,
    })
    .then(async (interaction) => {
      const selectedValue = interaction.values[0];
      const selectedRole = await interaction.guild.roles.fetch(selectedValue);
      if (!selectedRole) return;
      const roleEmbed = new MessageEmbed();
      const row = new MessageActionRow();
      let voiceRole = await VoiceRole.findOne({
        where: {
          guild_id: interaction.guild.id,
          role_id: selectedValue,
        },
      });

      if (!voiceRole) {
        secondStepCreate(interaction, { roleEmbed, row, selectedRole });
      }
    })
    .catch((err) => {
      console.error(err);
      sendErrorEmbed(interaction, "No interaction provided");
    });
}

function secondStepCreate(interaction, data) {
  const { roleEmbed, row, selectedRole } = data;
  const yesButtonId = `vrole-make-yes-${moment().unix()}`;
  const noButtonId = `vrole-make-no-${moment().unix()}`;
  const filterButtons = (i) => {
    return (
      i.user.id === interaction.user.id &&
      (i.customId === yesButtonId || i.customId === noButtonId)
    );
  };
  roleEmbed
    .setColor(process.env.EMBED_PRIMARY_COLOR)
    .setTitle(i18next.t("Make vrole", { name: selectedRole.name }))
    .setDescription(
      i18next.t("Do you wish to make this role a part of voice system?")
    );

  row.addComponents(
    new MessageButton()
      .setCustomId(yesButtonId)
      .setLabel("Yes")
      .setStyle("SECONDARY"),

    new MessageButton()
      .setCustomId(noButtonId)
      .setLabel("No")
      .setStyle("SECONDARY")
  );

  interaction.update({
    content: null,
    embeds: [roleEmbed],
    components: [row],
  });

  interaction.channel
    .awaitMessageComponent({ filterButtons, time: 10000 })
    .then(async (interaction) => {
      if (interaction.customId == yesButtonId) {
        roleEmbed
          .setColor(process.env.EMBED_PRIMARY_COLOR)
          .setTitle(i18next.t("Make vrole", { name: selectedRole.name }))
          .setDescription(
            i18next.t(
              "Type the level in the chat at which you can get this role"
            )
          );

        interaction.update({
          content: null,
          embeds: [roleEmbed],
          components: [],
        });

        thirdStep(interaction, data);
      }
    })
    .catch((err) => {
      sendErrorEmbed(interaction, "No interaction provided");
    });
}

function thirdStep(interaction, data) {
  const { roleEmbed, row, selectedRole } = data;
  const experienceCountFilter = (response) => {
    return Number.isInteger(response.content);
  };

  interaction.channel
    .awaitMessages({
      experienceCountFilter,
      max: 1,
      time: process.env.INTERACTION_TIMEOUT,
      errors: ["time"],
    })
    .then((collected) => {
      console.log(+collected.first().content);
      roleEmbed
        .setColor(process.env.EMBED_PRIMARY_COLOR)
        .setTitle(i18next.t("Make vrole", { name: selectedRole.name }))
        .setDescription(i18next.t("Was created :) (Poka net)"));

      collected.first().reply({
        content: null,
        embeds: [roleEmbed],
        components: [],
      });
    })
    .catch((collected) => {
      sendErrorEmbed(interaction, "No interaction provided");
    });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vrole")
    .setDescription("Open voice role menu"),
  async execute(interaction) {
    firstStep(interaction);
  }
};
