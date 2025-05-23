// Importamos el módulo bcryptjs para encriptar contraseñas
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  // Definimos el modelo 'User'. 'sequelize' es la instancia de conexión a la DB,
  // 'DataTypes' nos ayuda a especificar los tipos de datos de las columnas.
  const User = sequelize.define('User', {
    // Definimos las columnas (atributos) de nuestra tabla de usuarios
    id: {
      type: DataTypes.INTEGER, // Tipo de dato: número entero
      primaryKey: true, // Es la clave principal (identificador único)
      autoIncrement: true, // Se incrementa automáticamente (1, 2, 3...)
      allowNull: false // No puede ser nulo (obligatorio)
    },
    username: {
      type: DataTypes.STRING, // Tipo de dato: cadena de texto
      allowNull: false,
      unique: true // Debe ser único (no puede haber dos usuarios con el mismo username)
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { // Validaciones para el email
        isEmail: true // Asegura que el formato sea de email válido
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'), // Tipo de dato: enumeración (solo 'user' o 'admin')
      defaultValue: 'user', // Valor por defecto si no se especifica
      allowNull: false
    }
  }, {
    // Opciones adicionales del modelo
    hooks: { // 'Hooks' son funciones que se ejecutan en momentos específicos (antes/después de una acción)
      // Antes de que un usuario sea creado o actualizado, encripta la contraseña
      beforeCreate: async (user) => {
        if (user.password) {
          // Genera un "salt" (cadena aleatoria) para añadir a la contraseña antes de encriptarla
          const salt = await bcrypt.genSalt(10); // 10 es la complejidad del encriptado
          // Encripta la contraseña con el salt
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) { // Solo encripta si la contraseña ha cambiado
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Método para comparar contraseñas
  // Este método se añadirá a cada instancia de usuario y permitirá verificar si una contraseña ingresada
  // coincide con la contraseña encriptada almacenada.
  User.prototype.validPassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  // Definimos las asociaciones (relaciones) con otros modelos
  User.associate = (models) => {
    // Un usuario puede tener muchas mascotas (One-to-Many)
    // El 'foreignKey' indica qué columna en la tabla 'Pets' referenciará al 'id' del 'User'.
    User.hasMany(models.Pet, {
      foreignKey: 'userId', // El campo 'userId' en la tabla 'Pets'
      as: 'pets' // Alias para cuando recuperemos los datos (ej. user.pets)
    });
  };

  return User; // Retornamos el modelo User
};