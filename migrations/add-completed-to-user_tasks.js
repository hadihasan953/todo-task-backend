"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("user_tasks", "completed", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: "Whether the assigned user has completed the task"
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("user_tasks", "completed");
    }
};
