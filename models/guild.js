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
    guildId: {
      primaryKey: true,
      type: DataTypes.STRING
    },
    alertChannelId: {
      allowNull: true,
      type: DataTypes.STRING
    },
    rouletteChannelId: {
      allowNull: true,
      type: DataTypes.STRING
    },
    commandSpamChannelId: {
      allowNull: true,
      type: DataTypes.STRING
    },
    commandSpamChannelId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Guild',
  });
  return Guild;
};