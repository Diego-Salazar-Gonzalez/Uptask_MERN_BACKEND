import mongoose from "mongoose";
import bcrypt from "bcrypt"
const usuarioScheme = mongoose.Schema({
    nombre:{
        type: String,
        required: true,
        trim: true
    },
    password:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    token:{
        type: String,

    },
    confirmado:{
        type: Boolean,
        default: false
    }
},{
    timestamps: true//para que coloque cuando se creo este registro y actualizo
})
//.pre('save') ejecuta antes que se guarden los datos
usuarioScheme.pre('save', async function(next){
    if(!this.isModified('password')){//previene que se hashee la cadena hasheada si se actualiza el usuario
        next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)
})

usuarioScheme.methods.comprobarPassword = async function(passwordFormulario){
    return await bcrypt.compare(passwordFormulario,this.password)
}

const Usuario = mongoose.model("Usuario",usuarioScheme)
export default Usuario