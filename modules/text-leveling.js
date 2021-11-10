const { client } = require('./client');
const { Profile, Guild } = require('./database');

client.on('messageCreate', async message => {    
    if (!message.guild) return;
    if (message.author.bot) return;    
        
    let [profile, created] = await Profile.findOrCreate({
        where: { guild_id: message.guild.id, user_id: message.member.id }        
    });

    profile.message_count++;
    profile.text_experience++;

    let nextLevelExperience = profile.text_level*20+(profile.text_level-1)*20;
    
    if (profile.text_experience >= nextLevelExperience) {
        profile.text_experience -= nextLevelExperience;
        profile.text_level++;

        const guild = await Guild.findOne({ where: { guild_id: message.guild.id } });
        if (guild?.alert_channel_id) {
            const channel = message.guild.channels.resolve(guild.alert_channel_id);
            channel.send(`${message.member.user} Now at level ${profile.text_level}`);
        }
    }

    
    profile.save();
    
    
});