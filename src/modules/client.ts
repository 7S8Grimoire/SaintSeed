import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import log from 'log-beautify';

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildBans,        
    ]
});
exports.client = client;

const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

let { commands } = require('./commands');
let { commands: userContextCommands } = require('./userContextCommands');

const commandLibrary = commands.concat(userContextCommands);

require('./events');

client.once('ready', () => {
    log.info(`${client.user.tag} has logged in successfully!`);
    log.info(`Ready to serve on ${client.guilds.cache.size} servers, for ${client.users.cache.size} users.`);
    client.guilds.cache.forEach(guild => {
        const guildCommands = commandLibrary.filter(command => !command.guilds_white_list || command.guilds_white_list.includes(guild.id));        
        rest.put(
            Routes.applicationGuildCommands(client.user.id, guild.id),
            { body: guildCommands }
        )
        .then(() => {
            log.info(`Successfully registered application commands (${guildCommands.length}) for guild ${guild.name} (${guild.id}).`)
        })
        .catch(error => {
            console.error(error)
        });
    });
});
