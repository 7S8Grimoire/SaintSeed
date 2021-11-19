const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { profiles } = require('../modules/api');
const random = require('random');
const seedrandom = require('seedrandom');
const i18next = require('i18next');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gamble')
		.setDescription('Gambling ;3')
        .addSubcommand((subcommand) =>
            subcommand
            .setName("dice")
            .setDescription("Your favorite dice)")
            .addIntegerOption((option) =>
                option
                .setName("bet")
                .setDescription("your bet")
                .setRequired(true)
            )
        ),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === "dice") {
            dice(interaction);
        }
	},
};

async function dice(interaction) {
    const bet = interaction.options.getInteger("bet");
    const minimalBet = process.env.GAMBLE_DICE_MINIMAL_BET;
    const member = interaction.member;
    let profile = await profiles.show(interaction.guild.id, interaction.member.id);

    if (!profile) {
        return interaction.reply(`${i18next.t('You can\'t play this game!')}`);
    }

    if (bet < minimalBet) {
        return interaction.reply(`${i18next.t('Minimal bet')} ${minimalBet}`);
    }

    if (bet > profile.voicepoints) {
        return interaction.reply(`${i18next.t('Not enough VP')}`)
    }

    random.use(seedrandom(`nleebsu-${new Date().getTime()}`));
        
    let playerFirstDice = random.int(1, 6);
    let playerSecondDice = random.int(1, 6);
    let botFirstDice = random.int(1, 6);
    let botSecondDice = random.int(1, 6);

    let playerSum = playerFirstDice + playerSecondDice;
    let botSum = botFirstDice + botSecondDice;

    let embed = new MessageEmbed()
            .setColor(process.env.EMBED_PRIMARY_COLOR)
            .setTitle(`${member.displayName} ${i18next.t('Game results')}`)
            .setDescription(`${i18next.t('My cubes')} \`${botFirstDice}\` \`${botSecondDice}\``)
            .setTimestamp();

    if (playerSum == botSum) {
        embed.addField(`${i18next.t('Draw')}`, `${i18next.t('Your cubes')} \`${playerFirstDice}\` \`${playerSecondDice}\``);
    } else if (playerSum > botSum) {
        embed.addField(`${i18next.t('Win')} +${bet}`, `${i18next.t('Your cubes')} \`${playerFirstDice}\` \`${playerSecondDice}\``);
        profiles.transaction({
            from: "self",
            to: {
                user_id: profile.user_id,
                guild_id: profile.guild_id,
            },
            amount: bet,
            reason: "Dice win",
        });
    } else {
        embed.addField(`${i18next.t('Lose')} -${bet}`, `${i18next.t('Your cubes')} \`${playerFirstDice}\` \`${playerSecondDice}\``);
        profiles.transaction({
            from: {
                user_id: profile.user_id,
                guild_id: profile.guild_id,
            },
            to: "self",
            amount: bet,
            reason: "Dice lose",
        });
    }
    
       
    await interaction.reply({ embeds: [ embed ] });
}