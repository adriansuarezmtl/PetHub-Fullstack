const fs = require('fs'); // Módulo para trabajar con el sistema de archivos
const path = require('path'); // Módulo para trabajar con rutas de archivos
const Sequelize = require('sequelize'); // Importa Sequelize
const basename = path.basename(__filename); // Obtiene el nombre del archivo actual
const env = process.env.NODE_ENV || 'development'; // Define el entorno (desarrollo por defecto)
// Carga la configuración de la base de datos según el entorno
const config = require(__dirname + '/../config/config.js')[env];
const db = {}; // Objeto que contendrá nuestros modelos y la conexión a la base de datos

let sequelize;
// Si la configuración usa una variable de entorno para la base de datos, úsala
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // Si no, usa la configuración normal (nombre, usuario, contraseña, etc.)
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Lee todos los archivos en la carpeta 'models' (excepto index.js)
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    // Importa cada archivo de modelo y lo añade al objeto db
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Si un modelo tiene una función 'associate' (para relaciones entre tablas), la llama
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize; // Guarda la instancia de Sequelize en db
db.Sequelize = Sequelize; // Guarda la clase Sequelize en db

module.exports = db; // Exporta el objeto db para que otras partes de la aplicación lo usen