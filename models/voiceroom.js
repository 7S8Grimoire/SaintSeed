'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VoiceRoom extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  VoiceRoom.init({
    roomId: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.STRING
    },
    guildId: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.STRING
    },
    xpPerTick: DataTypes.FLOAT,
    ownerId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'VoiceRoom',
  });
  return VoiceRoom;
};