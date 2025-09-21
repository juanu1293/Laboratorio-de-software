// controllers/userController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser,findUserByEmail } = require("../models/userModel");

const SECRET_KEY = process.env.JWT_SECRET || "missecretoseguro";

const registerUser = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      fecha_nacimiento,
      lugar_nacimiento,
      direccion_facturacion,
      genero,
      correo,
      contrasena,
      foto,
      cedula,
    } = req.body;

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    // Llamar al modelo
    const newUser = await createUser({
      nombre,
      apellido,
      fecha_nacimiento,
      lugar_nacimiento,
      direccion_facturacion,
      genero,
      correo,
      contrasena: hashedPassword,
      foto,
      cedula,
    });

    res.status(201).json({
      mensaje: "Usuario registrado con éxito",
      usuario: newUser,
    });
  } catch (error) {
    console.error("Error en registerUser:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    // Buscar usuario
    const user = await findUserByEmail(correo);
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

    // Validar contraseña
    const validPassword = await bcrypt.compare(contrasena, user.contrasena);
    if (!validPassword) return res.status(401).json({ error: "Contraseña incorrecta" });

    // Crear token con info del usuario
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        correo: user.correo,
        tipo_usuario: user.tipo_usuario,
      },
      SECRET_KEY,
      { expiresIn: "1h" } // 👈 expira en 1 hora
    );

    res.status(200).json({
      mensaje: "Login exitoso",
      token, // 👈 ahora enviamos el token
      usuario: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        tipo_usuario: user.tipo_usuario,
      },
    });
  } catch (error) {
    console.error("Error en loginUser:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const updateUserController = async (req, res) => {
  try {
    // 👇 El id del usuario viene del token, ya que en el login guardamos `id_usuario`
    const userId = req.user.id_usuario;
    const { nombre, apellido, cedula, fecha_nacimiento, telefono, correo } = req.body;

    const updatedUser = await updateUser(userId, {
      nombre,
      apellido,
      cedula,
      fecha_nacimiento,
      telefono,
      correo
    });

    res.json({
      mensaje: "Usuario actualizado con éxito",
      usuario: updatedUser
    });
  } catch (error) {
    console.error("Error en updateUserController:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

module.exports = { registerUser, loginUser, updateUserController };