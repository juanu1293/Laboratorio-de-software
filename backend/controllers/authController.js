// controllers/userController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser,findUserByEmail, updateUser, createAdmin  } = require("../models/userModel");
const nodemailer = require("nodemailer");
const pool = require("../db");

const SECRET_KEY = process.env.JWT_SECRET || "un_secreto_seguro";

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
      telefono
    } = req.body;

    // 🔹 Validar rango de edad
    const birthDate = new Date(fecha_nacimiento);
    const today = new Date();

    // Calcular edad
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18 || age > 80) {
      return res.status(400).json({
        error: "La edad debe estar entre 18 y 80 años"
      });
    }

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
      telefono
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

    let fotoBase64 = null;
    if (user.foto) {
      fotoBase64 = `data:image/jpeg;base64,${Buffer.from(user.foto).toString("base64")}`;
    }

    let fechaFormateada = null;
    if (user.fecha_nacimiento) {
      const fecha = new Date(user.fecha_nacimiento);
      fechaFormateada = fecha.toISOString().split("T")[0]; // 👈 "2002-06-04"
    }

    res.status(200).json({
      mensaje: "Login exitoso",
      token, // 👈 ahora enviamos el token
      usuario: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        tipo_usuario: user.tipo_usuario,
        fecha_nacimiento: fechaFormateada,
        genero: user.genero,
        direccion_facturacion: user.direccion_facturacion,
        cedula: user.cedula,
        telefono: user.telefono,
        foto: fotoBase64
      },
    });
  } catch (error) {
    console.error("Error en loginUser:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const updateUserController = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario; // Del token (authMiddleware)
    const { fecha_nacimiento, foto, ...rest } = req.body;

    // 🔹 Validar rango de edad si el usuario manda fecha de nacimiento
    if (fecha_nacimiento) {
      const birthDate = new Date(fecha_nacimiento);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18 || age > 80) {
        return res.status(400).json({
          error: "La edad debe estar entre 18 y 80 años",
        });
      }
    }

    console.log("Datos recibidos en updateUser:", req.body, "para usuario:", id_usuario);

    // Enviar fotoBuffer junto con el resto de datos
    const updatedUser = await updateUser(id_usuario, {
      ...rest,
      fecha_nacimiento,
      foto // aquí pasa el Base64 tal cual
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json({
      mensaje: "Usuario actualizado con éxito",
      usuario: updatedUser,
    });
  } catch (error) {
    console.error("Error en updateUserController:", error);
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
};

// Recuperar contraseña: enviar correo con link
const forgotPassword = async (req, res) => {
  const { correo } = req.body;
  try {
    const user = await findUserByEmail(correo);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const token = jwt.sign({ correo }, SECRET_KEY, { expiresIn: "15m" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `http://localhost:5173/change-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: correo,
      subject: "Recuperación de contraseña VivaSky",
      html: `<p>Haz clic en el siguiente enlace para cambiar tu contraseña:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>Este enlace expirará en 15 minutos.</p>`,
    });

    res.json({ message: "Correo de recuperación enviado" });
  } catch (err) {
    res.status(500).json({ message: "Error al enviar el correo" });
  }
};

// Cambiar contraseña usando el token
const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const correo = decoded.correo;

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query("UPDATE usuario.usuario SET contrasena = $1 WHERE correo = $2", [hashedPassword, correo]);

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("Error en resetPassword:", err);
    res.status(400).json({ message: "Token inválido o expirado" });
  }
};

// Crear un administrador (solo permitido para Root)
const createAdminController = async (req, res) => {
  try {
    if (req.user.tipo_usuario !== "root") {
      return res.status(403).json({ message: "No tienes permisos para esta acción" });
    }

    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
    }

    // Verificar si ya existe
    const existing = await findUserByEmail(correo);
    if (existing) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    // Crear admin en BD
    const admin = await createAdmin({ correo, contrasena: hashedPassword });

    res.status(201).json({
      message: "Administrador creado exitosamente",
      admin,
    });
  } catch (error) {
    console.error("Error en createAdminController:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Obtener info del usuario logueado
const getCurrentUser = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario; // viene del middleware verifyToken
    const result = await pool.query(
      "SELECT id_usuario, nombre, apellido, correo, tipo_usuario, cedula, telefono FROM usuario.usuario WHERE id_usuario = $1",
      [id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error en getCurrentUser:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = { registerUser, loginUser, updateUserController, forgotPassword, resetPassword, createAdminController, getCurrentUser };