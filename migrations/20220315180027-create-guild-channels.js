'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('guild_channels', {
      channel_id: {
        primaryKey: true,
        type: Sequelize.DataTypes.STRING,
      },
      guild_id: {
        primaryKey: true,
        type: Sequelize.DataTypes.STRING,
      },
      category: {
        primaryKey: true,
        type: Sequelize.DataTypes.STRING,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('guild_channels');
  }
};
