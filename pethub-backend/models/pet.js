module.exports = (sequelize, DataTypes) => {
  const Pet = sequelize.define('Pet', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    species: { // Especie (ej. "perro", "gato", "pájaro")
      type: DataTypes.STRING,
      allowNull: false
    },
    breed: { // Raza (ej. "Labrador", "Siames")
      type: DataTypes.STRING,
      allowNull: true // Puede ser nulo si no se conoce la raza
    },
    age: { // Edad de la mascota
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // Foreign Key (clave foránea) para asociar la mascota con un usuario
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { // Referencia a la tabla 'Users'
        model: 'Users', // Nombre de la tabla a la que se refiere (plural)
        key: 'id' // Columna en la tabla 'Users' a la que se refiere
      }
    }
  });

  Pet.associate = (models) => {
    // Una mascota pertenece a un solo usuario (Many-to-One)
    Pet.belongsTo(models.User, {
      foreignKey: 'userId', // La clave foránea en la tabla 'Pets' es 'userId'
      as: 'owner' // Alias para cuando recuperemos los datos (ej. pet.owner)
    });
    // Una mascota puede tener muchas citas (One-to-Many)
    Pet.hasMany(models.Appointment, {
      foreignKey: 'petId', // El campo 'petId' en la tabla 'Appointments'
      as: 'appointments'
    });
  };

  return Pet;
};