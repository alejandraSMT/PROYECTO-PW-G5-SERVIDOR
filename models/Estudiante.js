import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

import { Usuario } from "./Usuario.js";

export const Estudiante = sequelize.define(
    "Estudiante", {
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

Estudiante .belongsTo(Usuario, {
    foreignKey: "usuarioId",
    sourceKey: "id"
})

Usuario .hasMany(Estudiante, {
    foreignKey: "usuarioId",
    targetKey: "id"
})