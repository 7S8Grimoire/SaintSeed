"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VoiceRole extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  VoiceRole.init(
    {
      role_id: {
        primaryKey: true,
        type: DataTypes.STRING,
      },
      guild_id: {
        primaryKey: true,
        type: DataTypes.STRING,
      },
      conditions: DataTypes.JSON,
      bonuses: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "VoiceRole",
    }
  );
  return VoiceRole;
};
