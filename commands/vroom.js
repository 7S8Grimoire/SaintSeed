const { SlashCommandBuilder } = require("@discordjs/builders");
const { VoiceRoom } = require("../modules/database");
const i18next = require("i18next");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vroom")
    .setDescription("Voice room managment")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("save")
        .setDescription("create voice room")
        .addStringOption((option) =>
          option
            .setName("channel_id")
            .setDescription("The future  voice room")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("experience")
            .setDescription("Experience count per tick")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("delete voice room")
        .addStringOption((option) =>
          option
            .setName("channel_id")
            .setDescription("The voice room id")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "save") {
      save(interaction);
    } else if (interaction.options.getSubcommand() === "delete") {
      destroy(interaction);
    }
  },
};

async function save(interaction) {
  const guild = interaction.guild;
  const channel = guild.channels.resolve(
    interaction.options.getString("channel_id")
  );
  const experience = interaction.options.getInteger("experience");
  if (!channel) return interaction.reply(`Failed to create voice room`);

  try {
    let voiceRoom = await VoiceRoom.findOne({
      where: { guild_id: guild.id, channel_id: channel.id },
    });
    if (voiceRoom === null) {
      await VoiceRoom.create({
        channel_id: channel.id,
        guild_id: guild.id,
        experience_per_tick: experience,
      });
      interaction.reply(`Voice room ${channel.name} successfully created`);
    } else {
      await voiceRoom.update({
        channel_id: channel.id,
        guild_id: guild.id,
        experience_per_tick: experience,
      });
      interaction.reply(`Voice room ${channel.name} successfully updated`);
    }
  } catch (error) {
    interaction.reply(error.message);
  }
}

async function destroy(interaction) {
  const guild = interaction.guild;
  const channel = guild.channels.resolve(
    interaction.options.getString("channel_id")
  );
  try {
    await VoiceRoom.destroy({
      where: { guild_id: guild.id, channel_id: channel.id },
    });
    interaction.reply(`Voice room ${channel.name} successfully deleted`);
  } catch (error) {
    interaction.reply(error.message);
  }
}
