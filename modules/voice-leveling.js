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
  // guild = await client.guilds.fetch(guild.id);
  // if (!guild) return;
  // const currentGuild = await database.Guild.findOne({ where: { guildId: guild.id } });
  // console.log(currentGuild);
  // let voiceRooms = await VoiceRoom.findAll({ where: { guild_id: guild.id } });
  // voiceRooms.forEach((voiceRoom) => tickVoiceRoom(voiceRoom, checkingGuild));
}

function tickVoiceRoom(voiceRoom, guild) {
  client.channels
    .fetch(voiceRoom.channel_id)
    .then((channel) => {
      channel.members.forEach((member) => tickMember(guild, voiceRoom, member));
    })
    .catch((err) => {
      console.log(err);
    });
}

async function tickMember(guild, voiceRoom, member) {
  let data = {};
  let profile = await profiles.show(member.guild.id, member.id);
  if (profile) {
    const experienceToAdd = voiceRoom.experience_per_tick;
    const nextLevelExperience =
      (10 + profile.level) * 10 * profile.level * profile.level;

    data.experience = experienceToAdd;
    data.timespent = {
      global: +process.env.TICK_INTERVAL,
    };

    profile.experience += experienceToAdd;

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

      if (guild?.alert_channel_id) {
        const channel = member.guild.channels.resolve(guild.alert_channel_id);
        channel.send(`${member.user} Now at level ${profile.level}`);
      }
    }

		profiles.add(profile.guild_id, profile.user_id, data);
  }
}
