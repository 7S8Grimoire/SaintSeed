const log = require('log-beautify');

const { Sequelize, DataTypes } = require('sequelize');
const { sleep } = require('./helpers');

const reconnectIntervalInSec = 5;

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
	host: process.env.DB_HOST,
	dialect: process.env.DB_DIALECT,
	logging: false,
});
exports.sequelize = sequelize;

// module.exports =
 (async () => {
    while(true) {
        try {
            await sequelize.authenticate();
            log.info(`Connection has been established successfully.`);
            await sequelize.sync();
            log.info("All models were synchronized successfully.");
            break;
        } catch (err) {
            log.error(`Unable to connect to the database: ${err}`);
            log.info(`Reconnecting in ${reconnectIntervalInSec} secs.`);
            await sleep(reconnectIntervalInSec * 1000);
        }        
    }
})();



/** Models */
const VoiceRoom = sequelize.define('VoiceRoom', {
    // Model attributes are defined here
    channel_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    guild_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    experience_per_tick: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: false
});

exports.VoiceRoom = VoiceRoom;