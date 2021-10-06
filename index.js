require('dotenv').config();
const { client } = require('./modules');
client.login(process.env.BOT_TOKEN);