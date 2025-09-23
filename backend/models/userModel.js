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

const updateUser = async (id, data) => {
  const query = `
    UPDATE usuario
    SET nombre = $1,
        apellido = $2,
        cedula = $3,
        fecha_nacimiento = $4,
        telefono = $5,
        correo = $6
        direccion_facturacion = $7
    WHERE id_usuario = $8
    RETURNING id_usuario, nombre, apellido, correo, cedula, telefono, fecha_nacimiento, direccion_facturacion;
  `;

  const values = [
    data.nombre,
    data.apellido,
    data.cedula,
    data.fecha_nacimiento,
    data.telefono,
    data.correo,
    data.direccion_facturacion,
    id
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = { createUser, findUserByEmail, updateUser };
