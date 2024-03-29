import { ChatInputCommandInteraction, CommandInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js"

export interface Command {  
  disabled?: boolean,
  guilds_white_list?: string[],
  powerlist?: string[],
  permissions?: PermissionFlagsBits[],
  categories?:  string[],
  data: RESTPostAPIChatInputApplicationCommandsJSONBody  
  execute(interaction: ChatInputCommandInteraction): any
}

export interface ApiAddData {  
  user_id?: string,
  guild_id?: string,
  level?: number,
  experience?: number,
  timespent?: {
    baking?: number,
    global?: number,
  },
  text?: {
    level?: number,
    experience?: number,
    message_count?: number,
  }
}