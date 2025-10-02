// models/userModel.js
const pool = require("../db");

// Crear usuario
const createUser = async (userData) => {
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
  } = userData;

  // 🔹 Convertir Base64 a Buffer si viene en ese formato
  let fotoFinal = null;
  if (foto && typeof foto === "string" && foto.startsWith("data:image")) {
    const base64Data = foto.replace(/^data:image\/\w+;base64,/, "");
    fotoFinal = Buffer.from(base64Data, "base64");
  } else if (foto) {
    fotoFinal = foto; // por si en un futuro lo mandas ya como Buffer
  }

  const query = `
    INSERT INTO usuario.usuario
      (nombre, apellido, fecha_nacimiento, lugar_nacimiento, direccion_facturacion, genero, correo, contrasena, foto, tipo_usuario, cedula, telefono)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,'cliente',$10,$11)
    RETURNING id_usuario, nombre, apellido, correo, tipo_usuario
  `;

  const values = [
    nombre,
    apellido,
    fecha_nacimiento,
    lugar_nacimiento,
    direccion_facturacion,
    genero,
    correo,
    contrasena,
    fotoFinal, // 👈 aquí ya va el buffer correcto
    cedula,
    telefono
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Buscar usuario por correo
const findUserByEmail = async (correo) => {
  const result = await pool.query(
    "SELECT * FROM usuario.usuario WHERE correo = $1",
    [correo]
  );
  return result.rows[0];
};

const updateUser = async (id_usuario, userData) => {
  const {
    nombre,
    apellido,
    fecha_nacimiento,
    lugar_nacimiento,
    direccion,
    genero,
    email,
    foto,       // aquí llega ya como Buffer desde el controlador
    documento,
    telefono
  } = userData;

  // 🔹 Obtener los valores actuales del usuario
  const current = await pool.query(
    "SELECT * FROM usuario.usuario WHERE id_usuario = $1",
    [id_usuario]
  );

  if (current.rows.length === 0) {
    throw new Error("Usuario no encontrado");
  }

  const currentData = current.rows[0];

  // 🔹 Usar valor actual si no se envía uno nuevo
  const lugarNacimientoFinal =
    lugar_nacimiento && lugar_nacimiento.trim() !== ""
      ? lugar_nacimiento
      : currentData.lugar_nacimiento;

  // 🔹 Formatear fecha
  let fechaFinal = fecha_nacimiento || currentData.fecha_nacimiento;
  if (fechaFinal) {
    const fecha = new Date(fechaFinal);
    fechaFinal = fecha.toISOString().split("T")[0]; // yyyy-MM-dd
  }

  // 🔹 Si no viene foto nueva, usar la existente
  const fotoFinal = foto !== undefined ? foto : currentData.foto;

  const query = `
    UPDATE usuario.usuario
    SET nombre = $1,
        apellido = $2,
        fecha_nacimiento = $3,
        lugar_nacimiento = $4,
        direccion_facturacion = $5,
        genero = $6,
        correo = $7,
        foto = $8,
        cedula = $9,
        telefono = $10
    WHERE id_usuario = $11
    RETURNING id_usuario, nombre, apellido, correo, tipo_usuario,
              foto, cedula, telefono, fecha_nacimiento,
              genero, direccion_facturacion AS direccion, lugar_nacimiento;
  `;

  const values = [
    nombre || currentData.nombre,
    apellido || currentData.apellido,
    fechaFinal,
    lugarNacimientoFinal,
    direccion || currentData.direccion_facturacion,
    genero || currentData.genero,
    email || currentData.correo,
    fotoFinal,   // 👈 aquí se guarda bien como Buffer o null
    documento || currentData.cedula,
    telefono || currentData.telefono,
    id_usuario
  ];

  const result = await pool.query(query, values);

  if (result.rows.length === 0) return null;

  const updatedUser = result.rows[0];

  // 🔹 Convertir foto a base64 antes de devolver
  if (updatedUser.foto) {
    updatedUser.foto = `data:image/jpeg;base64,${Buffer.from(updatedUser.foto).toString("base64")}`;
  }

  return updatedUser;
};


const createAdmin = async ({ correo, contrasena }) => {
   const query = `
    INSERT INTO usuario.usuario (nombre, correo, contrasena, tipo_usuario)
    VALUES ('Admin', $1, $2, 'administrador')
    RETURNING id_usuario, nombre, correo, tipo_usuario
  `;
  const values = [correo, contrasena];
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = { createUser, findUserByEmail, updateUser, createAdmin };

