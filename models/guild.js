'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Guild extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Guild.init({
    guild_id: {
      primaryKey: true,
      type: DataTypes.STRING
    },
    alert_channel_id: {
      allowNull: true,
      type: DataTypes.STRING
    },
    roulette_channel_id: {
      allowNull: true,
      type: DataTypes.STRING
    },
    command_spam_channel_id: {
      allowNull: true,
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    modelName: 'Guild',
  });
  return Guild;
};