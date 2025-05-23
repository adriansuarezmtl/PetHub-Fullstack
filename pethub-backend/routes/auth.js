const express = require('express');
const router = express.Router(); // Creamos un "mini-aplicación" de rutas
const { registerUser, loginUser, getProfile } = require('../controllers/authController'); // Importa las funciones del controlador
const { protect } = require('../middleware/authMiddleware'); // Importa el middleware de protección

// Ruta para registrar un nuevo usuario
// POST a /api/auth/register
router.post('/register', registerUser);

// Ruta para iniciar sesión
// POST a /api/auth/login
router.post('/login', loginUser);

// Ruta para obtener el perfil del usuario autenticado
// GET a /api/auth/profile
// Esta ruta está protegida, solo usuarios autenticados pueden acceder
router.get('/profile', protect, getProfile);

module.exports = router; // Exporta el router para usarlo en server.js