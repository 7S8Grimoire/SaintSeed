import { Events, Message } from 'discord.js';
import { ApiAddData } from './../types/index.d';
import client from './client';
import { profiles } from './api';
import database from './database';

export async function processTextLevelingMessage(message: Message) {
    if (!message.guild) return;
    if (message.author.bot) return;
    
    let data: ApiAddData = {
        text: {
            experience: 0,
            level: 0,
            message_count: 0,
        }
    };

    let alert_channel = null;
    const guild_id = message.guild.id;    
    const user_id = message.author.id;
    const guild = await database.models['Guild'].findOne({ where: { guild_id: guild_id } });

    let profile = await profiles.show(guild_id, user_id);
    let text = profile.text;
    
    if (!text) {
        text = {
            level: 1,
            experience: 0,
            message_count: 0,
        };
        data.text.level = 1;
    }
        
    const nextLevelExperience = (text.level*(text.level/2+0.5))*10;
    
    data.text.message_count = 1;
    data.text.experience = 1;
    
    if ((text.experience + data.text.experience) >= nextLevelExperience) {
        data.text.level = 1;
        data.text.experience = -nextLevelExperience + data.text.experience;
    }
        
    profiles.add(guild_id, user_id, data);
};