const db = require('../models'); // Importa los modelos
const Appointment = db.Appointment; // Acceso al modelo Appointment
const Pet = db.Pet;                 // Acceso al modelo Pet (para validaciones y relaciones)
const User = db.User;               // Acceso al modelo User (para validaciones y relaciones)
const { Op } = require('sequelize'); // Para usar operadores como Op.and, Op.eq, etc.

// Función auxiliar para verificar si una mascota pertenece al usuario
const isOwnerOfPet = async (userId, petId) => {
  const pet = await Pet.findByPk(petId);
  return pet && pet.userId === userId;
};

// 1. Crear una nueva cita
exports.createAppointment = async (req, res) => {
  const { petId, date, time, description } = req.body;
  const userId = req.user.id; // ID del usuario autenticado
  const userRole = req.user.role; // Rol del usuario autenticado

  try {
    // Validar si la mascota existe y pertenece al usuario (si no es admin)
    const pet = await Pet.findByPk(petId);
    if (!pet) {
      return res.status(404).json({ message: 'Mascota no encontrada.' });
    }
    if (userRole !== 'admin' && pet.userId !== userId) {
      return res.status(403).json({ message: 'Acceso denegado. La mascota no le pertenece.' });
    }

    // Crear la cita
    const appointment = await Appointment.create({
      petId,
      date,
      time,
      description
    });

    res.status(201).json({
      message: 'Cita creada exitosamente',
      appointment
    });

  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear cita.' });
  }
};

// 2. Obtener todas las citas (admin) o solo las del usuario (user)
exports.getAllAppointments = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let appointments;
    if (userRole === 'admin') {
      // Si es admin, obtener todas las citas
      appointments = await Appointment.findAll({
        include: [{
          model: Pet,
          as: 'pet',
          include: [{
            model: User,
            as: 'owner',
            attributes: ['id', 'username', 'email']
          }]
        }]
      });
    } else {
      // Si es un usuario normal, obtener solo sus citas a través de sus mascotas
      appointments = await Appointment.findAll({
        include: [{
          model: Pet,
          as: 'pet',
          where: { userId: userId } // Filtra por las mascotas del usuario
        }]
      });
    }

    res.status(200).json({ appointments });

  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener citas.' });
  }
};

// 3. Obtener una cita por ID
exports.getAppointmentById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const appointment = await Appointment.findByPk(id, {
      include: [{
        model: Pet,
        as: 'pet',
        include: [{
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email']
        }]
      }]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada.' });
    }

    // Si no es admin y la mascota de la cita no pertenece al usuario logueado, denegar acceso
    if (userRole !== 'admin' && appointment.pet.userId !== userId) {
      return res.status(403).json({ message: 'Acceso denegado.' });
    }

    res.status(200).json({ appointment });

  } catch (error) {
    console.error('Error al obtener cita por ID:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener cita.' });
  }
};

// 4. Actualizar una cita por ID (SOLO ADMIN PUEDE ACTUALIZAR)
exports.updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { date, time, description } = req.body;
  const userRole = req.user.role; // Rol del usuario

  // Solo el admin puede actualizar citas
  if (userRole !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Solo los administradores pueden actualizar citas.' });
  }

  try {
    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada.' });
    }

    // Actualizar campos
    appointment.date = date || appointment.date;
    appointment.time = time || appointment.time;
    appointment.description = description || appointment.description;

    await appointment.save();

    res.status(200).json({
      message: 'Cita actualizada exitosamente',
      appointment
    });

  } catch (error) {
    console.error('Error al actualizar cita:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar cita.' });
  }
};

// 5. Eliminar una cita por ID (SOLO ADMIN PUEDE ELIMINAR)
exports.deleteAppointment = async (req, res) => {
  const { id } = req.params;
  const userRole = req.user.role; // Rol del usuario

  // Solo el admin puede eliminar citas
  if (userRole !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Solo los administradores pueden eliminar citas.' });
  }

  try {
    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada.' });
    }

    await appointment.destroy(); // Borrado físico de la cita

    res.status(200).json({ message: 'Cita eliminada exitosamente.' });

  } catch (error) {
    console.error('Error al eliminar cita:', error);
    res.status(500).json({ message: 'Error interno del servidor al eliminar cita.' });
  }
};