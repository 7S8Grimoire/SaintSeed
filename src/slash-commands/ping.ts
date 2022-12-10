import { SlashCommandBuilder } from 'discord.js';
import { Command } from './../types/index.d';
export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('get ping from bot')
    .toJSON(),
  execute(interaction) {
    interaction.reply('pong!');
  }
} as Command;