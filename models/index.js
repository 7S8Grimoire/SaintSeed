"use strict";

const { sleep } = require('../modules/helpers');

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

let sequelize;
db.isConnected = false;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

(async () => {
  const reconnectIntervalInSec = process.env.DB_RECONNECT_INTERVAL;
  while(true) {
      try {
          await sequelize.authenticate();
          console.log(`Connection has been established successfully.`);
          db.isConnected = true;
          break;
      } catch (err) {
          console.error(`Unable to connect to the database:, ${err}`);
          console.log(`Reconnecting in ${ reconnectIntervalInSec } secs.`);
          await sleep(reconnectIntervalInSec * 1000);
      }        
  }
})();

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
