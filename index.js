import { sequelize } from './database/database.js';
import express from 'express';

// Importar modelos
import Usuario from './models/Usuario.js';

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

app.get("/create-user", async function(req, res){
    const nuevoUsuario = await Usuario.create({
        nombre : "Pepe",
        codigo : "20123254",
        edad : 30

    })

    res.send("Usuario creado.");
})

app.get("/", function(req, res){
    res.send("Se conectó correctamente");
    verificarConexion();
})

app.listen(port, function(){
    console.log("Servidor ejecutándose en puerto " + port);
    verificarConexion();
})