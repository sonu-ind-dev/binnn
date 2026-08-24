import { DataTypes, Model } from "sequelize";

export class Position extends Model { }

export function initializePositionsModel(sequelize) {
    Position.init(
        {
            position_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            position: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            }
        },
        {
            sequelize,
            modelName: "Positions",
            tableName: "positions",
            indexes: [],
        }
    )

    return Position;
}

/**
 * & How to update a table
 * ? Step 01: Do the table related code changes
 * ? Step 02: In table model file update it's version info object details properly
 * ? Step 03: Change databaseTableUpdateFlag to true and tablesUpdateFlags of that particular table to true in /src/db/mysql/index.js file
 * ? Step 04: Change databaseTableUpdateFlag to false and tablesUpdateFlags of that particular table to false in /src/db/mysql/index.js file
 * & That's it your table related changes are completed.
 */
export const positionsVersionInfo = Object.freeze({
    version: "1.1.1",
    description: "Initial Version",
    updated_by: "sonu.ind.dev@gmail.com",
    approved_by: "",
})