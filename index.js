import { sequelize } from "./database/database.js";
import express from "express";
import cors from "cors";
import {Op} from "sequelize"

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

/*app.use(cors({
    origin: "*",
    optionsSuccessStatus: 200
}))*/
app.use(cors());

app.use(express.json())

async function verificarConexion() {
    try {
        await sequelize.authenticate()
        console.log("Conexion a BD exitosa.");
        await sequelize.sync({ force: false })
    }
    catch (error) {
        console.error("Conexion no se logro.", error);
    }
}


// ------------------------------- JOAQUIN ------------------------------

app.post("/register", async (req, res) => {
    const usuario = req.body.user;
    const correo = req.body.email;
    const password = req.body.password;

    const nombres = capitalizeFirstLetter(req.body.names);
    const apellidos = capitalizeFirstLetter(req.body.surnames);
    const nombreCompleto = nombres + " " + apellidos;

    const tipoDoc = req.body.tdoc;
    const nroDoc = req.body.ndoc;
    const rol = req.body.rol;

    const maxIdResultUser = await Usuario.max("id");
    const nextIdUser = (maxIdResultUser || 0) + 1; // Calcula el próximo ID

    const users = await Usuario.findAll({
        where: {
            [Op.or]: [
                { nombreUsuario: usuario },
                { correo: correo },
                { nroDocumento: nroDoc }
            ]
        },
    });

    if (users, length == 0) {
        const newUser = Usuario.create({
            id: nextIdUser,
            nombreUsuario: usuario,
            password: password,
            correo: correo,
            nombres: nombres,
            apellidos: apellidos,
            nombreCompleto: nombreCompleto,
            nroDocumento: nroDoc,
            tipoDocumento: tipoDoc,
            rol: rol
        });

        if (rol == "0") {
            const maxIdResultStud = await Estudiante.max("id");
            const nextIdStud = (maxIdResultStud || 0) + 1; // Calcula el próximo ID

            const newStudent = Estudiante.create({
                id: nextIdStud,
                usuarioId: nextIdUser
            });
        }
        else {
            const maxIdResultTea = await Profesor.max("id");
            const nextIdTea = (maxIdResultTea || 0) + 1; // Calcula el próximo ID

            const newTeacher = Profesor.create({
                id: nextIdTea,
                usuarioId: nextIdUser
            });
        }

        res.send("Usuario creado.")
    }
    else {
        res.send("Usuario ya existente.")
    }

});

app.post("/login", async (req, res) => {
    const input = req.body.input;
    const password = req.body.password;

    try{const user = await Usuario.findOne({
        where: {
            [Op.or]: [
                { nombreUsuario: input },
                { correo: input }
            ],
            password: password,
        },
    });

    if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado." });
    }
    else {
        res.send(user);
        console.log(user);
    }}catch(e){
        res.send(e)
    }
});


// ------------------------- ALFREDO ------------------------------

