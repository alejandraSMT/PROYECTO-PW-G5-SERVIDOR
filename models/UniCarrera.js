import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Universidad } from "./Universidad.js";
import { Carrera } from "./Carrera.js";

export const UniCarrera = sequelize.define(
    "UniCarrera", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        freezeTableName: true
    }
)

UniCarrera .hasMany(Universidad, {
    foreignKey: "universidadId",
    sourceKey: "id"
})

Universidad .belongsTo(UniCarrera, {
    foreignKey: "universidadId",
    targetKey: "id"
})

UniCarrera .hasMany(Carrera, {
    foreignKey: "carreraId",
    sourceKey: "id"
})

Carrera .belongsTo(UniCarrera, {
    foreignKey: "carreraId",
    targetKey: "id"
})