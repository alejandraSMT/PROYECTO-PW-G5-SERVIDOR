import { sequelize } from "./database/database.js";
import express from "express";
import cors from "cors";

// Importar modelos
import { Usuario } from "./models/Usuario.js";
import { Profesor } from "./models/Profesor.js";
import { Estudiante } from "./models/Estudiante.js";
import { Universidad } from "./models/Universidad.js";
import { Carrera } from "./models/Carrera.js";
import { CarreraCurso } from "./models/CarreraCurso.js";
import { UniCarrera } from "./models/UniCarrera.js";
import { Curso } from "./models/Curso.js";
import { UsuarioCurso } from "./models/UsuarioCurso.js";
import { Horario } from "./models/Horario.js";
import { Cita } from "./models/Citas.js";
import { Model, where } from "sequelize";


const app = express()
const port = process.env.PORT || 3001;

app.use(cors())

app.use(express.json())


async function verificarConexion(){
    try {
        await sequelize.authenticate()
        console.log("Conexion a BD exitosa.");
        await sequelize.sync({force: true})
    }
    catch(error){
        console.error("Conexion no se logro.", error);
    }
}

app.get("/", function(req, res){
    res.send("Se conectó correctamente");
    verificarConexion();
})

app.listen(port, function(){
    console.log("Servidor ejecutándose en puerto " + port);
    verificarConexion();
})