app.put("/calificar-cita-pasada/:citaId/:puntaje", async function (req, res) {
    try {
        const citaId = parseInt(req.params.citaId);
        const puntajeLleno = parseInt(req.params.puntaje);
        const comentarioIngresado = req.body.comentario; // Obtén el comentario del cuerpo de la solicitud

        // Validación de datos
        if (isNaN(citaId) || isNaN(puntajeLleno)) {
            return res.status(400).json({ error: "Datos inválidos" });
        }

        // Verificar si existe la cita
        const cita = await Cita.findOne({ where: { id: citaId } });
        if (!cita) {
            return res.status(404).json({ error: "Cita no encontrada" });
        }

        // Realizar la actualización
        await Cita.update(
            { puntaje: puntajeLleno, comentario: comentarioIngresado }, // Guarda el comentario en la variable correspondiente de tu base de datos
            { where: { id: citaId } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al modificar la cita" });
    }
});


app.get("/consultar-calificaciones/:usuarioId", async function (req, res) {
    const usuarioId = req.params.usuarioId;

    try {
        const usuario = await Usuario.findOne({
            where: {
                id: usuarioId
            }
        });

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const profesor = await Profesor.findOne({
            where: {
                usuarioId: usuario.id
            }
        });

        const citas = await Cita.findAll({
            where: {
                profesorId: profesor.id,
                puntaje: {
                    [Op.not]: null
                }
            },
            attributes: ["puntaje", "comentario", "dia", "mes", "anio", "hora", "estudianteId"]
        });

        const estudiantesIds = citas.map(cita => cita.estudianteId);
        const estudiantes = await Estudiante.findAll({
            where: {
                id: estudiantesIds
            },
            attributes: ["id", "usuarioId"]
        });

        const usuariosIds = estudiantes.map(estudiante => estudiante.usuarioId);
        const usuariosEstudiantes = await Usuario.findAll({
            where: {
                id: usuariosIds
            },
            attributes: ["id", "nombreCompleto"]
        });

        const usuariosEstudiantesMap = usuariosEstudiantes.reduce((map, usuario) => {
            map[usuario.id] = usuario.nombreCompleto;
            return map;
        }, {});

        const citasConNombres = citas.map(cita => ({
            puntaje: cita.puntaje,
            comentario: cita.comentario,
            dia: cita.dia,
            mes: cita.mes,
            anio: cita.anio,
            hora: cita.hora,
            nombreEstudiante: usuariosEstudiantesMap[estudiantes.find(estudiante => estudiante.id === cita.estudianteId).usuarioId]
        }));

        const nombreProfesor = usuario.nombreCompleto;
        const respuesta = {
            profesor: nombreProfesor,
            citas: citasConNombres
        };
        res.send(respuesta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener las citas del usuario" });
    }
});

// ------------- QUIEN LO USA ??????????? ------------------------
//////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
app.get("/consultar-cita-pasada/:usuarioId", async function (req, res) {
    const usuarioId = req.params.usuarioId;

    try {
        const usuario = await Usuario.findOne({
            where: {
                id: usuarioId
            }
        });

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const estudiante = await Estudiante.findOne({
            where: {
                usuarioId: usuario.id
            }
        });

        const citas = await Cita.findAll({
            where: {
                estudianteId: estudiante.id,
                status: {
                    [Op.not]: 0
                }
            },
            attributes: ["puntaje", "comentario", "dia", "mes", "anio", "hora", "estudianteId"]
        });

        const estudiantesIds = citas.map(cita => cita.estudianteId);
        const estudiantes = await Estudiante.findAll({
            where: {
                id: estudiantesIds
            },
            attributes: ["id", "usuarioId"]
        });

        const usuariosIds = estudiantes.map(estudiante => estudiante.usuarioId);
        const usuariosEstudiantes = await Usuario.findAll({
            where: {
                id: usuariosIds
            },
            attributes: ["id", "nombreCompleto"]
        });

        const usuariosEstudiantesMap = usuariosEstudiantes.reduce((map, usuario) => {
            map[usuario.id] = usuario.nombreCompleto;
            return map;
        }, {});

        const citasConNombres = citas.map(cita => ({
            puntaje: cita.puntaje,
            comentario: cita.comentario,
            dia: cita.dia,
            mes: cita.mes,
            anio: cita.anio,
            hora: cita.hora,
            nombreEstudiante: usuariosEstudiantesMap[estudiantes.find(estudiante => estudiante.id === cita.estudianteId).usuarioId]
        }));

        const nombreProfesor = usuario.nombreCompleto;
        const respuesta = {
            profesor: nombreProfesor,
            citas: citasConNombres
        };
        res.send(respuesta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener las citas del usuario" });
    }
});

//---------------------------- ALE --------------------------------


app.post("/buscar-citas/:usuarioId", async function (req, res) {
    const usuarioId = req.params.usuarioId

    let usuario = null
    usuario = await Usuario.findOne({
        where: {
            id: usuarioId
        },
    })

    var seleccionado = null
    if (usuario.dataValues.rol == 0) {
        seleccionado = await Estudiante.findOne({
            where: {
                usuarioId: usuario.dataValues.id
            }
        })
    } else {
        seleccionado = await Profesor.findOne({
            where: {
                usuarioId: usuario.dataValues.id
            }
        })
    }

    var citas = null
    if (usuario.dataValues.rol == 0) {
        citas = await Cita.findAll({
            where: {
                estudianteId: seleccionado.id,
                status: 0
            },
            include: [
                {
                    model: Profesor,
                    include: [
                        {
                            model: Usuario,
                            attributes: ["id", "nombres", "apellidos", "imgPerfil", "tituloPerfil"]
                        },
                    ]
                },
                {
                    model: Curso
                }
            ]
        })
    } else {
        citas = await Cita.findAll({
            where: {
                profesorId: seleccionado.id,
                status: 0
            },
            include: [
                {
                    model: Estudiante,
                    include: [
                        {
                            model: Usuario,
                            attributes: ["id", "nombres", "apellidos", "imgPerfil", "tituloPerfil"]
                        }
                    ]
                },
                {
                    model: Curso
                },
            ]
        })
    }

    var citasMostrar = []

    if (usuario.dataValues.rol == 0) {
        citas.forEach(cita => {
            const elemento = {
                cita: {
                    id: cita.dataValues.id,
                    dia: cita.dataValues.dia,
                    mes: cita.dataValues.mes,
                    anio: cita.dataValues.anio,
                    diaSemana: cita.dataValues.diaSemana,
                    hora: cita.dataValues.hora,
                    status: cita.dataValues.status,
                    nombreCurso: cita.dataValues.Curso.nombreCurso,
                    calificacion: cita.dataValues.puntaje,
                    persona: {
                        id: cita.dataValues.Profesor.Usuario.id,
                        nombres: cita.dataValues.Profesor.Usuario.nombres,
                        apellidos: cita.dataValues.Profesor.Usuario.apellidos,
                        imgPerfil: cita.dataValues.Profesor.Usuario.imgPerfil,
                        tituloPerfil: cita.dataValues.Profesor.Usuario.tituloPerfil,
                    }
                }
            }
            // si calificado es null, poner No calificado y que se pueda calificar, sino desactivar el botón y cuando califique pintar el puntaje
            citasMostrar.push(elemento)
        })
    } else {
        citas.forEach(cita => {
            const elemento = {
                cita: {
                    id: cita.dataValues.id,
                    dia: cita.dataValues.dia,
                    mes: cita.dataValues.mes,
                    anio: cita.dataValues.anio,
                    diaSemana: cita.dataValues.diaSemana,
                    hora: cita.dataValues.hora,
                    status: cita.dataValues.status,
                    nombreCurso: cita.dataValues.Curso.nombreCurso,
                    calificacion: cita.dataValues.puntaje,
                    persona: {
                        id: cita.dataValues.Estudiante.Usuario.id,
                        nombres: cita.dataValues.Estudiante.dataValues.Usuario.nombres,
                        apellidos: cita.dataValues.Estudiante.Usuario.apellidos,
                        imgPerfil: cita.dataValues.Estudiante.Usuario.imgPerfil,
                        tituloPerfil: cita.dataValues.Estudiante.Usuario.tituloPerfil,
                    }
                }
            }
            // si calificado es null, poner No calificado y que se pueda calificar, sino desactivar el botón y cuando califique pintar el puntaje
            citasMostrar.push(elemento)
        })
    }
    res.send(citasMostrar)
})


app.post("/citas-pasadas/:usuarioId", async function (req, res) {
    const usuarioId = req.params.usuarioId

    let usuario = null
    usuario = await Usuario.findOne({
        where: {
            id: usuarioId
        },
    })

    var seleccionado = null
    if (usuario.dataValues.rol == 0) {
        seleccionado = await Estudiante.findOne({
            where: {
                usuarioId: usuario.dataValues.id
            }
        })
    } else {
        seleccionado = await Profesor.findOne({
            where: {
                usuarioId: usuario.dataValues.id
            }
        })
    }

    var citas = null
    if (usuario.dataValues.rol == 0) {
        citas = await Cita.findAll({
            where: {
                estudianteId: seleccionado.id,
                status: 1
            },
            include: [
                {
                    model: Profesor,
                    include: [
                        {
                            model: Usuario,
                            attributes: ["id", "nombres", "apellidos", "imgPerfil", "tituloPerfil"]
                        }
                    ]
                },
                {
                    model: Curso
                },
                {
                    model: Carrera,
                    attributes: ["id", "nombreCarrera"]
                }
            ]
        })
    } else if (usuario.dataValues.rol == 1) {
        citas = await Cita.findAll({
            where: {
                profesorId: seleccionado.id,
                status: 1
            },
            include: [
                {
                    model: Estudiante,
                    include: [
                        {
                            model: Usuario,
                            attributes: ["id", "nombres", "apellidos", "imgPerfil", "tituloPerfil"]
                        }
                    ]
                },
                {
                    model: Curso
                }
            ]
        })
    }

    var citasMostrar = []

    if (usuario.dataValues.rol == 0) {
        citas.forEach(cita => {
            const elemento = {
                usuario: {
                    id: usuario.dataValues.id,
                    nombres: usuario.dataValues.nombres,
                    apellidos: usuario.dataValues.apellidos,
                    cita: {
                        id: cita.dataValues.id,
                        dia: cita.dataValues.dia,
                        mes: cita.dataValues.mes,
                        anio: cita.dataValues.anio,
                        diaSemana: cita.dataValues.diaSemana,
                        hora: cita.dataValues.hora,
                        status: cita.dataValues.status,
                        nombreCurso: cita.dataValues.Curso.nombreCurso,
                        calificacion: cita.dataValues.puntaje,
                        nombreCarrera: cita.dataValues.Carrera.nombreCarrera,
                        persona: {
                            id: cita.dataValues.Profesor.Usuario.id,
                            nombres: cita.dataValues.Profesor.Usuario.nombres,
                            apellidos: cita.dataValues.Profesor.Usuario.apellidos,
                            imgPerfil: cita.dataValues.Profesor.Usuario.imgPerfil,
                            tituloPerfil: cita.dataValues.Profesor.Usuario.tituloPerfil,
                        }
                    }
                }
            }
            // si calificado es null, poner No calificado y que se pueda calificar, sino desactivar el botón y cuando califique pintar el puntaje
            citasMostrar.push(elemento)
        })
    } else {
        citas.forEach(cita => {
            const elemento = {
                usuario: {
                    id: usuario.dataValues.id,
                    nombres: usuario.dataValues.nombres,
                    apellidos: usuario.dataValues.apellidos,
                    cita: {
                        id: cita.dataValues.id,
                        dia: cita.dataValues.dia,
                        mes: cita.dataValues.mes,
                        anio: cita.dataValues.anio,
                        diaSemana: cita.dataValues.diaSemana,
                        hora: cita.dataValues.hora,
                        status: cita.dataValues.status,
                        nombreCurso: cita.dataValues.Curso.nombreCurso,
                        calificacion: cita.dataValues.puntaje,
                        persona: {
                            id: cita.dataValues.Estudiante.Usuario.id,
                            nombres: cita.dataValues.Estudiante.Usuario.nombres,
                            apellidos: cita.dataValues.Estudiante.Usuario.apellidos,
                            imgPerfil: cita.dataValues.Estudiante.Usuario.imgPerfil,
                            tituloPerfil: cita.dataValues.Estudiante.Usuario.tituloPerfil,
                        }
                    }
                }
            }
            // si calificado es null, poner No calificado y que se pueda calificar, sino desactivar el botón y cuando califique pintar el puntaje
            citasMostrar.push(elemento)
        })
    }
    res.send(citasMostrar)
})

app.post("/principal-citas/:usuarioId", async function (req, res) {
    const usuarioId = req.params.usuarioId

    let usuario = null
    usuario = await Usuario.findOne({
        where: {
            id: usuarioId
        },
    })

    var seleccionado = null
    var citas = null
    if (usuario.dataValues.rol == 0) {
        seleccionado = await Estudiante.findOne({
            where: {
                usuarioId: usuario.dataValues.id
            }
        })

        citas = await Cita.findAll({
            where: {
                estudianteId: seleccionado.dataValues.id,
                status: 0
            },
            include: {
                model: Profesor,
                include: [
                    {
                        model: Usuario
                    },
                ],
            },
            attributes: ["id", "dia", "mes", "anio", "hora", "diaSemana"]
        })

    } else if (usuario.dataValues.rol == 1) {
        seleccionado = await Profesor.findOne({
            where: {
                usuarioId: usuario.dataValues.id
            }
        })
        citas = await Cita.findAll({
            where: {
                profesorId: seleccionado.dataValues.id,
                status: 0
            },
            include: {
                model: Estudiante,
                include: [
                    {
                        model: Usuario
                    },
                ],
            },
            attributes: ["id", "dia", "mes", "anio", "hora", "diaSemana"]
        })
    }

    //res.send(citas)

    const citasPrincipal = []

    if (usuario.dataValues.rol == 0) {

        citas.forEach(cita => {
            const elemento = {
                cita: {
                    id: cita.dataValues.id,
                    dia: cita.dataValues.dia,
                    mes: cita.dataValues.mes,
                    anio: cita.dataValues.anio,
                    hora: cita.dataValues.hora,
                    persona: {
                        id: cita.dataValues.Profesor.Usuario.id,
                        nombres: cita.dataValues.Profesor.Usuario.nombres,
                        apellidos: cita.dataValues.Profesor.Usuario.apellidos,
                        imgPerfil: cita.dataValues.Profesor.Usuario.imgPerfil
                    }
                }
            }
            citasPrincipal.push(elemento)
        })
    } else if (usuario.dataValues.rol == 1) {
        citas.forEach(cita => {
            const elemento = {
                cita: {
                    id: cita.dataValues.id,
                    dia: cita.dataValues.dia,
                    mes: cita.dataValues.mes,
                    anio: cita.dataValues.anio,
                    hora: cita.dataValues.hora,
                    persona: {
                        id: cita.dataValues.Estudiante.Usuario.id,
                        nombres: cita.dataValues.Estudiante.Usuario.nombres,
                        apellidos: cita.dataValues.Estudiante.Usuario.apellidos,
                        imgPerfil: cita.dataValues.Profesor.Usuario.imgPerfil
                    }
                }
            }
            citasPrincipal.push(elemento)
        })
    }

    res.send(citasPrincipal)

})

app.post("/datos-usuario/:usuarioId", async function (req, res) {

    const usuarioId = req.params.usuarioId

    const usuario = await Usuario.findOne({
        where: {
            id: usuarioId
        }
    })
    res.send(usuario)
})

// /:dia/:mes/:anio
app.post("/consultar-disponibilidad/:diaSemana/:dia/:mes/:anio/:usuarioId", async function (req, res) {

    // const [diaSemana,dia,mes,anio,profesorId] = req.params
    const { diaSemana, dia, mes, anio, usuarioId } = req.params

    const profesor = await Profesor.findOne({
        where : {
            usuarioId : usuarioId
        }
    })

    const citas = await Cita.findAll({
        where: {
            profesorId: profesor.dataValues.id,
            dia: dia,
            mes: mes,
            anio: anio
        },
        attributes: ["status", "hora"]
    })

    const horario = await Horario.findOne({
        where: {
            profesorId: profesor.dataValues.id,
            diaSemana: diaSemana
        },
        attributes: ["diaSemana", "horaInicio", "horaFin"]
    })

    var hi = horario.dataValues.horaInicio
    var hf = horario.dataValues.horaFin
    var contador = hi
    var citasBD = []
    while (contador != hf) {
        citasBD.push({
            horaInicio: contador,
            horaFin: contador + 1
        })
        contador++
    }

    console.log(citasBD)

    citas.forEach(cita => {
        citasBD.forEach(citaBD => {
            if (cita.dataValues.hora == citaBD.horaInicio) {
                var index = citasBD.indexOf(citaBD)
                citasBD.splice(index, 1)
            }
        })
    })
    res.send(citasBD)

})

app.post("/reservar-cita/:diaSemana/:dia/:mes/:anio/:hora/:usuarioProfeId/:usuarioId/:cursoId", async function (req, res) {

    const { diaSemana, dia, mes, anio, hora, usuarioProfeId, usuarioId, cursoId } = req.params
  
    const estudiante = await Estudiante.findOne({
      where: {
        usuarioId: usuarioId
      },
      include: {
        model: Usuario,
      }
    })
  
    const profesor = await Profesor.findOne({
      where: {
        usuarioId: usuarioProfeId
      },
      include: {
        model: Usuario,
        include: {
          model: Carrera
        }
      }
    })
  
    const maxIdCita = await Cita.max("id");
    const nextIdCita = (maxIdCita || 0) + 1;
  
    const cita = await Cita.create({
      id: nextIdCita,
      puntaje: null,
      comentario: null,
      dia: parseInt(dia),
      mes: parseInt(mes),
      anio: parseInt(anio),
      hora: parseInt(hora),
      diaSemana: diaSemana,
      status: 0,
      profesorId: profesor.dataValues.id,
      estudianteId: estudiante.dataValues.id,
      cursoId: parseInt(cursoId),
      carreraId: parseInt(profesor.dataValues.Usuario.Carrera.id)
    })
  
    res.send(cita)
  
  })


// -------------------------------- FRANK -------------------------------

app.get('/obtener-profesor-total/:usuarioId', async function (req, res) {
    const usuarioId = req.params.usuarioId;

    try {
        const usuario = await Profesor.findOne({
            where: {
                usuarioId: usuarioId,
            },
            include: [
                {
                    model: Usuario,
                    attributes: ["nombreCompleto", "correo", "apellidos", "tituloPerfil", "presenPerfil", "imgPerfil"],
                    include: {
                        model: UsuarioCurso,
                        include: {
                            model: Curso,
                            attributes: ["nombreCurso"]
                        }
                    }
                }
            ],
            attributes: ["id"]
        });

        if (!usuario) {
            return res.status(404).json({ error: "Profesor no encontrado" });
        }

        console.log(usuario);
        res.send(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener el profesor" });
    }
});


//ELIMINAR CITA POR ID
app.post('/delete-cita/:citaId', async function (req, res) {
    const citaId = req.params.citaId;

    try {
        // Busca el usuario a eliminar
        const cita = await Cita.findOne({
            where: {
                id: citaId,
                status: 0 //pendiente es 0, 1 es pasada. Calificacion del 1 al 5
            }
        });

        if (!cita) {
            return res.status(404).json({ error: "Cita no disponible para cancelar" });
        }

        // Elimina el usuario de la base de datos
        await cita.destroy();

        res.send({ message: "Cita eliminada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar la cita" });
    }
});


//ACTUALIZAR FOTO DE USUARIO CON BUSQUEDA DE SU ID SUBIENDO FOTO EN BYTES (NO FUNCIONO PERO SE IMPLEMENTO/INTENTO)
import fs from 'fs';

app.post('/update-foto/:usuarioId', async function (req, res) {
    const usuarioId = req.params.usuarioId;

    try {
        const usuario = await Usuario.findOne({
            where: {
                id: usuarioId,
            },
        });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
        }

        // Leer el archivo de imagen y convertirlo en un búfer de bytes
        const fotoBuffer = fs.readFileSync(req.file.path);

        // Actualizar los valores del usuario con el búfer de bytes de la imagen
        usuario.imgPerfil = fotoBuffer;

        // Guardar los cambios en la base de datos
        await usuario.save();

        // Eliminar el archivo subido temporalmente
        fs.unlinkSync(req.file.path);

        res.send(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
});


//ACTUALIZAR FOTO DE USUARIO CON BUSQUEDA DE SU ID CON SU URL

app.post('/update-foto2/:usuarioId', async function (req, res) {
    const usuarioId = req.params.usuarioId;
    const nuevaFoto = req.body.imagenNueva; // Cambio aquí, ahora usamos req.body en lugar de req.params
    try {
        const usuario = await Usuario.findOne({
            where: {
                id: usuarioId,
            },
        });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Actualizar la columna "imgPerfil" con la URL proporcionada
        usuario.imgPerfil = nuevaFoto;

        // Guardar los cambios en la base de datos
        await usuario.save();

        res.send(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
});

// ---------------------------- GONZALO ---------------------------------------

app.get("/cambiar-universidad/:usuarioId/:universidadId", async function (req, res) {
    const usuarioId = req.params.usuarioId;
    const universidad = req.params.universidadId;
    const usuarioExistente = await Usuario.findOne({
        where: {
            id: usuarioId
        }
    });
    usuarioExistente.universidadId = parseInt(universidad);
    await usuarioExistente.save();
    res.send(usuarioExistente);
})

//endpoint para modificar la carrera
app.get("/cambiar-carrera/:usuarioId/:carreraId", async function (req, res) {
    const usuarioId = req.params.usuarioId;
    const carrera = req.params.carreraId;
    const usuarioExistente = await Usuario.findOne({
        where: {
            id: usuarioId
        }
    });
    usuarioExistente.carreraId = parseInt(carrera);
    await usuarioExistente.save();
    res.send(usuarioExistente);
})

app.post("/cambiar-password/:usuarioId/:cont1/:cont2/:cont3", async function (req, res) {
    const usuarioId = req.params.usuarioId;
    const cont1 = req.params.cont1;
    const cont2 = req.params.cont2;
    const cont3 = req.params.cont3;
    const usuarioExistente = await Usuario.findOne({
        where: {
            id: usuarioId
        }
    });
    // Verificar si cont1 es igual a usuarioExistente.password
    if (cont1 === usuarioExistente.password) {
        // Verificar si cont2 y cont3 son iguales
        if (cont2 === cont3) {
            // Si se cumple la condición, establecer usuarioExistente.password a cont2
            usuarioExistente.password = cont2;
        } else {
            // Si cont2 y cont3 no son iguales, enviar un mensaje de error al cliente
            return res.status(400).send({ error: "cont2 y cont3 deben ser iguales" });
        }
    } else {
        // Si cont1 no es igual a usuarioExistente.password, enviar un mensaje de error al cliente
        return res.status(400).send("cont1 no coincide con la contraseña actual");
    }
    await usuarioExistente.save();
    res.send(usuarioExistente);
})

app.post('/cambiar-usuario/:usuarioId/:nombreUsuario', async function (req, res) {
    const usuarioId = req.params.usuarioId
    const nombreUsuario = req.params.nombreUsuario

    const usuarioExistente = await Usuario.findOne({
        where: {
            id: usuarioId
        }
    })

    if (!usuarioExistente) {
        return res.status(404).json("Usuario no encontrado")
    }

    usuarioExistente.nombreUsuario = nombreUsuario
    await usuarioExistente.save()
    res.send(usuarioExistente)

})

app.post('/cambiar-presentacion/:usuarioId/:tituloPerfil/:presenPerfil', async function (req, res) {

    try {
        const usuarioId = req.params.usuarioId
        const tituloPerfil = req.params.tituloPerfil
        const presenPerfil = req.params.presenPerfil

        const usuarioExistente = await Usuario.findOne({
            where: {
                id: usuarioId
            }
        })

        if (!usuarioExistente) {
            return res.status(400).json("Usuario no encontrado")
        }

        usuarioExistente.tituloPerfil = tituloPerfil
        usuarioExistente.presenPerfil = presenPerfil
        await usuarioExistente.save()
        res.send(usuarioExistente)
    } catch (e) {
        console.log(e)
    }

})

app.get("/obtener-datos-info-personal/:usuarioId", async function (req, res) { //para zona superior de perfil
    const usuarioId = req.params.usuarioId;
    const usuario = await Usuario.findOne({
        where: {
            id: usuarioId
        },
        include: [
            {
                model: Universidad
            },
            {
                model: Carrera
            }
        ]
    });
    if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.send(usuario);
})


//creo que esto no iria, ya que el usuario deberia ingresar esos datos, no recogerlos del servidor
app.post("/obtener-datos-usuario/:usuarioId", async function (req, res) { //para tab de usuario
    const usuarioId = req.params.usuarioId;
    const usuario = await Usuario.findOne({
        where: {
            id: usuarioId
        },
        attributes: ['nombreUsuario', 'password'],
    });
    if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.send(usuario);
})

app.get("/obtener-datos-presentacion/:usuarioId", async function (req, res) { //para tab de presentacion
    const usuarioId = req.params.usuarioId;
    const usuario = await Usuario.findOne({
        where: {
            id: usuarioId
        },
        attributes: ['tituloPerfil', 'presenPerfil'],
    });
    if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.send(usuario);
})

app.get("/obtener-universidades", async function (req, res) { //se obtiene la lista de todas las unis
    const universidades = await Universidad.findAll();
    res.send(universidades);
})

app.get("/obtener-carreras-universidad/:UniversidadId", async function (req, res) { //se obtienen las carreras de una universidad mediante el id de la universidad
    const universidadId = req.params.UniversidadId;
    const carreras = await UniCarrera.findAll({
        where: {
            universidadId: universidadId
        },
        attributes: ['carreraId'],
    });
    const carreraIds = carreras.map((carrera) => carrera.carreraId);

    // Realizar una nueva búsqueda en la tabla Carrera utilizando los carreraIds obtenidos
    const carrerasEncontradas = await Carrera.findAll({
        where: {
            id: carreraIds
        },
        attributes: ['id', 'nombreCarrera'],
    });

    res.send(carrerasEncontradas);
})

app.get("/obtener-cursos-carrera/:carreraId", async function (req, res) { //se obtienen los cursos de una carrera mediante el Id de la Carrera
    const carreraId = req.params.carreraId;
    const cursos = await CarreraCurso.findAll({
        where: {
            carreraId: carreraId
        },
        attributes: ['cursoId'],
    });
    const cursoIds = cursos.map((curso) => curso.cursoId);

    // Realizar una nueva búsqueda en la tabla Carrera utilizando los carreraIds obtenidos
    const cursosEncontrados = await Curso.findAll({
        where: {
            id: cursoIds
        },
        attributes: ['id', 'nombreCurso'],
    });

    res.send(cursosEncontrados);
})

app.get("/obtener-cursos-usuario/:usuarioId", async function (req, res) {
    try {
        const usuarioId = req.params.usuarioId;

        // Obtener todas las relaciones UsuarioCurso asociadas con el usuario en cuestión
        const cursosUsuario = await UsuarioCurso.findAll({
            where: {
                usuarioId: usuarioId,
            },
            include: {
                model: Curso,
                attributes: ['id', 'nombreCurso'],
            },
        });

        // Obtener solo los datos de los cursos del resultado anterior
        const cursosEncontrados = cursosUsuario.map((usuarioCurso) => usuarioCurso.Curso);

        res.send(cursosEncontrados);
    } catch (error) {
        console.error("Error al obtener cursos del usuario:", error);
        res.status(500).send("Error al obtener cursos del usuario.");
    }
});

app.get("/obtener-datos-universidad/:usuarioId", async function (req, res) { //para tab de universidad, creo que esto no va
    const usuarioId = req.params.usuarioId;

    const carreras = await UniCarrera.findOne({
        where: {

            /// ???????????????????????????'
            universidadId: usuarioId
        },
        attributes: ['id', 'universidadId', 'carreraId'],
        include: [
            // Incluir la información de la universidad y sus carreras
            {
                model: Universidad,
                attributes: ['nombreUniversidad'],
                include: {
                    model: Carrera,
                    as: 'carreras',
                    attributes: ['nombreCarrera'],
                    include: {
                        model: Curso,
                        as: 'cursos',
                        attributes: ['nombreCurso'],
                    }
                },
            },
        ],
    });
    if (!carreras) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.send(carreras);
})

// ENDPOINTS POST
app.post("/datos-info-personal/:usuarioId/:nombres/:apellidos/:tipodoc/:numero", async function (req, res) {
    const usuarioId = req.params.usuarioId;
    const nombres = req.params.nombres;
    const apellidos = req.params.apellidos;
    const tipodoc = req.params.tipodoc;
    const numero = req.params.numero;

    const usuarioExistente = await Usuario.findOne({
        where: {
            id: usuarioId
        }
    });

    usuarioExistente.nombres = nombres;
    usuarioExistente.apellidos = apellidos;
    usuarioExistente.tipoDocumento = tipodoc;
    usuarioExistente.nroDocumento = numero;
    await usuarioExistente.save();

    res.send(usuarioExistente);
});

app.get("/enviar-datos-presentacion/:usuarioId/:titulo/:presentacion", async function (req, res) {
    const usuarioId = req.params.usuarioId;
    const titulo = req.params.titulo;
    const presentacion = req.params.presentacion;
    const usuarioExistente = await Usuario.findOne({
        where: {
            id: usuarioId
        }
    });
    usuarioExistente.tituloPerfil = titulo;
    usuarioExistente.presenPerfil = presentacion;
    await usuarioExistente.save();
    res.send("usuarioExistente");
})

// cursos por universidad y carrera
app.get("/cursos/:universidadId/:carreraId", async (req, res) => {
    const { universidadId, carreraId } = req.params;

    try {
        const cursos = await Curso.findAll({
            include: [
                {
                    model: CarreraCurso,
                    where: { carreraId: carreraId },
                    include: [
                        {
                            model: Carrera,
                            where: { id: carreraId },
                            attributes: [],
                            include: [
                                {
                                    model: UniCarrera,
                                    where: { universidadId: universidadId },
                                    attributes: [],
                                },
                            ],
                        },
                    ],
                    attributes: []
                },
            ],
            attributes: ['id', 'nombreCurso'], // Seleccionar solo la columna 'nombreCurso', facil podria ir un 'id', para jalar el Id tambien
        });

        res.send(cursos);
        //return res.status(200).json(nombresCursos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
});

// --------------------- ANDREA -----------------------------------

app.post("/asignar-curso-usuario/:usuarioId/:cursoId", async (req, res) => {
    const usuarioId = req.params.usuarioId;
    const cursoId = req.params.cursoId;

    try {
        // Verificar si la relación ya existe en la tabla UsuarioCurso
        const usuarioCursoExistente = await UsuarioCurso.findOne({
            where: {
                usuarioId: usuarioId,
                cursoId: cursoId,
            },
        });

        if (usuarioCursoExistente) {
            return res.status(400).json({ message: "La relación UsuarioCurso ya existe." });
        }

        // Crear una nueva relación UsuarioCurso
        const maxIdResultUser = await UsuarioCurso.max("id");
        const nextIdUser = (maxIdResultUser || 0) + 1; // Calcula el próximo ID
        const nuevaRelacionUsuarioCurso = await UsuarioCurso.create({
            id: nextIdUser,
            usuarioId: usuarioId,
            cursoId: cursoId,
        });

        //res.send(nuevaRelacionUsuarioCurso)
        return res.status(200).json({
            message: "Relación UsuarioCurso creada exitosamente.",
            respuesta: JSON.stringify(nuevaRelacionUsuarioCurso)
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
});

app.get("/profesores/horario/:diaSemana", async (req, res) => {
    const diaSemana = req.params.diaSemana;

    try {
        const horarios = await Horario.findAll({
            where: {
                diaSemana: diaSemana,
            },
            include: [
                {
                    model: Profesor,
                    attributes: ["usuarioId"],
                    include: [
                        {
                            model: Usuario,
                            attributes: ["nombreCompleto"],
                            include: [
                                {
                                    model: Universidad,
                                    attributes: ["nombreUniversidad"],
                                },
                                {
                                    model: Carrera,
                                    attributes: ["nombreCarrera"],
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        if (horarios.length === 0) {
            return res.status(404).send({
                message: "No se encontraron profesores con horario en el día de la semana proporcionado.",
            });
        }

        const profesoresFormatted = horarios.map((horario) => ({
            usuarioId: horario.Profesor.usuarioId,
            nombreCompleto: horario.Profesor.Usuario.nombreCompleto,
            nombreUniversidad: horario.Profesor.Usuario.Universidad.nombreUniversidad,
            nombreCarrera: horario.Profesor.Usuario.Carrera.nombreCarrera,
        }));

        res.send(profesoresFormatted);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del servidor");
    }
});



app.get("/usuarios/:parametro", async (req, res) => {
    let parametro = req.params.parametro;

    // Si el parámetro tiene espacios, se reemplazan por "%20"
    parametro = parametro.replace(/\s/g, "%20");

    try {
        const profesores = await Usuario.findAll({
            where: {
                nombres: parametro,
                rol: 1,
            },
            include: [
                {
                    model: Universidad,
                    attributes: ["nombreUniversidad"],
                },
                {
                    model: Carrera,
                    attributes: ["nombreCarrera"],
                },
            ],
        });

        if (profesores.length > 0) {
            const profesoresFormatted = profesores.map((profesor) => ({
                usuarioId: profesor.id,
                nombreCompleto: profesor.nombreCompleto,
                nombreUniversidad: profesor.Universidad.nombreUniversidad,
                nombreCarrera: profesor.Carrera.nombreCarrera,
            }));

            return res.send(profesoresFormatted);
        }

        const universidad = await Universidad.findOne({
            where: {
                nombreUniversidad: parametro,
            },
        });

        if (universidad) {
            const usuarios = await Usuario.findAll({
                where: {
                    rol: 1,
                    universidadId: universidad.id,
                },
                include: [
                    {
                        model: Universidad,
                        attributes: ["nombreUniversidad"],
                    },
                    {
                        model: Carrera,
                        attributes: ["nombreCarrera"],
                    },
                ],
            });

            const usuariosFormatted = usuarios.map((usuario) => ({
                usuarioId: usuario.id,
                nombreCompleto: usuario.nombreCompleto,
                nombreUniversidad: usuario.Universidad.nombreUniversidad,
                nombreCarrera: usuario.Carrera.nombreCarrera,
            }));

            return res.send(usuariosFormatted);
        }

        const carrera = await Carrera.findOne({
            where: {
                nombreCarrera: parametro,
            },
        });

        if (carrera) {
            const usuarios = await Usuario.findAll({
                where: {
                    rol: 1,
                    carreraId: carrera.id,
                },
                include: [
                    {
                        model: Universidad,
                        attributes: ["nombreUniversidad"],
                    },
                    {
                        model: Carrera,
                        attributes: ["nombreCarrera"],
                    },
                ],
            });

            const usuariosFormatted = usuarios.map((usuario) => ({
                usuarioId: usuario.id,
                nombreCompleto: usuario.nombreCompleto,
                nombreUniversidad: usuario.Universidad.nombreUniversidad,
                nombreCarrera: usuario.Carrera.nombreCarrera,
            }));

            return res.send(usuariosFormatted);
        }

        // No se encontró coincidencia
        return res.status(404).send({
            message: "No se encontró ninguna coincidencia con el parámetro proporcionado.",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del servidor");
    }
});



// ------------------------------- CRISTOPHER --------------------------


app.get("/horarios", async (req, res) => {
    try {
      const horarios = await Horario.findAll({
        include: [Profesor],
      });
      const horariosData = horarios.map((horario) => ({
        id: horario.id,
        diaSemana: horario.diaSemana,
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin,
        enlaceSesion: horario.enlaceSesion,
      }));
  
      res.send(horariosData);
      console.log(horariosData);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve horarios" });
    }
  });
  
  //Endpoint para agregar un nuevo Horario.
  //Apartir de este se puede aramar para eliminar uno de la base de datos
  
  app.get("/horarios/:diaSemana/:horaInicio/:horaFin/:enlaceSesion",
    async (req, res) => {
      try {
        const diaSemana = req.params.diaSemana;
        const horaInicio = req.params.horaInicio;
        const horaFin = req.params.horaFin;
        const enlaceSesion = req.params.enlaceSesion;
        const horario = await Horario.create({
          diaSemana: diaSemana,
          horaInicio: horaInicio,
          horaFin: horaFin,
          enlaceSesion: enlaceSesion,
        });
        res.send(horario);
        console.log(horario);
      } catch (error) {
        res.json({ error: "No se pudo agregar el horario" });
      }
    }
  );
  
  //Al presionar el boton X de la columna de Horarios, se debe enviar esta peticion
  app.get("/remover-horario/:idHorario",
    async (req, res) => {
      try {
        const id = req.params.idHorario;
        const deletedRows = await Horario.destroy({
          where: {
            id: id,
          },
        });
        if (deletedRows > 0) {
          res.status(200).json({ message: 'Horario deleted successfully' });
        } else {
          res.status(404).json({ message: 'Horario not found' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete the horario' });
      }
    }
  );

app.get("/", function (req, res) {
    res.send("Se conectó correctamente");
    verificarConexion();
})

app.listen(port, function () {
    console.log("Servidor ejecutándose en puerto " + port);
    verificarConexion();
})