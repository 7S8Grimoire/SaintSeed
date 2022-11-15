const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const log = require('log-beautify');


const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages
    ]
});
exports.client = client;

const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

let { commands } = require('./commands');
require('./events');

client.once('ready', () => {
    log.info(`${client.user.tag} has logged in successfully!`);
    log.info(`Ready to serve on ${client.guilds.cache.size} servers, for ${client.users.cache.size} users.`);
    client.guilds.cache.forEach(guild => {        
        rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), { body: commands })
            .then(() => {
                log.info(`Successfully registered application commands (${commands.length}) for guild ${guild.name} (${guild.id}).`)
            })
            .catch(error => {
                console.error(error)
            });
    });
});
