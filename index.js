require('dotenv').config();

(async () => {
    const { client } = await require('./modules');
    
    client.login(process.env.BOT_TOKEN);
})();