'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Guilds', {      
      guildId: {
        primaryKey: true,
        type: Sequelize.STRING
      },
      alertChannelId: {
        allowNull: true,
        type: Sequelize.STRING
      },
      rouletteChannelId: {
        allowNull: true,
        type: Sequelize.STRING
      },
      commandSpamChannelId: {
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
    await queryInterface.dropTable('Guilds');
  }
};