const { Collection } = require('discord.js');
const { client } = require('./client');
const fs = require('fs');
const log = require('log-beautify');

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];
client.commands = new Collection();


for (const file of commandFiles) {
	const command = require(`../commands/${file}`);
	if (command.raw) {
		commands.push(command.data);
	} else {
		commands.push(command.data.toJSON());
	}	
	client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {		
		log.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

exports.commands = commands;