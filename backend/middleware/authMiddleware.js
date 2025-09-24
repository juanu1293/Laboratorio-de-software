const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "un_secreto_seguro";

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token requerido" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido o expirado" });
    req.user = user; // 👈 guarda datos del usuario en la request
    next();
  });
}

module.exports = verifyToken;
