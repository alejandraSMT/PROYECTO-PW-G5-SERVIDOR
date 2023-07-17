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
        freezeTableName: true,
        timestamps : false
    }
)

UniCarrera .belongsTo(Universidad, {
    foreignKey: "universidadId",
    sourceKey: "id"
})

Universidad .hasMany(UniCarrera, {
    foreignKey: "universidadId",
    targetKey: "id"
})

UniCarrera .belongsTo(Carrera, {
    foreignKey: "carreraId",
    //sourceKey: "id"
})

Carrera .hasMany(UniCarrera, {
    foreignKey: "carreraId",
    //targetKey: "id"
})