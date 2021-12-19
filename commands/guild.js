const { SlashCommandBuilder } = require("@discordjs/builders");
const { Guild } = require("../modules/database");
const i18next = require("i18next");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("guild")
    .setDescription("Manage guild")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("alert")
        .setDescription("Set alert channel (0 - remove)")
        .addStringOption((option) =>
          option
            .setName("channel_id")
            .setDescription("The text channel id")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("command-spam")
        .setDescription("Set command spam channel (0 - remove)")
        .addStringOption((option) =>
          option
            .setName("channel_id")
            .setDescription("The text channel id")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("roulette")
        .setDescription("Set roulette channel (0 - remove)")
        .addStringOption((option) =>
          option
            .setName("channel_id")
            .setDescription("The text channel id")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    let [guild] = await Guild.findOrCreate({
      where: { guild_id: interaction.guild.id },
    });

    if (
      subcommand === "alert" ||
      subcommand === "roulette" ||
      subcommand === "command-spam"
    ) {
      const channel_id = interaction.options.getString("channel_id");
      const channel_name = `${subcommand.replace("-", "_")}_channel_id`;
      if (channel_id == "0") {
        guild[channel_name] = null;
        await guild.save();
        interaction.reply(`Guild settings saved successfully!`);
        return;
      }

      const channel = interaction.guild.channels.resolve(
        interaction.options.getString("channel_id")
      );
      if (!channel) {
        interaction.reply(`Сan't find the channel`);
        return;
      }

      if (!channel.isText()) {
        interaction.reply(`Сhannel "${channel.name}" is not text`);
        return;
      }

      guild[channel_name] = channel.id;
      await guild.save();
    }

    interaction.reply(`Guild settings saved successfully!`);
  },
};
