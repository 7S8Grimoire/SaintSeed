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
  let vRooms = await database.VoiceRoom.findAll({ where: { guild_id: guild.id } });

  vRooms.forEach((vRoom) => tickVoiceRoom(currentGuild, vRoom));
}

function tickVoiceRoom(currentGuild, vRoom) {
  vRoom.channel = currentGuild.guild.channels.cache.get(vRoom.channel_id);
  if (vRoom.channel) {
    let promises = [];
    vRoom.channel.members.forEach(member => {
      promises.push(Promise.resolve(tickMember(currentGuild, vRoom, member)));
    });
    Promise.all(promises).then((tickedMembers) => {
      if (tickedMembers.length) {
        profiles.bulkAdd(tickedMembers);
      }
    });
  }  
}

async function tickMember(currentGuild, vRoom, member) {
  let data = {};
  let profile = await profiles.show(member.guild.id, member.id);

  if (!profile) return;

  data.user_id = member.id;
  data.guild_id = member.guild.id;

  const experienceToAdd = vRoom.xp_per_tick;
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

    processVoiceRole(member, profile.level);

    if (currentGuild?.alert_channel_id) {
      const channel = member.guild.channels.resolve(currentGuild.alert_channel_id);
      channel.send(`${member.user} Now at level ${profile.level}`);
    }
  }

  return data;
}

async function processVoiceRole(member, level) {
  let vRoles = await database.VoiceRole.findAll({ where: { guild_id: member.guild.id } });
  let vRolesToAdd = vRoles.filter(vRole => vRole.conditions?.addOnLevel == level);
  let vRolesToRemove = vRoles.filter(vRole => vRole.conditions?.removeOnLevel == level);
  
  vRolesToAdd.forEach(vRole => {
    member.roles.add(vRole.role_id);
  });

  vRolesToRemove.forEach(vRole => {
    member.roles.remove(vRole.role_id);
  });
}