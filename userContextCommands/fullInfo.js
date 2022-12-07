const { ApplicationCommandType } = require("discord.js");
const fullInfo = require("../commands/fullInfo");

module.exports = {
  raw: true,
  categories: fullInfo.categories,
  data: {
    name: "Get full info",
    type: ApplicationCommandType.User
  },
  async execute(interaction) {
    fullInfo.execute(interaction);    
  }
}