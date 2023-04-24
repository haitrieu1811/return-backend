module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.changeColumn("LikeHistories", "likeBy", {
                type: Sequelize.INTEGER,
                allowNull: true,
            }),
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.changeColumn("LikeHistories", "likeBy", {
                type: Sequelize.STRING,
                allowNull: true,
            }),
        ]);
    },
};
