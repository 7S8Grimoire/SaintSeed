'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('voice_rooms', {
      channel_id: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.STRING
      },
      guild_id: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.STRING
      },
      xp_per_tick: {
        type: Sequelize.FLOAT
      },
      owner_id: {
        allowNull: true,
        type: Sequelize.STRING
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('voice_rooms');
  }
};