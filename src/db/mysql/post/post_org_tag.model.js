import { DataTypes, Model } from "sequelize";

export class PostOrgTag extends Model { }

export function initializePostOrgTagModel(sequelize) {
    PostOrgTag.init(
        {
            post_org_tag_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            post_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            org_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            approved_by: {
                type: DataTypes.UUID,
                allowNull: true,
            }
        },
        {
            sequelize,
            modelName: "PostOrgTag",
            tableName: "post_org_tag",
            indexes: [],
        }
    )

    return PostOrgTag;
}

/**
 * & How to update a table
 * ? Step 01: Do the table related code changes
 * ? Step 02: In table model file update it's version info object details properly
 * ? Step 03: Change databaseTableUpdateFlag to true and tablesUpdateFlags of that particular table to true in /src/db/mysql/index.js file
 * ? Step 04: Change databaseTableUpdateFlag to false and tablesUpdateFlags of that particular table to false in /src/db/mysql/index.js file
 * & That's it your table related changes are completed.
 */
export const postOrgTagVersionInfo = Object.freeze({
    version: "1.1.1",
    description: "Initial Version",
    updated_by: "sonu.ind.dev@gmail.com",
    approved_by: "",
});