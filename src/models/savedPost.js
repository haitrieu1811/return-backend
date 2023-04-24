"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class SavedPost extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    SavedPost.init(
        {
            userId: DataTypes.INTEGER,
            postId: DataTypes.INTEGER,
            status: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "SavedPost",
        }
    );
    return SavedPost;
};
