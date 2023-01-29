import { ApiAddData } from './../types/index.d';
import client from "./client";
import { profiles } from "./api";
import database from './database';
import i18next from "i18next";
import { Op } from "sequelize";

let tickInterval = +process.env.TICK_INTERVAL * 1000;


export function executeVoiceLeveling() {
  setInterval(() => {
    if (database.isConnected && process.env.REST_BASE_URL) {
      client.guilds.cache.forEach((guild) => {
        tickGuild(guild);
      });
    }
  }, tickInterval);
}

async function tickGuild(guild) {
  const currentGuild = await database.models['Guild'].findOne({ where: { guild_id: guild.id } });
  if (!currentGuild) return;

  currentGuild.guild = guild;
  let vRooms = await database.models['VoiceRoom'].findAll({ where: { guild_id: guild.id } });

  let profileTree = await profiles.showGuildTree(guild.id);

  vRooms.forEach((vRoom) => tickVoiceRoom(currentGuild, vRoom, profileTree));
}

function tickVoiceRoom(currentGuild, vRoom, profileTree) {
  vRoom.channel = currentGuild.guild.channels.cache.get(vRoom.channel_id);
  if (vRoom.channel) {
    let promises = [];
    vRoom.channel.members.forEach(member => {
      promises.push(Promise.resolve(tickMember(currentGuild, vRoom, member, profileTree)));
    });
    Promise.all(promises).then((tickedMembers) => {
      if (tickedMembers.length) {
        profiles.bulkAdd(tickedMembers);
      }
    });
  }  
}

async function tickMember(currentGuild, vRoom, member, profileTree) {
  let data: ApiAddData = {};
  let profile = profileTree[member.id];
  if(!profile) profile = await profiles.create(currentGuild.guild.id, member.id);

  if (!profile) return;
  if (profile.isNew) {
    assignVoiceRole(member, profile.level);
  }

  data.user_id = member.id;
  data.guild_id = member.guild.id;

  const experienceToAdd = vRoom.xp_per_tick;
  const nextLevelExperience = (10 + profile.level) * 10 * profile.level * profile.level;


  data.experience = experienceToAdd;
  data.timespent = {
    global: +process.env.TICK_INTERVAL,
    baking: 0
  };
  
  await processVoiceRole(member, data);
  
  profile.experience += experienceToAdd;
  profile.timespent.baking += data.timespent.baking;
  
  // level up
  if (profile.experience >= nextLevelExperience) {
    data.level = 1;
    data.experience = -nextLevelExperience + experienceToAdd;
          
    profiles.transaction({
      from: "self",
      to: {
        user_id: profile.user_id,
        guild_id: profile.guild_id,
      },
      amount: 1000 * ++profile.level,
      reason: `level up`,
    });    

    assignVoiceRole(member, profile.level);    
    

    const aChannels = await database.models['GuildChannel'].findAll({
      where: {
        guild_id: member.guild.id,
        category: 'alert',
      }
    });

    // Alert channels processing
    aChannels.forEach(aChannel => {
      const channel = member.guild.channels.cache.get(aChannel.channel_id);
      if (channel) {
        channel.send(i18next.t(`level.up`, { who: member.user, level: profile.level }));
      }
    });
  }

  const timeToPayday = 1 * 60 * 60;
  if (profile.timespent.baking >= timeToPayday) {
    data.timespent.baking = -timeToPayday + data.timespent.baking;
    profiles.transaction({
      from: "self",
      to: {
        user_id: profile.user_id,
        guild_id: profile.guild_id,
      },
      amount: 10 * profile.level,
      reason: `Baking`,
    });
  }

  return data;
}

async function assignVoiceRole(member, level) {
  let vRoles = await database.models['VoiceRole'].findAll({ where: { guild_id: member.guild.id } });
  let vRolesToAdd = vRoles.filter(vRole => vRole.conditions?.addOnLevel == level);
  let vRolesToRemove = vRoles.filter(vRole => vRole.conditions?.removeOnLevel == level);
  
  vRolesToAdd.forEach(vRole => {
    member.roles.add(vRole.role_id);
  });

  vRolesToRemove.forEach(vRole => {
    member.roles.remove(vRole.role_id);
  });
}

async function processVoiceRole(member, data) {  
  const member_roles_ids = member.roles.cache.map(role => role.id);
  let vRoles = await database.models['VoiceRole'].findAll({ 
    where: {
      guild_id: member.guild.id,
      role_id: {
        [Op.in]: member_roles_ids
      }
    } 
  });
  vRoles.forEach(vRole => {
    if (vRole.bonuses?.baking) {
      data.timespent.baking += +process.env.TICK_INTERVAL;
    }
  });  
}