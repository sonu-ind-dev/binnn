import { DataTypes, Model } from "sequelize";

export class OrgLocation extends Model { }

export function initializeOrgLocationModel(sequelize) {
    OrgLocation.init(
        {
            org_location_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            org_id: {
                type: DataTypes.UUID,
                allowNull: false,
                unique: true,
            },
            street: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            city: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            state: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            country: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            pin_code: {
                type: DataTypes.INTEGER,
                allowNull: false,
            }
        },
        {
            sequelize,
            modelName: "OrgLocation",
            tableName: "org_location",
            indexes: [],
        }
    )

    return OrgLocation;
}

/**
 * & How to update a table
 * ? Step 01: Do the table related code changes
 * ? Step 02: In table model file update it's version info object details properly
 * ? Step 03: Change databaseTableUpdateFlag to true and tablesUpdateFlags of that particular table to true in /src/db/mysql/index.js file
 * ? Step 04: Change databaseTableUpdateFlag to false and tablesUpdateFlags of that particular table to false in /src/db/mysql/index.js file
 * & That's it your table related changes are completed.
 */
export const orgLocationVersionInfo = Object.freeze({
    version: "1.1.1",
    description: "Initial Version",
    updated_by: "sonu.ind.dev@gmail.com",
    approved_by: "",
});