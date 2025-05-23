const express = require('express');
const router = express.Router();
// Importa las funciones del controlador de citas
const { createAppointment, getAllAppointments, getAppointmentById, updateAppointment, deleteAppointment } = require('../controllers/appointmentController');
// Importa los middlewares de autenticación y autorización
const { protect, authorize } = require('../middleware/authMiddleware');

// Todas estas rutas requieren autenticación.

// POST /api/appointments - Crear una nueva cita
// Usuarios y Admin pueden crear citas para sus mascotas.
router.post('/', protect, createAppointment);

// GET /api/appointments - Obtener todas las citas (admin) o solo las del usuario (user)
router.get('/', protect, getAllAppointments);

// GET /api/appointments/:id - Obtener una cita por ID (dueño de la mascota o admin)
router.get('/:id', protect, getAppointmentById);

// PUT /api/appointments/:id - Actualizar una cita por ID
// SOLO ADMIN puede actualizar (usamos el middleware authorize)
router.put('/:id', protect, authorize('admin'), updateAppointment);

// DELETE /api/appointments/:id - Eliminar una cita por ID
// SOLO ADMIN puede eliminar (usamos el middleware authorize)
router.delete('/:id', protect, authorize('admin'), deleteAppointment);

module.exports = router; // Exporta el router