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
        freezeTableName: true
    }
)

CarreraCurso .hasMany(Carrera, {
    foreignKey: "carreraId",
    sourceKey: "id"
})

Carrera .belongsTo(CarreraCurso, {
    foreignKey: "carreraId",
    targetKey: "id"
})

CarreraCurso .hasMany(Curso, {
    foreignKey: "cursoId",
    sourceKey: "id"
})

Curso .belongsTo(CarreraCurso, {
    foreignKey: "cursoId",
    targetKey: "id"
})