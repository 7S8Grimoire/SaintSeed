'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('voice_roles', {      
      guild_id: {
        primaryKey: true,
        type: Sequelize.STRING
      },
      role_id: {
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
    await queryInterface.dropTable('voice_roles');
  }
};