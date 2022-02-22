'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('VoiceRooms', {
      roomId: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.STRING
      },
      guildId: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.STRING
      },
      xpPerTick: {
        type: Sequelize.FLOAT
      },
      ownerId: {
        allowNull: true,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('VoiceRooms');
  }
};