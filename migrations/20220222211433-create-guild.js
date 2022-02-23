'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('guilds', {      
      guild_id: {
        primaryKey: true,
        type: Sequelize.STRING
      },
      alert_channel_id: {
        allowNull: true,
        type: Sequelize.STRING
      },
      roulette_channel_id: {
        allowNull: true,
        type: Sequelize.STRING
      },
      command_spam_channel_id: {
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
    await queryInterface.dropTable('guilds');
  }
};