import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import { findCommand, loadCommands } from "./commands";

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

client.once('ready', () => {
    console.log(`${client.user.tag} has logged in successfully!`);
    console.log(`Ready to serve on ${client.guilds.cache.size} servers, for ${client.users.cache.size} users.`);
    loadCommands();
});

client.on("interactionCreate", async (interaction) => {
    /* Check is interaction - command */
    if (!interaction.isCommand()) return;    
    
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
});

export default client;