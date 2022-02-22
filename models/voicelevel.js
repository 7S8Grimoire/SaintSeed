'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VoiceLevel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  VoiceLevel.init({
    roomId: {
      primaryKey: true,
      type: DataTypes.STRING
    },
    guildId: {
      primaryKey: true,
      type: DataTypes.STRING
    },
    conditions: DataTypes.JSON,
    bonuses: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'VoiceLevel',
  });
  return VoiceLevel;
};