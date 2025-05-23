const express = require('express');
const router = express.Router();
const { createPet, getAllPets, getPetById, updatePet, deletePet } = require('../controllers/petController'); // Importa las funciones del controlador
const { protect, authorize } = require('../middleware/authMiddleware'); // Importa los middlewares de autenticación y autorización

// Todas estas rutas estarán protegidas y requerirán que el usuario esté autenticado.

// POST /api/pets - Crear una nueva mascota (solo usuarios autenticados)
router.post('/', protect, createPet);

// GET /api/pets - Obtener todas las mascotas (admin) o solo las del usuario (user)
router.get('/', protect, getAllPets);

// GET /api/pets/:id - Obtener una mascota por ID (solo el dueño o admin)
router.get('/:id', protect, getPetById);

// PUT /api/pets/:id - Actualizar una mascota por ID (solo el dueño o admin)
router.put('/:id', protect, updatePet);

// DELETE /api/pets/:id - Eliminar una mascota por ID (solo el dueño o admin)
router.delete('/:id', protect, deletePet);

module.exports = router; // Exporta el router