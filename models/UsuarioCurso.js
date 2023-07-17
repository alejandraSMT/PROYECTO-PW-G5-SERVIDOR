import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

import { Usuario } from "./Usuario.js";
import { Curso } from "./Curso.js";

export const UsuarioCurso = sequelize.define(
    "UsuarioCurso", {
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

UsuarioCurso .belongsTo(Usuario, {
    foreignKey: "usuarioId",
    sourceKey: "id"
})

Usuario .hasMany(UsuarioCurso, {
    foreignKey: "usuarioId",
    targetKey: "id"
})

UsuarioCurso .belongsTo(Curso, {
    foreignKey: "cursoId",
    sourceKey: "id"
})

Curso .hasMany(UsuarioCurso, {
    foreignKey: "cursoId",
    targetKey: "id"
})