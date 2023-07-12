import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

import { Profesor } from "./Profesor.js";
import { Estudiante } from "./Estudiante.js";
import { Curso } from "./Curso.js";
import { Horario } from "./Horario.js";

export const Cita = sequelize.define(
    "Cita", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        puntaje: {
            type: DataTypes.FLOAT
        },
        comentario: {
            type: DataTypes.STRING
        }
    }, {
        freezeTableName: true
    }
)

Cita .hasMany(Profesor, {
    foreignKey: "profesorId",
    sourceKey: "id"
})

Profesor .belongsTo(Cita, {
    foreignKey: "profesorId",
    targetKey: "id"
})

Cita .hasMany(Estudiante, {
    foreignKey: "estudianteId",
    sourceKey: "id"
})

Estudiante .belongsTo(Cita, {
    foreignKey: "estudianteId",
    targetKey: "id"
})

Cita .hasMany(Curso, {
    foreignKey: "cursoId",
    sourceKey: "id"
})

Curso .belongsTo(Cita, {
    foreignKey: "cursoId",
    targetKey: "id"
})

Cita .hasMany(Horario, {
    foreignKey: "horarioId",
    sourceKey: "id"
})

Horario .belongsTo(Cita, {
    foreignKey: "horarioId",
    targetKey: "id"
})

