module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY, // Tipo de dato para solo la fecha (sin hora)
      allowNull: false
    },
    time: {
      type: DataTypes.TIME, // Tipo de dato para solo la hora
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT, // Tipo de dato para texto largo
      allowNull: true // Puede ser nulo si no se da una descripción
    },
    // Foreign Key (clave foránea) para asociar la cita con una mascota
    petId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { // Referencia a la tabla 'Pets'
        model: 'Pets', // Nombre de la tabla a la que se refiere
        key: 'id' // Columna en la tabla 'Pets'
      }
    },
    // Opcional: Podríamos añadir un campo para el veterinario si fuera necesario
    // veterinarianId: { ... }
  });

  Appointment.associate = (models) => {
    // Una cita pertenece a una sola mascota (Many-to-One)
    Appointment.belongsTo(models.Pet, {
      foreignKey: 'petId', // La clave foránea en la tabla 'Appointments' es 'petId'
      as: 'pet' // Alias para cuando recuperemos los datos (ej. appointment.pet)
    });
  };

  return Appointment;
};