import React, { useState, useEffect } from 'react';
import api from '../api/axios'; // Importa tu instancia de axios
import { useAuth } from '../context/AuthContext'; // Para obtener el token del usuario

function Pets() {
  const [pets, setPets] = useState([]); // Estado para guardar la lista de mascotas
  const [loading, setLoading] = useState(true); // Estado para la carga de datos
  const [error, setError] = useState(null); // Estado para manejar errores
  const [editingPet, setEditingPet] = useState(null); // Estado para la mascota que se está editando
  const { token, user } = useAuth(); // Obtiene el token y la información del usuario logueado

  // Estados para el formulario de creación/edición
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');

  // Función para obtener las mascotas del backend
  const fetchPets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/pets', {
        headers: {
          Authorization: `Bearer ${token}` // Envía el token en la cabecera de autorización
        }
      });
      setPets(response.data.pets); // Actualiza el estado con las mascotas recibidas
    } catch (err) {
      console.error('Error al cargar mascotas:', err);
      setError('Error al cargar las mascotas. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar las mascotas cuando el componente se monta o cuando el token cambia
  useEffect(() => {
    if (token) { // Asegúrate de que haya un token antes de intentar cargar
      fetchPets();
    } else {
      setLoading(false); // Si no hay token, no hay nada que cargar
      setError('No estás autenticado para ver las mascotas.');
    }
  }, [token]); // Vuelve a cargar si el token cambia (ej. después del login)

  // Función para manejar el envío del formulario (crear o editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingPet) {
        // Lógica para editar mascota existente
        const response = await api.put(`/pets/${editingPet.id}`, { name, species, breed, age }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Mascota actualizada:', response.data.pet);
        setEditingPet(null); // Sale del modo edición
      } else {
        // Lógica para crear nueva mascota
        const response = await api.post('/pets', { name, species, breed, age }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Mascota creada:', response.data.pet);
      }
      // Limpia el formulario y recarga las mascotas
      setName('');
      setSpecies('');
      setBreed('');
      setAge('');
      fetchPets(); // Recarga la lista para mostrar los cambios
    } catch (err) {
      console.error('Error al guardar mascota:', err.response?.data?.message || err.message);
      setError(`Error al guardar mascota: ${err.response?.data?.message || 'Error desconocido'}`);
    }
  };

  // Función para iniciar el modo de edición
  const handleEditClick = (pet) => {
    setEditingPet(pet); // Establece la mascota a editar
    setName(pet.name);
    setSpecies(pet.species);
    setBreed(pet.breed || ''); // Si breed es nulo, establece cadena vacía
    setAge(pet.age || ''); // Si age es nulo, establece cadena vacía
  };

  // Función para cancelar el modo de edición
  const handleCancelEdit = () => {
    setEditingPet(null);
    setName('');
    setSpecies('');
    setBreed('');
    setAge('');
  };

  // Función para eliminar una mascota
  const handleDelete = async (petId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta mascota?')) {
      setError(null);
      try {
        await api.delete(`/pets/${petId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Mascota eliminada:', petId);
        fetchPets(); // Recarga la lista
      } catch (err) {
        console.error('Error al eliminar mascota:', err.response?.data?.message || err.message);
        setError(`Error al eliminar mascota: ${err.response?.data?.message || 'Error desconocido'}`);
      }
    }
  };

  if (loading) {
    return <p>Cargando mascotas...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h2>Gestionar Mascotas</h2>

      {/* Formulario para Crear/Editar Mascota */}
      <h3>{editingPet ? 'Editar Mascota' : 'Registrar Nueva Mascota'}</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Especie:</label>
          <input type="text" value={species} onChange={(e) => setSpecies(e.target.value)} required />
        </div>
        <div>
          <label>Raza (opcional):</label>
          <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} />
        </div>
        <div>
          <label>Edad (opcional):</label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <button type="submit">
          {loading ? 'Guardando...' : (editingPet ? 'Actualizar Mascota' : 'Registrar Mascota')}
        </button>
        {editingPet && <button type="button" onClick={handleCancelEdit}>Cancelar Edición</button>}
      </form>

      {/* Lista de Mascotas */}
      <h3>Mis Mascotas {user?.role === 'admin' && '(todas las mascotas)'}</h3>
      {pets.length === 0 ? (
        <p>No hay mascotas registradas aún.</p>
      ) : (
        <ul>
          {pets.map((pet) => (
            <li key={pet.id}>
              {pet.name} ({pet.species}, {pet.breed || 'N/A'}, {pet.age || 'N/A'}{user?.role === 'admin' && ` - Dueño: ${pet.owner?.username || 'Desconocido'}`})
              <button onClick={() => handleEditClick(pet)}>Editar</button>
              <button onClick={() => handleDelete(pet.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Pets;