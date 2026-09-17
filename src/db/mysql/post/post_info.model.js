import { DataTypes, Model } from "sequelize";

export class PostInfo extends Model { }

export function initializePostInfoModel(sequelize) {
    PostInfo.init(
        {
            post_info_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            post_id: {
                type: DataTypes.UUID,
                allowNull: false,
                unique: true,
                references: {
                    model: "post",
                    key: "post_id",
                },
            },
            caption: {
                type: DataTypes.STRING,
            },
            first_image_url: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            images_count: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            latitude: {
                type: DataTypes.DECIMAL,
                allowNull: false,
            },
            longitude: {
                type: DataTypes.DECIMAL,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "PostInfo",
            tableName: "post_info",
            indexes: [],
        }
    )

    return PostInfo;
}

/**
 * & How to update a table
 * ? Step 01: Do the table related code changes
 * ? Step 02: In table model file update it's version info object details properly
 * ? Step 03: Change databaseTableUpdateFlag to true and tablesUpdateFlags of that particular table to true in /src/db/mysql/index.js file
 * ? Step 04: Change databaseTableUpdateFlag to false and tablesUpdateFlags of that particular table to false in /src/db/mysql/index.js file
 * & That's it your table related changes are completed.
 */
export const postInfoVersionInfo = Object.freeze({
    version: "1.0.0",
    description: "Initial Version",
    updated_by: "sonu.ind.dev@gmail.com",
    approved_by: "",
})