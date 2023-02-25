import {
	Events,
	AuditLogEvent,
	codeBlock,
	bold,
	Client,
	spoiler,
} from "discord.js";
import { formatBytes } from "../helpers";
import client from "./client";

export function initLogger() {
	/* Message delete */
	client.on(Events.MessageDelete, (message) => {
		/* WIP */
		if (!message.channel.isTextBased() || message.channel.isDMBased()) return;
		if (message.guild.id != process.env.LOGGING_SERVER) return;
		if (message.author.bot || message.author.system) return;

		let deletedContent = codeBlock("diff", `-${message.content}`);
		if (message.attachments.size) {
			let deletedAttachments = message.attachments.map((attachment) => {
				return `${attachment.name} 
					- ${spoiler(attachment.url)}
					- (${formatBytes(attachment.size, 2)}) (${attachment.contentType})`;
			});
			deletedContent += deletedAttachments.join("\n");
		}
		const channel = message.guild.channels.cache.get(
			process.env.LOGGING_CHANNEL
		);
		if (!channel?.isTextBased()) return;

		channel.send(
			`${bold(message.author.tag)} (ID: ${
				message.author.id
			}) deleted message (ID: ${message.id}) in ${bold(
				message.channel.name
			)} channel (ID: ${message.channelId}) ${deletedContent}`
		);
	});

	/* Message update */
	client.on(Events.MessageUpdate, (oldMessage, newMessage) => {
		/* WIP */
		if (!oldMessage.channel.isTextBased() || oldMessage.channel.isDMBased())
			return;
		if (oldMessage.content == newMessage.content) return;
		if (oldMessage.guild.id != process.env.LOGGING_SERVER) return;
		if (oldMessage.author.bot || oldMessage.author.system) return;

		const updatedContent = codeBlock(
			"diff",
			[`-${oldMessage.content}`, `+${newMessage.content}`].join("\n")
		);
		const channel = oldMessage.guild.channels.cache.get(
			process.env.LOGGING_CHANNEL
		);
		if (!channel?.isTextBased()) return;
		channel.send(
			`${bold(newMessage.author.tag)} (ID: ${
				newMessage.author.id
			}) updated message (ID: ${newMessage.id}) in ${bold(
				oldMessage.channel.name
			)} channel (ID: ${oldMessage.channelId}) ${updatedContent}`
		);
	});

	/* Member join listening */
	client.on(Events.GuildMemberAdd, (member) => {
		/* WIP */
		if (member.guild.id != process.env.LOGGING_SERVER) return;

		const channel = member.guild.channels.cache.get(
			process.env.LOGGING_CHANNEL
		);
		if (!channel?.isTextBased()) return;

		channel.send(
			`${bold(member.user.tag)} (ID: ${member.id}) just joined to server.`
		);
	});

	/* Member left listening */
	client.on(Events.GuildMemberRemove, async (member) => {
		/* WIP */
		if (member.guild.id != process.env.LOGGING_SERVER) return;

		/* Kick detection */
		const fetchedLogs = await member.guild.fetchAuditLogs({
			limit: 1,
			type: AuditLogEvent.MemberKick,
		});

		const kickLog = fetchedLogs.entries.first();
		const channel = member.guild.channels.cache.get(
			process.env.LOGGING_CHANNEL
		);
		if (!channel?.isTextBased()) return;

		if (!kickLog) {
			channel.send(
				`${bold(member.user.tag)} (ID: ${member.id}) just left from server.`
			);
		} else {
			const { executor, target } = kickLog;
			if (target.id === member.id) {
				channel.send(
					`${bold(member.user.tag)} (ID: ${
						member.id
					}) has been kicked from server by ${bold(executor.tag)} (ID: ${
						executor.id
					}). ${kickLog.reason ? `Reason: ${codeBlock(kickLog.reason)}` : ""}`
				);
			} else {
				channel.send(
					`${bold(
						member.user.tag
					)} left the server, audit log fetch was inconclusive.`
				);
			}
		}
	});

	/* Ban listening */
	client.on(Events.GuildBanAdd, async (ban) => {
		/* WIP */
		if (ban.guild.id != process.env.LOGGING_SERVER) return;

		const fetchedLogs = await ban.guild.fetchAuditLogs({
			limit: 1,
			type: AuditLogEvent.MemberBanAdd,
		});

		const banLog = fetchedLogs.entries.first();

		const channel = ban.guild.channels.cache.get(process.env.LOGGING_CHANNEL);
		if (!channel?.isTextBased()) return;

		channel.send(
			`${bold(ban.user.tag)} (ID: ${ban.user.id}) has been banned by ${bold(
				banLog.executor.tag
			)} (ID: ${banLog.executor.id}). ${
				banLog.reason ? `Reason: ${codeBlock(banLog.reason)}` : ""
			}`
		);
	});

	/* Pardon listening */
	client.on(Events.GuildBanRemove, async (ban) => {
		/* WIP */
		if (ban.guild.id != process.env.LOGGING_SERVER) return;

		const fetchedLogs = await ban.guild.fetchAuditLogs({
			limit: 1,
			type: AuditLogEvent.MemberBanAdd,
		});

		const banLog = fetchedLogs.entries.first();

		const channel = ban.guild.channels.cache.get(process.env.LOGGING_CHANNEL);
		if (!channel?.isTextBased()) return;

		channel.send(
			`${bold(ban.user.tag)} (ID: ${
				ban.user.id
			}) has been pardoned (unbanned) by ${bold(banLog.executor.tag)} (ID: ${
				banLog.executor.id
			}).`
		);
	});
}
