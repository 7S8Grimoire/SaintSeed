import { Model } from 'sequelize';

export default function (sequelize, DataTypes) {
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
  Guild.init(
    {
      guild_id: {
        primaryKey: true,
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Guild",
    }
  );
  return Guild;
};
