import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

import { Universidad } from "./Universidad.js";
import { Carrera } from "./Carrera.js";
import { Curso } from "./Curso.js";

export const Usuario = sequelize.define(
    "Usuario", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        // unico ejem: wonwonderful
        nombreUsuario: {
            type: DataTypes.STRING,
            unique : true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        correo: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        // Alejandra
        nombres: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // San Martin
        apellidos: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // alejandrasanmartin o Alejandra San Martin o ALEJANDRA SAN MARTIN o alejandra san martin
        nombreCompleto: {
            type: DataTypes.STRING,
        },
        nroDocumento: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tipoDocumento: {
            type: DataTypes.STRING,
            allowNull: false
        },
        rol: {
            // 0 -> estudiante
            // 1 -> profesor
            type: DataTypes.INTEGER,
            allowNull: false
        },
        tituloPerfil: {
            type: DataTypes.STRING
        },
        presenPerfil: {
            type: DataTypes.STRING
        },
        imgPerfil: {
            type: DataTypes.STRING
        }
    }, {
        freezeTableName: true,
        timestamps : false
    }
)

Usuario .belongsTo(Universidad, {
    foreignKey: "universidadId",
})

Universidad .hasMany(Usuario, {
    foreignKey: "universidadId",
})

Usuario .belongsTo(Carrera, {
    foreignKey: "carreraId",
})

Carrera .hasMany(Usuario, {
    foreignKey: "carreraId",
})
