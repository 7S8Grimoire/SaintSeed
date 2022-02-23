const { client } = require('./client');
// const { Guild } = require('./database');
const { profiles, api } = require('../modules/api');
const { default: i18next } = require('i18next');

client.on('messageCreate', async message => {    
    if (!message.guild) return;
    if (message.author.bot) return;
    
    let updates = {};
    let alert_channel = null;
    const guild_id = message.guild.id;    
    const user_id = message.author.id;
    const guild = await Guild.findOne({ 
        where: {
            guild_id: guild_id
        }
    });

    if (guild?.alert_channel_id) {
        alert_channel = message.guild.channels.resolve(guild.alert_channel_id);        
    }
    
    let profile = await profiles.show(guild_id, user_id);
    let text = profile.text;
    if (!text) {
        // profile = await profiles.createTextProfile(guild_id, user_id);
        text = profile.text;
        if (alert_channel) {
            alert_channel.send(`${message.member.user} ${i18next.t('Now is a part of text system')}`);
        }
    }
        
    const nextLevelExperience = text.level*20+(text.level-1)*20;
    
    updates.message_count = 1;
    updates.experience = 10;    
    
    if ((text.experience + updates.experience) >= nextLevelExperience) {
        updates.level = 1;
        updates.experience = 0;
        await profiles.update(guild_id, user_id, {
            text: {
                experience: 0
            }
        });
        if (alert_channel) {
            alert_channel.send(`${message.member.user} Now at level ${text.level+1}`);
        }
    }
        
    profiles.add(guild_id, user_id, {text: updates});
});