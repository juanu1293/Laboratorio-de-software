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
    foto || null,
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
    foto,
    documento,
    telefono
  } = userData;

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
    RETURNING id_usuario, nombre, apellido, correo, tipo_usuario, foto, cedula, telefono, fecha_nacimiento, genero, direccion_facturacion;
  `;

  const values = [
    nombre,
    apellido,
    fecha_nacimiento || null,
    lugar_nacimiento || null,
    direccion || null,
    genero || null,
    email,
    foto || null,
    documento,
    telefono,
    id_usuario
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
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
