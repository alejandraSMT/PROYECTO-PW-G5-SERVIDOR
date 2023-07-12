import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

import { Usuario } from "./Rol.js";

export const Profesor = sequelize.define(
    "Profesor", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        freezeTableName: true
    }
)

Profesor .hasMany(Usuario, {
    foreignKey: "usuarioId",
    sourceKey: "id"
})

Usuario .belongsTo(Profesor, {
    foreignKey: "usuarioId",
    targetKey: "id"
})