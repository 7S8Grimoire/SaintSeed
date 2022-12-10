import { profiles } from './../modules/api';
import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import i18next from 'i18next';

module.exports = {	
	categories: ["command_spam", "roulette"],
  permissions: [ PermissionFlagsBits.Administrator ],
	data: new SlashCommandBuilder()
		.setName('add-exp')
		.setDescription('Add exp to person')    
    .addUserOption(option => option
      .setName('user')
      .setDescription('Select a user which will gets exp')
      .setRequired(true)
    )
    .addIntegerOption(option => option
      .setName('exp')
      .setDescription('how many exp?')
      .setRequired(true)
    ),
	async execute(interaction) {
    const exp = interaction.options.getInteger('exp');
    const user = interaction.options.getUser('user');    
    let data = [
      {
        user_id: user.id,
        guild_id: interaction.guild.id,
        experience: exp,
      },
    ];
    await profiles.bulkAdd(data);

    const embed = new EmbedBuilder()
      .setDescription(`${user} был проспонсирован на ${exp} экспи`);

		await interaction.reply({
      embeds: [ embed ],
    });
	},
};