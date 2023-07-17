import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

import { Usuario } from "./Usuario.js";

export const Profesor = sequelize.define(
    "Profesor", {
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

Profesor .belongsTo(Usuario, {
    foreignKey: "usuarioId",
    sourceKey: "id"
})

Usuario .hasMany(Profesor, {
    foreignKey: "usuarioId",
    targetKey: "id"
})


