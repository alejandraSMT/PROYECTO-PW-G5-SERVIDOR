import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Profesor } from "./Profesor.js";
import { Horario } from "./Horario.js";

export const ProfesorHorario = sequelize.define(
    "ProfesorHorario", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        freezeTableName: true
    }
)

ProfesorHorario .hasMany(Profesor, {
    foreignKey: "profesorId",
    sourceKey: "id"
})

Profesor .belongsTo(ProfesorHorario, {
    foreignKey: "profesorId",
    targetKey: "id"
})

ProfesorHorario .hasMany(Horario, {
    foreignKey: "horarioId",
    sourceKey: "id"
})

Horario .belongsTo(ProfesorHorario, {
    foreignKey: "horarioId",
    targetKey: "id"
})