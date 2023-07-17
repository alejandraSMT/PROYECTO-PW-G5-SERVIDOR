import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

import { Profesor } from "./Profesor.js";
import { Estudiante } from "./Estudiante.js";
import { Curso } from "./Curso.js";
import { Horario } from "./Horario.js";
import { Universidad } from "./Universidad.js";
import { Carrera } from "./Carrera.js";

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
        },
        dia:{
            type : DataTypes.INTEGER
        },
        mes:{
            type : DataTypes.INTEGER
        },
        anio:{
            type : DataTypes.INTEGER
        },
        hora:{
            type : DataTypes.INTEGER
        },
        diaSemana:{
            type : DataTypes.STRING
        },
        status:{
            type : DataTypes.INTEGER
        }
        // 0 -> pendiente
        // 1 -> pasada
    }, {
        freezeTableName: true,
        timestamps : false
    }
)

Cita .belongsTo(Profesor, {
    foreignKey: "profesorId",
    sourceKey: "id"
})

Profesor .hasMany(Cita, {
    foreignKey: "profesorId",
    targetKey: "id"
})

Cita .belongsTo(Estudiante, {
    foreignKey: "estudianteId",
    sourceKey: "id"
})

Estudiante .hasMany(Cita, {
    foreignKey: "estudianteId",
    targetKey: "id"
})

Cita .belongsTo(Curso, {
    foreignKey: "cursoId",
    sourceKey: "id"
})

Curso .hasMany(Cita, {
    foreignKey: "cursoId",
    targetKey: "id"
})

Cita .belongsTo(Carrera,{
    foreignKey : "carreraId",
    targetKey : "id"
})

Carrera .hasMany(Cita,{
    foreignKey : "carreraId",
    sourceKey : "id"
})

