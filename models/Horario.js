import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Profesor } from "./Profesor.js";

export const Horario = sequelize.define(
    "Horario", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        diaSemana: {
            type: DataTypes.STRING
        },
        // formato 24 hrs
        horaInicio: {
            type: DataTypes.INTEGER
        },
        horaFin: {
            type: DataTypes.INTEGER,
        },
        enlaceSesion: {
            type: DataTypes.STRING
        },
    }, {
        freezeTableName: true,
        timestamps : false
    }
)

Horario .belongsTo(Profesor,{
    foreignKey : "profesorId",
    sourceKey : "id"
})

Profesor .hasMany(Horario,{
    foreignKey : "profesorId",
    targetKey : "id"
})
