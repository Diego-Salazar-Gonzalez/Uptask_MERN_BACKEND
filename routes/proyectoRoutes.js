import express from "express";
import {
  obtenerProyecto,
  obtenerProyectos,
  agregarColaborador,
  eliminarColaborador,
  eliminarProyecto,
  editarProyecto,
  nuevoProyecto,
  buscarColaborador
} from "../controllers/proyectoController.js";
import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(checkAuth, obtenerProyectos)
  .post(checkAuth, nuevoProyecto);

router
  .route("/:id")
  .get(checkAuth, obtenerProyecto)
  .put(checkAuth, editarProyecto)
  .delete(checkAuth, eliminarProyecto);

  //Nota importante: cuando usas delete no puedes enviar valores por la url
router.post('/colaboradores',checkAuth,buscarColaborador)
router.post('/colaboradores/:id',checkAuth,agregarColaborador)
router.post('/eliminar-colaborador/:id',checkAuth,eliminarColaborador)//uso post porque va a eliminar solo una parte y no todo

export default router;
