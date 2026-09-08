import { DataTypes, Model } from "sequelize";

export class Organization extends Model { }

export function initializeOrganizationModel(sequelize) {
    Organization.init(
        {
            org_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            org_code: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            profile_image_url: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            contact_number: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "Organization",
            tableName: "organization",
            indexes: [],
        }
    )

    return Organization;
}

/**
 * & How to update a table
 * ? Step 01: Do the table related code changes
 * ? Step 02: In table model file update it's version info object details properly
 * ? Step 03: Change databaseTableUpdateFlag to true and tablesUpdateFlags of that particular table to true in /src/db/mysql/index.js file
 * ? Step 04: Change databaseTableUpdateFlag to false and tablesUpdateFlags of that particular table to false in /src/db/mysql/index.js file
 * & That's it your table related changes are completed.
 */
export const organizationVersionInfo = Object.freeze({
    version: "1.3.1",
    description: "Adding profile_image_url column",
    updated_by: "sonu.ind.dev@gmail.com",
    approved_by: "",
})