import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

export const Curso = sequelize.define(
    "Curso", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombreCurso: {
            type: DataTypes.STRING
        }
    }, {
        freezeTableName: true
    }
)