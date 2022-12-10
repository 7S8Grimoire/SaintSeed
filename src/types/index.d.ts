import { CommandInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js"

export interface Command {
  data: RESTPostAPIChatInputApplicationCommandsJSONBody  
  execute(interaction: CommandInteraction): any
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