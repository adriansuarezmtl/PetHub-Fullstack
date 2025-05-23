require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para parsear JSON
app.use(express.json());

// Middleware para habilitar CORS <<-- AÑADE ESTA LÍNEA
app.use(cors());

// Importar rutas de autenticación
const authRoutes = require('./routes/auth'); // Asegúrate que la ruta sea correcta

// Usar rutas de autenticación
// Todas las rutas dentro de authRoutes tendrán el prefijo /api/auth
app.use('/api/auth', authRoutes);

// Importar rutas de mascotas
const petRoutes = require('./routes/pets'); // Asegúrate que la ruta sea correcta

// Usar rutas de mascotas
// Todas las rutas dentro de petRoutes tendrán el prefijo /api/pets
app.use('/api/pets', petRoutes);

// Importar rutas de citas
const appointmentRoutes = require('./routes/appointments');

// Usar rutas de citas
// Todas las rutas dentro de appointmentRoutes tendrán el prefijo /api/appointments
app.use('/api/appointments', appointmentRoutes);

// Rutas de prueba (puedes moverla o dejarla, pero ya tendremos rutas más específicas)
app.get('/', (req, res) => {
    res.send('¡Bienvenido a la API de PetHub!');
});

// -------- INICIO DEL CÓDIGO A AÑADIR/DESCOMENTAR --------
const db = require('./models'); // Importa nuestra conexión a la DB y los modelos

// Sincronizar modelos con la base de datos
// Usamos { force: false } para que no borre los datos si las tablas ya existen.
db.sequelize.sync({ force: false })
  .then(() => {
    console.log('Base de datos sincronizada correctamente.');
  })
  .catch(err => {
    console.error('Error al sincronizar la base de datos:', err);
  });
// -------- FIN DEL CÓDIGO A AÑADIR/DESCOMENTAR --------

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor de PetHub ejecutándose en el puerto ${PORT}`);
});