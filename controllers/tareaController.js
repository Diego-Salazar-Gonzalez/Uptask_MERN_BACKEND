import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";

const agregarTarea = async (req, res) => {
  const { proyecto } = req.body;
  const existeProyecto = await Proyecto.findById(proyecto);

  if (!existeProyecto) {
    const error = new Error("El Proyecto no existe");
    return res.status(404).json({ msg: error.message });
  }

  if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("No tienes los permisos adecuados");
    return res.status(404).json({ msg: error.message });
  }

  try {
    const tareaAlmacenada = await Tarea.create(req.body);
    //almacenar el id en el proyecto
    existeProyecto.tareas.push(tareaAlmacenada._id); //crea el apartados de tareas y coloca el id de aquella tarea
    await existeProyecto.save();
    return res.json(tareaAlmacenada);

  } catch (error) {
    console.log(error);
  }
};

const obtenerTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto"); //se trae tambien el proyecto asociado con esa tarea
  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion Invalida");
    return res.status(404).json({ msg: error.message });
  }
  res.json(tarea);
};

const actualizarTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto"); //se trae tambien el proyecto asociado con esa tarea
  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion Invalida");
    return res.status(404).json({ msg: error.message });
  }
  tarea.nombre = req.body.nombre || tarea.nombre;
  tarea.descripcion = req.body.descripcion || tarea.descripcion;
  tarea.prioridad = req.body.prioridad || tarea.prioridad;
  tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

  try {
    const tareaAlmacenada = await tarea.save();
    return res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
};

const eliminarTarea = async (req, res) => {
  const { id } = req.params;
  
  const tarea = await Tarea.findById(id).populate("proyecto"); //se trae tambien el proyecto asociado con esa tarea
  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion Invalida");
    return res.status(404).json({ msg: error.message });
  }

  try {
    //eliminando la referencia del arreglo de colaboradores en proyecto
    const proyecto = await Proyecto.findById(tarea.proyecto);
    
    proyecto.tareas.pull(tarea._id);
    //añadiendo 2 awaits en unsa sola linea (awaits independientes)
    await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()]);
    return res.json({ msg: "Tarea Eliminada" });
  } catch (error) {
    console.log(error);
  }
};

const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto"); //se trae tambien el proyecto asociado con esa tarea
  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }
  if (
    tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
    !tarea.proyecto.colaboradores.som(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error("Accion no Valida");
    return res.status(403).json({ msg: error.message });
  }
  tarea.estado = !tarea.estado;
  tarea.completado = req.usuario._id
  await tarea.save();
  const tareaAlmacenada = await Tarea.findById(id).populate('proyecto').populate('completado')
  return res.json(tareaAlmacenada);
};
export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado,
};
