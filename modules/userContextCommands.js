const { Collection } = require("discord.js");
const { client } = require("./client");
const fs = require("fs");

const commandFiles = fs
  .readdirSync("./userContextCommands")
  .filter((file) => file.endsWith(".js"));
const commands = [];
client.userContextCommands = new Collection();

for (const file of commandFiles) {
  const command = require(`../userContextCommands/${file}`);
	if (command.disabled) {
		continue;
	}  
  if (command.raw) {
    commands.push(command.data);
  } else {
    commands.push(command.data.toJSON());
  }
  client.userContextCommands.set(command.data.name, command);
}

exports.commands = commands;
