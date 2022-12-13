'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('VNU21_FEEDBACK_DETAIL', {
      feedbackId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'VNU21_FEEDBACK_ID_D'
      },
      userId: {
        type: Sequelize.INTEGER,
        field: 'VNU21_USER_ID_D'

      },
      feedbackContent: {
        type: DataTypes.STRING,
        field: 'VNU21_FEEDBACK_CONTENT_X'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'VNU21_CREATED_AT',
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'VNU21_UPDATED_AT'

      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('VNU21_FEEDBACK_DETAIL');
  }
};