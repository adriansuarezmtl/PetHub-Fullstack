const jwt = require('jsonwebtoken'); // Para crear y verificar tokens
const bcrypt = require('bcryptjs');   // Para comparar contraseñas
const db = require('../models');      // Importa los modelos de la base de datos
const User = db.User;                 // Acceso al modelo User

// Función para generar un token JWT
const generateToken = (id, role) => {
  // El token contendrá el ID del usuario y su rol.
  // Se firma con JWT_SECRET de tus variables de entorno y expira en 1 hora.
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// 1. Lógica para Registrar un nuevo usuario
exports.registerUser = async (req, res) => {
  const { username, email, password, role } = req.body; // Obtiene datos del cuerpo de la petición

  try {
    // Verifica si el usuario ya existe por username o email
    const existingUser = await User.findOne({
      where: {
        // Sequelize permite buscar por OR (username o email)
        [db.Sequelize.Op.or]: [{ username: username }, { email: email }]
      }
    });

    if (existingUser) {
      // Si el usuario ya existe, devuelve un error 400 (Bad Request)
      return res.status(400).json({ message: 'El usuario o email ya están registrados.' });
    }

    // Crea un nuevo usuario en la base de datos.
    // La contraseña se encripta automáticamente gracias al 'hook' que definimos en el modelo User.
    const user = await User.create({ username, email, password, role });

    // Genera un token para el nuevo usuario
    const token = generateToken(user.id, user.role);

    // Devuelve una respuesta exitosa con el token y los datos del usuario (sin la contraseña encriptada)
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    // Si hay un error, lo loguea y devuelve un error 500 (Internal Server Error)
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor al registrar usuario.' });
  }
};

// 2. Lógica para Iniciar Sesión de un usuario
exports.loginUser = async (req, res) => {
  const { email, password } = req.body; // Obtiene email y contraseña del cuerpo de la petición

  try {
    // Busca al usuario por su email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Si el usuario no existe, devuelve un error 400
      return res.status(400).json({ message: 'Credenciales inválidas (email no encontrado).' });
    }

    // Compara la contraseña ingresada con la contraseña encriptada almacenada
    const isMatch = await user.validPassword(password);

    if (!isMatch) {
      // Si las contraseñas no coinciden, devuelve un error 400
      return res.status(400).json({ message: 'Credenciales inválidas (contraseña incorrecta).' });
    }

    // Genera un token para el usuario que ha iniciado sesión
    const token = generateToken(user.id, user.role);

    // Devuelve una respuesta exitosa con el token y los datos del usuario
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.' });
  }
};

// 3. Lógica para obtener el perfil del usuario autenticado
exports.getProfile = async (req, res) => {
  // req.user.id y req.user.role vienen del middleware de autenticación (que haremos luego)
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'role'] // Solo devolvemos estos atributos por seguridad
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener perfil.' });
  }
};