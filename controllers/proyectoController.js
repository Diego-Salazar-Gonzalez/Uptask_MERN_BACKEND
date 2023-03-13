import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";
import Usuario from "../models/Usuario.js";

const obtenerProyectos = async (req, res) => {
  const proyectos = await Proyecto.find({
    $or: [
      { colaboradores: { $in: req.usuario } },
      { creador: { $in: req.usuario } },
    ],
  })
    .select("-tareas");
  res.json(proyectos);
};

const nuevoProyecto = async (req, res) => {
  const proyecto = new Proyecto(req.body);
  proyecto.creador = req.usuario._id;
  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(error);
  }
};
const obtenerProyecto = async (req, res) => {
  const { id } = req.params;

  try {
    //* usando el .populate hacia tareas y el findbyid busca ese proyecto de id y el campo "tareas" para buscar ese id de tareas que anteriormente se guarda y retorna la informacion de esa tarea asociada
    //hago un populate a un campo de referencia traido por otro populate en la segunda linea de este codigo en el cual selecciono despues que campos traerme de ese populate
    const proyecto = await Proyecto.findById(id)
      .populate({path: "tareas",populate:{path: "completado",select: "nombre"}})
      .populate("colaboradores", "nombre email");
    //si el campo que yo retorno es un populate y quiero quitar informacion innecesario  uso la coma y con comillas me traigo la informacion deseada

    if (!proyecto) {
      return res
        .status(404)
        .json({ msg: "El proyecto que estas buscando no existe" });
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some((colaborador => colaborador._id.toString() === req.usuario._id.toString()))) {
      return res.status(403).json({ msg: "No tienes permisos" });
    }
    return res.json(proyecto);
  } catch (error) {
    return res.status(404).json({ msg: "El id que ingresaste no es valido" });
  }
};

const editarProyecto = async (req, res) => {
  const { id } = req.params;

  try {
    const proyecto = await Proyecto.findById(id);

    if (!proyecto) {
      return res
        .status(404)
        .json({ msg: "El proyecto que estas buscando no existe" });
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ msg: "No tienes permisos" });
    }

    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.cliente = req.body.cliente || proyecto.cliente;

    const proyectoAlmacenado = await proyecto.save();
    console.log(proyectoAlmacenado);
    return res.json(proyectoAlmacenado);
  } catch (error) {
    return res.status(404).json({ msg: "El id que ingresaste no es valido" });
  }
};

const eliminarProyecto = async (req, res) => {
  const { id } = req.params;

  try {
    const proyecto = await Proyecto.findById(id);

    if (!proyecto) {
      return res
        .status(404)
        .json({ msg: "El proyecto que estas buscando no existe" });
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ msg: "No tienes permisos" });
    }

    await proyecto.deleteOne();
    return res.json({ msg: "Proyecto Eliminado" });
  } catch (error) {
    return res.status(404).json({ msg: "El id que ingresaste no es valido" });
  }
};

const buscarColaborador = async (req, res) => {
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createdAt -password -token -updatedAt -__v"
  );
  if (!usuario) {
    const error = new Error("Usuario No Encontrado");
    return res.status(404).json({ msg: error.message });
  }
  res.json(usuario);
};
const agregarColaborador = async (req, res) => {
  //proyecto existe?
  const proyecto = await Proyecto.findById(req.params.id);
  if (!proyecto) {
    const error = new Error("Proyecto No Encontrado");
    return res.status(404).json({ msg: error.message });
  }
  //es el el propietario?
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no válida");
    return res.status(404).json({ msg: error.message });
  }

  //usuario existe?
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createdAt -password -token -updatedAt -__v"
  );
  if (!usuario) {
    const error = new Error("Usuario No Encontrado");
    return res.status(404).json({ msg: error.message });
  }
  // colaborador es admin? ose son la misma persona?
  if (proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error("No te puedes agregar tu mismo xd");
    return res.status(404).json({ msg: error.message });
  }

  //ya esta agregado al proyecto?
  //como esta agregado a un arreglo de colaboraores se usa includes para buscar en cada lugar ese id retorna un boolean
  if (proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error("Este usuario ya esta agregado a este proyecto");
    return res.status(404).json({ msg: error.message });
  }

  //agregando...
  proyecto.colaboradores.push(usuario._id);
  await proyecto.save();
  return res.json({ msg: "Colaborador agregado correctamente" });
};

const eliminarColaborador = async (req, res) => {
  //proyecto existe?
  const proyecto = await Proyecto.findById(req.params.id);
  if (!proyecto) {
    const error = new Error("Proyecto No Encontrado");
    return res.status(404).json({ msg: error.message });
  }
  //es el el propietario?
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no válida");
    return res.status(404).json({ msg: error.message });
  }
  //.pull sirve para sacar un elemento de un array
  proyecto.colaboradores.pull(req.body.id);

  await proyecto.save();
  res.json({ msg: "Colaborador Eliminado correctamente" });
};

export {
  obtenerProyecto,
  obtenerProyectos,
  agregarColaborador,
  eliminarColaborador,
  eliminarProyecto,
  editarProyecto,
  nuevoProyecto,
  buscarColaborador,
};
