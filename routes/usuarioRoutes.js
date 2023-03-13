import express from 'express'
import {registrar,autenticar,confirmar,olvidePassword,comprobarToken,nuevoPassword,perfil} from '../controllers/usuarioController.js'
import checkAuth from '../middleware/authMiddleware.js'
const router = express.Router()

//Autenticacion,Registro y Confirmacion de Usuarios
router.post('/',registrar)//para registrar
router.post('/login',autenticar)//autentica el usuario
router.get('/confirmar/:token',confirmar)
router.post('/olvide-password',olvidePassword)
router.get('/olvide-password/:token',comprobarToken)
router.post('/olvide-password/:token',nuevoPassword)

//perfil
router.get('/perfil',checkAuth,perfil)


export default router