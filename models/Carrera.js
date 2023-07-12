import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

export const Carrera = sequelize.define(
    "Carrera", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombreCarrera: {
            type: DataTypes.STRING
        }
    }, {
        freezeTableName: true
    }
)