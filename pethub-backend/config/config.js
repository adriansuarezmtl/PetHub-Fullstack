require('dotenv').config(); // Carga variables de entorno

module.exports = {
  "development": { // Configuración para cuando estás programando (desarrollo)
    "username": process.env.DB_USER, // Usuario de la base de datos
    "password": process.env.DB_PASSWORD, // Contraseña de la base de datos
    "database": process.env.DB_DATABASE, // Nombre de la base de datos
    "host": process.env.DB_HOST, // Dirección donde está la base de datos (localhost significa tu propia computadora)
    "dialect": "postgres" // Tipo de base de datos que estamos usando (PostgreSQL)
  },
  "test": { // Configuración para pruebas (podemos ignorarla por ahora)
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE + "_test",
    "host": process.env.DB_HOST,
    "dialect": "postgres"
  },
  "production": { // Configuración para cuando la aplicación esté en línea (producción)
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE + "_production",
    "host": process.env.DB_HOST,
    "dialect": "postgres"
  }
};