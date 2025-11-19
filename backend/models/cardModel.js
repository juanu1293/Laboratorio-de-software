const pool = require("../db");

/**
 * Busca todas las tarjetas.
 * CAMBIOS: Sin 'banco', y ahora es 'fecha_expiracion'.
 */
const findCardsByUserId = async (id_usuario) => {
  const query = `
    SELECT idtarjeta, idcliente, numtarjeta, tipo, saldo, 
           fecha_expiracion, cvv, nombrepersona 
    FROM usuario.tarjeta 
    WHERE idcliente = $1 
    ORDER BY idtarjeta
  `;
  const result = await pool.query(query, [id_usuario]);
  return result.rows;
};

/**
 * Agrega una nueva tarjeta.
 * CAMBIOS: Sin 'banco', y ahora es 'fecha_expiracion'.
 */
const createCard = async (data) => {
  const {
    idcliente,
    numtarjeta,
    tipo,
    fecha_expiracion, // Renombrado
    cvv,
    nombrepersona,
  } = data;
  
  // Quitamos 'banco' del INSERT y usamos 'fecha_expiracion'
  const query = `
    INSERT INTO usuario.tarjeta (
      idcliente, numtarjeta, tipo, saldo, 
      fecha_expiracion, cvv, nombrepersona
    ) 
    VALUES ($1, $2, $3, 0, $4, $5, $6) 
    RETURNING *
  `;
  
  const result = await pool.query(query, [
    idcliente,
    numtarjeta,
    tipo,
    fecha_expiracion,
    cvv,
    nombrepersona,
  ]);
  return result.rows[0];
};

const findCardById = async (idtarjeta) => {
  const query = "SELECT * FROM usuario.tarjeta WHERE idtarjeta = $1";
  const result = await pool.query(query, [idtarjeta]);
  return result.rows[0];
};

const updateBalance = async (idtarjeta, nuevoSaldo) => {
  const query = `
    UPDATE usuario.tarjeta 
    SET saldo = $1 
    WHERE idtarjeta = $2 
    RETURNING *
  `;
  const result = await pool.query(query, [nuevoSaldo, idtarjeta]);
  return result.rows[0];
};

module.exports = {
  findCardsByUserId,
  createCard,
  findCardById,
  updateBalance,
};