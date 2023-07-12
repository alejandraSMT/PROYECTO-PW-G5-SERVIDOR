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
        freezeTableName: true
    }
)

UsuarioCurso .hasMany(Usuario, {
    foreignKey: "usuarioId",
    sourceKey: "id"
})

Usuario .belongsTo(UsuarioCurso, {
    foreignKey: "usuarioId",
    targetKey: "id"
})

UsuarioCurso .hasMany(Curso, {
    foreignKey: "cursoId",
    sourceKey: "id"
})

Curso .belongsTo(UsuarioCurso, {
    foreignKey: "cursoId",
    targetKey: "id"
})