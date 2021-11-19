const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { VoiceRole } = require('../modules/database');
const i18next = require('i18next');

async function selectedMenuInteraction(interaction) {
    if (interaction.customId === 'vrole') {
        const selectedValue = interaction.values[0];
        const selectedRole = await interaction.guild.roles.fetch(selectedValue);
        const roleEmbed = new MessageEmbed();
        const row = new MessageActionRow()
        let voiceRole = await VoiceRole.findOne({ 
            where: {
                guild_id: interaction.guild.id,
                role_id: selectedValue 
            }
        });
        if (!voiceRole) {
            roleEmbed.setColor(process.env.EMBED_PRIMARY_COLOR)
                .setTitle(i18next.t('Make vrole', { name: selectedRole.name }))
                .setDescription(i18next.t('Do you wish to make this role a part of voice system?'));

            row.addComponents(
                new MessageButton()
                    .setCustomId('make_role_yes')
                    .setLabel('Yes')
                    .setStyle('SECONDARY'),

                new MessageButton()
                    .setCustomId('make_role_no')
                    .setLabel('No')
                    .setStyle('SECONDARY')
            );
        } else {
            roleEmbed.setColor(process.env.EMBED_PRIMARY_COLOR)
            .setTitle(i18next.t('Make vrole', { name: selectedRole.name }))
            .setDescription(i18next.t('Part'));
        }

        const filter = i => i.customId === 'make_role_yes';

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'make_role_yes') {
                await i.update({ content: 'A button was clicked!', components: [] });
            }
        });
        
        collector.on('end', collected => console.log(`Collected ${collected.size} items`));

        await interaction.update({ content: null, embeds: [roleEmbed], components: [row] });
    }    
}



module.exports = {
	name: 'interactionCreate',
	once: false,
	execute(interaction) {
        if (interaction.isSelectMenu()) {
            selectedMenuInteraction(interaction);
        }
	    
        
	},
};