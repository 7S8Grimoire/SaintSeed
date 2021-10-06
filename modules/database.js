const log = require('log-beautify');
const Sequelize = require('sequelize');
const { sleep } = require('./helpers');

const reconnectIntervalInSec = 5;

const sequelize = new Sequelize('saintseed', 'saintseed', 'password', {
	host: 'localhost',
	dialect: 'mysql',
	logging: false,
	
});



(async () => {
    while(true) {
        try {
            await this.connection.authenticate();
            log.info(`Connection has been established successfully.`);
            break;
        } catch (err) {
            log.error(`Unable to connect to the database:, ${err}`);
            log.info(`Reconnecting in ${reconnectIntervalInSec} secs.`);
            await sleep(reconnectIntervalInSec * 1000);
        }        
    }
})()