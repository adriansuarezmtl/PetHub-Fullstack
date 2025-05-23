const db = require('../models'); // Importa los modelos
const Pet = db.Pet;             // Acceso al modelo Pet
const User = db.User;           // Acceso al modelo User (para validaciones y relaciones)

// 1. Crear una nueva mascota
exports.createPet = async (req, res) => {
  const { name, species, breed, age } = req.body; // Obtiene los datos de la mascota del cuerpo de la petición
  const userId = req.user.id; // El ID del usuario viene del middleware de autenticación (req.user)

  try {
    // Crea la mascota asociándola al ID del usuario autenticado
    const pet = await Pet.create({
      name,
      species,
      breed,
      age,
      userId // Asocia la mascota con el usuario logueado
    });

    res.status(201).json({
      message: 'Mascota registrada exitosamente',
      pet
    });

  } catch (error) {
    console.error('Error al registrar mascota:', error);
    res.status(500).json({ message: 'Error interno del servidor al registrar mascota.' });
  }
};

// 2. Obtener todas las mascotas (para el admin) o solo las del usuario logueado
exports.getAllPets = async (req, res) => {
  try {
    let pets;
    if (req.user.role === 'admin') {
      // Si es admin, obtener todas las mascotas e incluir los datos de su dueño
      pets = await Pet.findAll({
        include: [{
          model: User,
          as: 'owner', // Usamos el alias definido en el modelo Pet
          attributes: ['id', 'username', 'email'] // Solo algunos atributos del dueño
        }]
      });
    } else {
      // Si es un usuario normal, obtener solo sus propias mascotas
      pets = await Pet.findAll({
        where: { userId: req.user.id }
      });
    }

    res.status(200).json({ pets });

  } catch (error) {
    console.error('Error al obtener mascotas:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener mascotas.' });
  }
};

// 3. Obtener una mascota por ID
exports.getPetById = async (req, res) => {
  const { id } = req.params; // El ID de la mascota viene de los parámetros de la URL

  try {
    const pet = await Pet.findByPk(id, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'username', 'email']
      }]
    });

    if (!pet) {
      return res.status(404).json({ message: 'Mascota no encontrada.' });
    }

    // Si no es admin y la mascota no pertenece al usuario logueado, denegar acceso
    if (req.user.role !== 'admin' && pet.userId !== req.user.id) {
      return res.status(403).json({ message: 'Acceso denegado.' });
    }

    res.status(200).json({ pet });

  } catch (error) {
    console.error('Error al obtener mascota por ID:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener mascota.' });
  }
};

// 4. Actualizar una mascota por ID
exports.updatePet = async (req, res) => {
  const { id } = req.params; // ID de la mascota a actualizar
  const { name, species, breed, age } = req.body; // Nuevos datos
  const userId = req.user.id; // ID del usuario autenticado

  try {
    const pet = await Pet.findByPk(id);

    if (!pet) {
      return res.status(404).json({ message: 'Mascota no encontrada.' });
    }

    // Solo el dueño de la mascota o un admin puede actualizarla
    if (req.user.role !== 'admin' && pet.userId !== userId) {
      return res.status(403).json({ message: 'Acceso denegado, no es el dueño de la mascota.' });
    }

    // Actualiza los campos
    pet.name = name || pet.name; // Si 'name' no se proporciona, mantiene el actual
    pet.species = species || pet.species;
    pet.breed = breed || pet.breed;
    pet.age = age || pet.age;

    await pet.save(); // Guarda los cambios en la DB

    res.status(200).json({
      message: 'Mascota actualizada exitosamente',
      pet
    });

  } catch (error) {
    console.error('Error al actualizar mascota:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar mascota.' });
  }
};

// 5. Eliminar una mascota por ID (soft delete)
exports.deletePet = async (req, res) => {
  const { id } = req.params; // ID de la mascota a eliminar
  const userId = req.user.id; // ID del usuario autenticado

  try {
    const pet = await Pet.findByPk(id);

    if (!pet) {
      return res.status(404).json({ message: 'Mascota no encontrada.' });
    }

    // Solo el dueño de la mascota o un admin puede eliminarla
    if (req.user.role !== 'admin' && pet.userId !== userId) {
      return res.status(403).json({ message: 'Acceso denegado, no es el dueño de la mascota.' });
    }

    // Implementación de soft delete: Añadir una columna 'deletedAt' al modelo Pet
    // Por ahora, haremos un borrado físico para simplificar.
    // Si necesitas soft delete, tendríamos que modificar el modelo Pet con 'paranoid: true'
    await pet.destroy(); // Borrado físico de la mascota

    res.status(200).json({ message: 'Mascota eliminada exitosamente.' });

  } catch (error) {
    console.error('Error al eliminar mascota:', error);
    res.status(500).json({ message: 'Error interno del servidor al eliminar mascota.' });
  }
};