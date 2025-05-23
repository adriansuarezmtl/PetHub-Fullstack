const jwt = require('jsonwebtoken'); // Para verificar tokens
const db = require('../models');      // Para acceder al modelo User
const User = db.User;

// Middleware para proteger rutas (verificar si el usuario está autenticado)
exports.protect = async (req, res, next) => {
  let token;

  // 1. Verifica si hay un token en los encabezados de autorización
  // El token se suele enviar como "Bearer TOKEN_AQUI"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extrae el token (quita "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // Verifica el token usando la clave secreta
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Busca al usuario en la base de datos (sin la contraseña)
      // y lo adjunta al objeto 'req' para que esté disponible en las rutas
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] } // Excluye la contraseña por seguridad
      });

      // Pasa al siguiente middleware o a la función de la ruta
      next();

    } catch (error) {
      console.error('Error de autenticación:', error);
      // Si el token es inválido o ha expirado, devuelve un error 401 (Unauthorized)
      return res.status(401).json({ message: 'No autorizado, token fallido o expirado.' });
    }
  }

  // Si no hay token, devuelve un error 401
  if (!token) {
    return res.status(401).json({ message: 'No autorizado, no hay token.' });
  }
};

// Middleware para restringir acceso por roles
exports.authorize = (roles = []) => { // Recibe un array de roles permitidos (ej. ['admin'])
  // Si un solo rol es pasado (ej. 'admin'), lo convierte a un array para estandarizar
  if (typeof roles === 'string') {
    roles = [roles];
  }

  // Devuelve una función middleware
  return (req, res, next) => {
    // req.user.role viene del middleware 'protect'
    // Si no se especifican roles, o si el rol del usuario está incluido en los roles permitidos
    if (roles.length === 0 || (req.user && roles.includes(req.user.role))) {
      // Pasa al siguiente middleware o a la función de la ruta
      next();
    } else {
      // Si el usuario no tiene el rol permitido, devuelve un error 403 (Forbidden)
      return res.status(403).json({ message: 'Acceso denegado, no tiene los permisos necesarios.' });
    }
  };
};