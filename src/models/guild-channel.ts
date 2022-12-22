import { Model } from 'sequelize';

export default function (sequelize, DataTypes) {
  class GuildChannel extends Model {
    static associate(models) {
      // define association here
    }
  }
  GuildChannel.init(
    {
      channel_id: {
        primaryKey: true,
        type: DataTypes.STRING,
      },
      guild_id: {
        primaryKey: true,
        type: DataTypes.STRING,
      },
      category: {
        type: DataTypes.STRING,
      }
    },
    {
      sequelize,
      modelName: "GuildChannel",
    }
  );
  return GuildChannel;
};
