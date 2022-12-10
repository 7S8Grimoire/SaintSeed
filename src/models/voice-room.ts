import { Model } from 'sequelize';

export default function (sequelize, DataTypes) {
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
  VoiceRoom.init(
    {
      channel_id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.STRING,
      },
      guild_id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.STRING,
      },
      xp_per_tick: DataTypes.FLOAT,
      owner_id: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "VoiceRoom",
    }
  );
  return VoiceRoom;
};
