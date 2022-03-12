const { client } = require("./client");
const { profiles } = require("./api");
const database = require('../models');

let tickInterval = process.env.TICK_INTERVAL * 1000;

setInterval(() => {  
  client.guilds.cache.forEach((guild) => {
    tickGuild(guild);
  });
}, tickInterval);

async function tickGuild(guild) {
  const currentGuild = await database.Guild.findOne({ where: { guild_id: guild.id } });
  if (!currentGuild) return;

  currentGuild.guild = guild;
  let voiceRooms = await database.VoiceRoom.findAll({ where: { guild_id: guild.id } });

  voiceRooms.forEach((voiceRoom) => tickVoiceRoom(currentGuild, voiceRoom));
}

function tickVoiceRoom(currentGuild, voiceRoom) {
  voiceRoom.channel = currentGuild.guild.channels.cache.get(voiceRoom.channel_id);
  if (voiceRoom.channel) {
    voiceRoom.channel.members.forEach(member => {
      tickMember(currentGuild, voiceRoom, member);
    });
  }
  // client.channels
  //   .fetch(voiceRoom.channel_id)
  //   .then((channel) => {
  //     channel.members.forEach((member) => tickMember(guild, voiceRoom, member));
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
}

async function tickMember(currentGuild, voiceRoom, member) {
  // console.log(`${member.guild.name} | ${voiceRoom.channel.name} | ${member.displayName} | +${voiceRoom.xp_per_tick}`);
  let data = {};
  let profile = await profiles.show(member.guild.id, member.id);

  if (!profile) return;

  const experienceToAdd = voiceRoom.xp_per_tick;
  const nextLevelExperience = (10 + profile.level) * 10 * profile.level * profile.level;


  data.experience = experienceToAdd;
  data.timespent = {
    global: +process.env.TICK_INTERVAL,
  };

  
  profile.experience += experienceToAdd;

  // level up
  if (profile.experience >= nextLevelExperience) {
    data.level = 1;
    data.experience = -nextLevelExperience+experienceToAdd;
          
    profiles.transaction({
      from: "self",
      to: {
        user_id: profile.user_id,
        guild_id: profile.guild_id,
      },
      amount: 10 * ++profile.level,
      reason: `level up`,
    });

    if (currentGuild?.alert_channel_id) {
      const channel = member.guild.channels.resolve(currentGuild.alert_channel_id);
      channel.send(`${member.user} Now at level ${profile.level}`);
    }
  }

  profiles.add(profile.guild_id, profile.user_id, data);
}