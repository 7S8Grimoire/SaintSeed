import { Client, Intents, Collection } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

import log from 'log-beautify';
import moment from 'moment';

export const launchedAt = moment().format("YYYY-MM-DD HH:mm:ss");
export const client = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

// let { commands } = require('./commands');

client.once('ready', () => {
    log.info(`${client.user.tag} has logged in successfully!`);
    log.info(`Ready to serve on ${client.guilds.cache.size} servers, for ${client.users.cache.size} users.`);
    // client.guilds.cache.forEach(guild => {        
    //     rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), { body: commands })
    //         .then(() => {
    //             log.info(`Successfully registered application commands (${commands.length}) for guild ${guild.name} (${guild.id}).`)
    //         })
    //         .catch(error => {
    //             console.error(error)
    //         });
    // });
});
