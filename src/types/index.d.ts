import { CommandInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js"

export interface Command {
  data: RESTPostAPIChatInputApplicationCommandsJSONBody  
  execute(interaction: CommandInteraction): any
}