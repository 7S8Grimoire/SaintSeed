const log = require('log-beautify');
const Sequelize = require('sequelize');
const { sleep } = require('./helpers');

const reconnectIntervalInSec = 5;

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
	host: process.env.DB_HOST,
	dialect: process.env.DB_DIALECT,
	logging: false,
	
});

(async () => {
    while(true) {
        try {
            await sequelize.authenticate();
            log.info(`Connection has been established successfully.`);
            break;
        } catch (err) {
            log.error(`Unable to connect to the database:, ${err}`);
            log.info(`Reconnecting in ${reconnectIntervalInSec} secs.`);
            await sleep(reconnectIntervalInSec * 1000);
        }        
    }
})();