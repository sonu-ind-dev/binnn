import { DataTypes, Model } from "sequelize";

export class OrgMember extends Model { }

export function initializeOrgMemberModel(sequelize) {
    OrgMember.init(
        {
            member_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            org_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            member_position_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            }
        },
        {
            sequelize,
            modelName: "OrgMember",
            tableName: "org_member",
            indexes: [],
        }
    )

    return OrgMember;
}

/**
 * & How to update a table
 * ? Step 01: Do the table related code changes
 * ? Step 02: In table model file update it's version info object details properly
 * ? Step 03: Change databaseTableUpdateFlag to true and tablesUpdateFlags of that particular table to true in /src/db/mysql/index.js file
 * ? Step 04: Change databaseTableUpdateFlag to false and tablesUpdateFlags of that particular table to false in /src/db/mysql/index.js file
 * & That's it your table related changes are completed.
 */
export const orgMemberVersionInfo = Object.freeze({
    version: "1.1.2",
    description: "Renaming org_member_type_id to member_position_id column",
    updated_by: "sonu.ind.dev@gmail.com",
    approved_by: "",
})