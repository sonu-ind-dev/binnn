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
                references: {
                    model: "post",
                    key: "post_id",
                },
            },
            org_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: "organization",
                    key: "org_id",
                },
            },
            approved_by: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: "user",
                    key: "user_id",
                },
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
    version: "1.1.2",
    description: "Implemented foreign key",
    updated_by: "sonu.ind.dev@gmail.com",
    approved_by: "",
});