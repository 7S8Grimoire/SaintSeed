const log = require("log-beautify");

const { Sequelize, DataTypes } = require("sequelize");
const { sleep } = require("./helpers");

const reconnectIntervalInSec = 5;

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  }
);
exports.sequelize = sequelize;

// module.exports =
(async () => {
  while (true) {
    try {
      await sequelize.authenticate();
      log.info(`Connection has been established successfully.`);
      await sequelize.sync({ force: false });
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
const VoiceRoom = sequelize.define(
  "VoiceRoom",
  {
    // Model attributes are defined here
    channel_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    guild_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    experience_per_tick: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

const Guild = sequelize.define(
  "Guild",
  {
    // Model attributes are defined here
    guild_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    alert_channel_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    roulette_channel_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    command_spam_channel_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

const Profile = sequelize.define(
  "Profile",
  {
    // Model attributes are defined here
    guild_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    text_level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    text_experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    message_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  }
);

const VoiceRole = sequelize.define(
  "VoiceRole",
  {
    guild_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    conditions: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    bonuses: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

exports.VoiceRole = VoiceRole;
exports.Profile = Profile;
exports.Guild = Guild;
exports.VoiceRoom = VoiceRoom;
