import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import conectarDB from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";

import { Server, Socket } from "socket.io";
const app = express();
app.use(express.json()); //para que pueda leer los req. json()
dotenv.config();
conectarDB();

//cors
const whiteList = [process.env.FRONTEND_URL];

const corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(null,true);
    }
  },
};
app.use(cors(corsOptions));

//  Routing
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/proyectos", proyectoRoutes);
app.use("/api/tareas", tareaRoutes);

const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () => {
  console.log(`Servidor en el puerto ${PORT}`);
});

//socket.io

const io = new Server(servidor, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on("connection", (socket) => {
  console.log("Conectado a socket.io");
  //definiendo
  socket.on("abrir proyecto", (proyecto) => {
    socket.join(proyecto);
  });

  socket.on("nueva tarea", (tarea) => {
    //se toma el id de aquel proyecto
    socket.to(tarea.proyecto).emit("tarea agregada", tarea);
  });
  socket.on("eliminar tarea", tarea =>{
    const proyecto = tarea.proyecto
    socket.to(proyecto).emit('tarea eliminada',tarea)
  })
  socket.on("completar tarea", tarea =>{
   
     const proyecto = tarea.proyecto._id
     socket.to(proyecto).emit('tarea completada',tarea)
  })
  socket.on('actualizar tarea', tarea =>{
    const proyecto = tarea.proyecto._id
    socket.to(proyecto).emit('tarea actualizada',tarea)
  })
});
