import { CacheType, Interaction, Routes } from "discord.js";
import { Command } from "./../types/index.d";
import glob from "glob"; // included by discord.js
import { promisify } from "util"; // Included by default
import { REST } from "discord.js";
import client from "./client";
import i18next from "i18next";
import database from "./database";

// Make `glob` return a promise
const globPromise = promisify(glob);
const commands: Command[] = [];

export async function loadCommands() {
	const commandFiles = await globPromise(
		`${__dirname}/../slash-commands/*.{js,ts}`
	);

	for (const file of commandFiles) {
		const command: Command = (await import(file)).default;
		commands.push(command);
	}

	const rest = new REST({ version: "10" }).setToken(client.token);
	client.guilds.cache.forEach((guild) => {
		/* Filtering allowed guilds */
		const guild_commands = commands
			.filter((command) => {
				if (!command.guilds_white_list) return true;
				return command.guilds_white_list.includes(guild.id);
			})
			.map((command) => command.data);

		rest
			.put(Routes.applicationGuildCommands(client.user.id, guild.id), {
				body: guild_commands,
			})
			.then(() => {
				console.log(
					`Successfully registered application commands (${commands.length}) for guild ${guild.name} (${guild.id}).`
				);
			});
	});
}

export function findCommand(commandName: string) {
	const command = commands.find((command) => command.data.name === commandName);
	return command;
}

export async function executeCommand(interaction: Interaction<CacheType>) {
	/* Check is interaction - command */
	if (!interaction.isChatInputCommand()) return;

	const command = findCommand(interaction.commandName);

	if (command) {
		/* Check has user a power to use this commands */
		const isPowered = command.powerlist?.includes(interaction.user.id);
		const isOwner = process.env.BOT_OWNERS.split(",").includes(
			interaction.user.id
		);
		const hasPowerPermissions = isPowered || isOwner;

		/* Validate user permissions */
		if (command.permissions?.length && !hasPowerPermissions) {
			const hasPermission = interaction.memberPermissions.has(
				command.permissions
			);
			if (!hasPermission) {
				await interaction.reply({
					content: i18next.t(`commands.noPermissions`),
					ephemeral: true,
				});
				return;
			}
		}

		/* Validate channel category */    
		if (command.categories?.length && !hasPowerPermissions) {
			const commandAvailableChannels = await database.models[
				"GuildChannel"
			].findAll({
				where: {
					guild_id: interaction.guildId,
					category: command.categories,
				},
			});
			if (commandAvailableChannels.length) {
				const isCategorized = commandAvailableChannels.some(
					(channel) => channel.channel_id == interaction.channelId
				);
				const channelsReferences = commandAvailableChannels.map(
					(channel) => `<#${channel.channel_id}>`
				);
				if (!isCategorized) {
					await interaction.reply({
						content: i18next.t(`commands.incorrectCategoryChannel`, {
							channels: channelsReferences.join(
								i18next.t("commands.incorrectCategoryChannelOr")
							),
						}),
						ephemeral: true,
					});
					// await interaction.reply({ content: `Go here: ${channelsReferences.join(' or ')}`, ephemeral: true });
					return;
				}
			}
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: "There was an error while executing this command!",
				ephemeral: true,
			});
		}
	} else {
		await interaction.reply({
			content: "Command not found",
			ephemeral: true,
		});
	}
}
