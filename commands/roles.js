const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const i18next = require('i18next');

const botName = _.upperFirst(_.toLower(process.env.BOT_PERSONALITY));

module.exports = {
	// categories: ["command_spam", "roulette"],
	data: new SlashCommandBuilder()
		.setName('roles')
		.setDescription(`Show roles`),
	async execute(interaction) {
		// const flyEmoji = interaction.client.emojis.cache.get('714097004367839282')
		const role = interaction.guild.roles.cache.get('616199768309366784');
		const emoji = interaction.client.emojis.cache.get('687584929445445639');
		const botInfoEmbed = new EmbedBuilder()
			.setColor("#580ad6")
			.setTitle('Add/Remove roles')
			.addFields([
				{ name: `1️⃣ - to get role`, value: role.toString() }
			]);
		
		const button = new ButtonBuilder()
			.setCustomId(`role-${role.id}`)
			.setLabel('1️⃣')
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder().addComponents(button);

		const filter = i => i.customId === `role-${role.id}`;

		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

		collector.on('collect', async i => {
			if (i.member.roles.cache.has(role.id)) {
				i.member.roles.remove(role.id);
				i.reply({
					content: `Removed - ${role.toString()}`,
					ephemeral: true,
				});
			} else {
				i.member.roles.add(role.id);
				i.reply({
					content: `Added - ${role.toString()}`,
					ephemeral: true,
				});
			}
		});

		collector.on('end', collected => console.log(`Collected ${collected.size} items`));

		await interaction.reply({
			embeds: [ botInfoEmbed ],
			components: [ row ]
		});
	},
};