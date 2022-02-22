'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('VoiceLevels', {      
      guildId: {
        primaryKey: true,
        type: Sequelize.STRING
      },
      roleId: {
        primaryKey: true,
        type: Sequelize.STRING
      },
      conditions: {
        allowNull: true,
        type: Sequelize.JSON
      },
      bonuses: {
        allowNull: true,
        type: Sequelize.JSON
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
    await queryInterface.dropTable('VoiceLevels');
  }
};