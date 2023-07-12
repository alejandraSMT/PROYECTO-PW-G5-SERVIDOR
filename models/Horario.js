import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

export const Horario = sequelize.define(
    "Horario", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        diaSemana: {
            type: DataTypes.STRING
        },
        horaInicio: {
            type: DataTypes.DATE,
            get() {
                return moment(this.getDataValue('horaInicio')).format('h:mm');
            }
        },
        enlaceSesion: {
            type: DataTypes.STRING
        }
    }, {
        freezeTableName: true
    }
)