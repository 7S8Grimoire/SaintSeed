import { Command } from './../types/index.d';
import { SlashCommandBuilder } from 'discord.js';
import { profiles } from '../modules/api';
import i18next from 'i18next';
import random from 'random';
import seedrandom from 'seedrandom';
import moment from 'moment';

export default {
    powerlist: ["379778712868225042", "240491981426393088"],
    categories: ["command_spam", "roulette"],
	data: new SlashCommandBuilder()
		.setName('pray')
		.setDescription('Pray to get respect 👍')
        .toJSON(),
	async execute(interaction) {
		random.use(seedrandom(`${process.env.PRAY_SECRET}-${new Date().getTime()}`));
		const pray = random.int(0, 500);
		const user_id = interaction.user.id;
		const guild_id = interaction.guild.id;

		var profile = await profiles.show(guild_id, user_id);

		const now = moment();
		const last_pray_date = moment.unix(profile.pray.date);
		const diffDays = now.diff(last_pray_date, 'day', true);
        
		if (!now.isSame(last_pray_date, 'day')) {
            profile.pray.total++;
            if (diffDays <= 2) {
                profile.pray.date = now.unix();
                profile.pray.streak++;
            } else if (diffDays > 2) {
                profile.pray.date = now.unix();
                profile.pray.streak = 1;
            }
                        
			await profiles.update(guild_id, user_id, profile);

            await profiles.transaction({
                from: "self",
                to: {
                    user_id: user_id,
                    guild_id: guild_id,
                },
                amount: (pray + profile.pray.streak*10),
                reason: `Praying | streak ${profile.pray.streak}`,
            });
            const streak = profile.pray.streak*10;
			return interaction.reply(i18next.t('pray.success', { pray, streak }));
		} else {
            return interaction.reply(i18next.t('pray.alreadyGot'));
        }
	},
} as Command;