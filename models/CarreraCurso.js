import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Carrera } from "./Carrera.js";
import { Curso } from "./Curso.js";

export const CarreraCurso = sequelize.define(
    "CarreraCurso", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        freezeTableName: true,
        timestamps : false
    }
)

CarreraCurso .belongsTo(Carrera, {
    foreignKey: "carreraId",
    sourceKey: "id"
})

Carrera .hasMany(CarreraCurso, {
    foreignKey: "carreraId",
    targetKey: "id"
})

CarreraCurso .belongsTo(Curso, {
    foreignKey: "cursoId",
    sourceKey: "id"
})

Curso .hasMany(CarreraCurso, {
    foreignKey: "cursoId",
    targetKey: "id"
})