const { codeBlock, bold, quote } = require('@discordjs/builders');
const { Events, AuditLogEvent } = require('discord.js');
const { client } = require('./client');

/* Message delete */
client.on(Events.MessageDelete, message => {  
  if (message.author.bot || message.author.system) return;

  const deletedContent = codeBlock('diff', `-${message.content}`);
  message.channel.send(`${bold(message.author.tag)} (ID: ${message.author.id}) deleted message (ID: ${message.id}): ${deletedContent}`);
});

/* Message update */
client.on(Events.MessageUpdate, (oldMessage, newMessage) => {
  if (oldMessage.author.bot || oldMessage.author.system) return;

  const updatedContent = codeBlock('diff', [`-${oldMessage.content}`,`+${newMessage.content}`].join('\n'));
  newMessage.channel.send(`${bold(newMessage.author.tag)} (ID: ${newMessage.author.id}) updated message (ID: ${newMessage.id}): ${updatedContent}`);
});

/* Member join listening */
client.on(Events.GuildMemberAdd, member => {
  member.guild.channels.cache.get("612982200425644052")
    .send(`${bold(member.user.tag)} (ID: ${member.id}) just joined to server.`);
});

/* Member left listening */
client.on(Events.GuildMemberRemove, async member => {
  /* Kick detection */
  const fetchedLogs = await member.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MemberKick,
  });

  const kickLog = fetchedLogs.entries.first();

  if (!kickLog) {
    member.guild.channels.cache.get("612982200425644052")
    .send(`${bold(member.user.tag)} (ID: ${member.id}) just left from server.`);
  } else {
    const { executor, target } = kickLog;
    if (target.id === member.id) {        
      member.guild.channels.cache.get("612982200425644052")
        .send(`${bold(member.user.tag)} (ID: ${member.id}) has been kicked from server by ${bold(executor.tag)} (ID: ${executor.id}). ${kickLog.reason ? `Reason: ${codeBlock(kickLog.reason)}` : ''}`);
    } else {
      member.guild.channels.cache.get("612982200425644052")
        .send(`${bold(member.user.tag)} left the server, audit log fetch was inconclusive.`);
    }
  }
});

/* Ban listening */
client.on(Events.GuildBanAdd, async ban => {
  const fetchedLogs = await ban.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MemberBanAdd,
  });

  const banLog = fetchedLogs.entries.first();

  ban.guild.channels.cache.get("612982200425644052")
    .send(`${bold(ban.user.tag)} (ID: ${ban.user.id}) has been banned by ${bold(banLog.executor.tag)} (ID: ${banLog.executor.id}). ${banLog.reason ? `Reason: ${codeBlock(banLog.reason)}` : ''}`)
});

/* Pardon listening */
client.on(Events.GuildBanRemove, async ban => {
  const fetchedLogs = await ban.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MemberBanAdd,
  });

  const banLog = fetchedLogs.entries.first();

  ban.guild.channels.cache.get("612982200425644052")
    .send(`${bold(ban.user.tag)} (ID: ${ban.user.id}) has been pardoned (unbanned) by ${bold(banLog.executor.tag)} (ID: ${banLog.executor.id}).`)
});