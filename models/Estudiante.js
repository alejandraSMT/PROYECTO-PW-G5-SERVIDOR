import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

import { Usuario } from "./Rol.js";

export const Estudiante = sequelize.define(
    "Estudiante", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        freezeTableName: true
    }
)

Estudiante .hasMany(Usuario, {
    foreignKey: "usuarioId",
    sourceKey: "id"
})

Usuario .belongsTo(Estudiante, {
    foreignKey: "usuarioId",
    targetKey: "id"
})