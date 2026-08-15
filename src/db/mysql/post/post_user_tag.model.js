import { DataTypes, Model } from "sequelize";

export class PostUserTag extends Model { }

export function initializePostUserTagModel(sequelize) {
    PostUserTag.init(
        {
            post_user_tag_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            post_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
            }
        },
        {
            sequelize,
            modelName: "PostUserTag",
            tableName: "post_user_tag",
            indexes: [],
        }
    )

    return PostUserTag;
}

/**
 * & How to update a table
 * ? Step 01: Do the table related code changes
 * ? Step 02: In table model file update it's version info object details properly
 * ? Step 03: Change databaseTableUpdateFlag to true and tablesUpdateFlags of that particular table to true in /src/db/mysql/index.js file
 * ? Step 04: Change databaseTableUpdateFlag to false and tablesUpdateFlags of that particular table to false in /src/db/mysql/index.js file
 * & That's it your table related changes are completed.
 */
export const postUserTagVersionInfo = Object.freeze({
    version: "1.1.1",
    description: "Initial Version",
    updated_by: "sonu.ind.dev@gmail.com",
    approved_by: "",
})