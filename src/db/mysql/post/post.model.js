import { version } from "mongoose";
import { DataTypes, Model } from "sequelize";

export class Post extends Model { }

export function initializePostModel(sequelize) {
    Post.init(
        {
            post_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            posted_by_user_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            posted_by_org_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            visible: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            }
        },
        {
            sequelize,
            modelName: "Post",
            tableName: "post",
            indexes: [],
        }
    )

    return Post;
}

/**
 * & How to update a table
 * ? Step 01: Do the table related code changes
 * ? Step 02: In table model file update it's version info object details properly
 * ? Step 03: Change databaseTableUpdateFlag to true and tablesUpdateFlags of that particular table to true in /src/db/mysql/index.js file
 * ? Step 04: Change databaseTableUpdateFlag to false and tablesUpdateFlags of that particular table to false in /src/db/mysql/index.js file
 * & That's it your table related changes are completed.
 */
export const postVersionInfo = Object.freeze({
    version: "1.1.2",
    description: "Removing delete_at and replacing with visible boolean column",
    updated_by: "sonu.ind.dev@gmail.com",
    approved_by: "",
})