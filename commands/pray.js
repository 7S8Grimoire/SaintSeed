const { SlashCommandBuilder } = require('@discordjs/builders');
const { profiles } = require('../modules/api');
const i18next = require('i18next');
const random = require('random');
const seedrandom = require('seedrandom');
const moment = require('moment');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pray')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		random.use(seedrandom(`${process.env.PRAY_SECRET}-${new Date().getTime()}`));
		const pray = random.int(0, 500);
		const user_id = interaction.member.id;
		const guild_id = interaction.guild.id;

		var profile = await profiles.show(guild_id, user_id);

		const now = moment().utc(null);
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
            

			await profiles.update(user_id, guild_id, profile);

            await profiles.transaction({
                from: "self",
                to: {
                    user_id: user_id,
                    guild_id: guild_id,
                },
                amount: (pray + profile.pray.streak*10),
                reason: `pray | streak ${profile.pray.streak}`,
            });
			return interaction.reply(`Держи ${pray} и ${profile.pray.streak*10} за ежедневные молитвы!`);
		} else {
            return interaction.reply(i18next.t('You already got yours today.'));
        }

		await interaction.reply(i18next.t('Sorry can\'t hear you'));
	},
};