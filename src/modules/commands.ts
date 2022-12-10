import { CacheType, Interaction, Routes } from 'discord.js';
import { Command } from './../types/index.d';
import glob from "glob" // included by discord.js
import { promisify } from "util" // Included by default
import { REST } from 'discord.js';
import client from './client';

// Make `glob` return a promise
const globPromise = promisify(glob)
const commands: Command[] = []

export async function loadCommands() {
  const commandFiles = await globPromise(`${__dirname}/../slash-commands/*.{js,ts}`);

  for (const file of commandFiles) {
    const command: Command = (await import(file)).default;
    commands.push(command);
  }
  
  const rest = new REST({ version: '10' }).setToken(client.token);  
  client.guilds.cache.forEach(guild => {
    rest.put(
      Routes.applicationGuildCommands(client.user.id, guild.id),
      { body: commands.map(command => command.data) }
    )
    .then(() => {
      console.log(`Successfully registered application commands (${commands.length}) for guild ${guild.name} (${guild.id}).`)
    })
  });
}

export function findCommand(commandName: string) {
    const command = commands.find(command => command.data.name === commandName);
    return command;
}

export async function executeCommand(interaction: Interaction<CacheType>) {
  /* Check is interaction - command */
  if (!interaction.isChatInputCommand()) return;    
    
  const command = findCommand(interaction.commandName);

  if (command) {
      try {
          await command.execute(interaction);
      } catch (error) {
          console.error(error);
          await interaction.reply({
              content: "There was an error while executing this command!",
              ephemeral: true,                
          })
      }
  } else {
      await interaction.reply({
          content: "Command not found",
          ephemeral: true,
      });
  }
}