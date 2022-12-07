const { ApplicationCommandType } = require("discord.js");
const info = require("../commands/info");

module.exports = {
  raw: true,
  categories: info.categories,
  data: {
    name: "Get info",
    type: ApplicationCommandType.User
  },
  async execute(interaction) {
    info.execute(interaction);    
  }
}