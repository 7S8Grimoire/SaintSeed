const { client } = require('./client');
const { VoiceRoom, Guild } = require('./database');
const { profiles } = require('./api');

let tickInterval = process.env.TICK_INTERVAL * 1000;

setInterval(() => {
    client.guilds.cache.forEach(guild => {
        tickGuild(guild);
        console.log(guild.name);
    });
}, tickInterval);

async function tickGuild(guild) {
    guild = await client.guilds.fetch(guild.id);
    if (!guild) return;
    const checkingGuild = await Guild.findOne({ where: { guild_id: guild.id } });
    let voiceRooms = await VoiceRoom.findAll({ where: { guild_id: guild.id } });
    voiceRooms.forEach(voiceRoom => tickVoiceRoom(voiceRoom, checkingGuild));
}

function tickVoiceRoom(voiceRoom, guild) {    
    client.channels.fetch(voiceRoom.channel_id).then(channel => {        
        channel.members.forEach(member => tickMember(guild, voiceRoom, member));
    }).catch(err => {
        console.log(err);
    });
}

async function tickMember(guild, voiceRoom, member) {    
    let profile = await profiles.show(member.guild.id, member.id);
    if (profile) {
        let experienceToAdd = voiceRoom.experience_per_tick;
        
        if (!profile.timespent) {
            profile.timespent = {};
        }

        if (!profile.timespent.global) {
            profile.timespent.global = 0;
        }

        let nextLevelExperience = (10 + profile.level) * 10 * profile.level * profile.level;
        profile.experience += experienceToAdd;
        profile.timespent.global += +process.env.TICK_INTERVAL;
                
        if (profile.experience >= nextLevelExperience) {
            profile.experience -= nextLevelExperience;
            profile.level++;
            profiles.transaction({
                from: "self",
                to: {
                    user_id: profile.user_id,
                    guild_id: profile.guild_id,
                },
                amount: 10 * profile.level,
                reason: `level up`,
            });

            if (guild?.alert_channel_id) {
                const channel = member.guild.channels.resolve(guild.alert_channel_id);
                channel.send(`${member.user} Now at level ${profile.level}`);
            }
        }
    }
    profiles.update(profile);        
}