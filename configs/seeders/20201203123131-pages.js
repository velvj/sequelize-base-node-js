'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   return await queryInterface.bulkInsert('RSU07_PAGES', [
    {
      RSU07_TITLE_X: "Terms and conditions",
      RSU07_STATUS: "ACTIVE"
    },
    {
      RSU07_TITLE_X: "Privacy policy",
      RSU07_STATUS: "ACTIVE"
    },
    {
      RSU07_TITLE_X: "Contact Us",
      RSU07_STATUS: "ACTIVE"
    },
    {
      RSU07_TITLE_X: "How to use app",
      RSU07_STATUS: "ACTIVE"
    },
    {
      RSU07_TITLE_X: "Home Screen banner image",
      RSU07_STATUS: "ACTIVE"
    },
    {
      RSU07_TITLE_X: "About Us",
      RSU07_STATUS: "ACTIVE"
    },
    {
      RSU07_TITLE_X: "FAQ's",
      RSU07_STATUS: "ACTIVE"
    },
    {
      RSU07_TITLE_X: "Support ",
      RSU07_STATUS: "ACTIVE"
    }
  ], {});
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('RSU07_PAGES', null, {});
  }
};
