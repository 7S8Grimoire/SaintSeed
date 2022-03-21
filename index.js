require('dotenv').config();

global._ = require('lodash');
global.botLaunchedAt = require("moment")().format("YYYY-MM-DD HH:mm:ss");

(async () => {
    const { client } = await require('./modules');
    
    client.login(process.env.BOT_TOKEN);
})();