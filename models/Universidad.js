import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

export const Universidad = sequelize.define(
    "Universidad", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombreUniversidad: {
            type: DataTypes.STRING
        }
    }, {
        freezeTableName: true
    }
)