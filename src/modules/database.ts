import { sleep } from '../helpers';
import { Sequelize, DataTypes } from 'sequelize';
import configs from '../config/config.json';
import models from '../models';

const env = process.env.NODE_ENV || "development";
const config = configs[env];
const db = {
  isConnected: false,
  sequelize: null,
  Sequelize: null,
  models: [],
};

let sequelize;

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

models.forEach(model => {
  const modelInstance = model(sequelize, DataTypes);
  db.models[modelInstance.name] = modelInstance;  
});

Object.keys(db.models).forEach((modelName) => {    
  if (db.models[modelName].associate) {
    db.models[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export async function connectDatabase() {
  const reconnectIntervalInSec: number = +process.env.DB_RECONNECT_INTERVAL;
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
};

export default db;
