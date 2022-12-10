import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import { executeCommand, loadCommands } from "./commands";
import { initLogger } from "./logger";
import { processTextLevelingMessage } from "./text-leveling";
import { executeVoiceLeveling } from "./voice-leveling";

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

client.once(Events.ClientReady, () => {
    console.log(`${client.user.tag} has logged in successfully!`);
    console.log(`Ready to serve on ${client.guilds.cache.size} servers, for ${client.users.cache.size} users.`);
    loadCommands();
    executeVoiceLeveling();
    initLogger();
});

client.on(Events.InteractionCreate, async (interaction) => {
    executeCommand(interaction);
});

client.on(Events.MessageCreate, async (message) => {
    processTextLevelingMessage(message);
});

export default client;