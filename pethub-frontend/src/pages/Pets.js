import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Pets() {
  // Estados para la lista y el UI
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPet, setEditingPet] = useState(null);

  // Estados para el formulario de creación/edición de mascota
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');

  // Contexto de autenticación
  const { token, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Función para obtener las mascotas del backend
  const fetchPets = async () => {
    setError(null);
    try {
      const response = await api.get('/pets', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPets(response.data.pets);
    } catch (err) {
      console.error('Error al cargar mascotas:', err);
      setError('Error al cargar las mascotas. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar las mascotas cuando el componente se monta o cuando el token cambia
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (token) {
      fetchPets();
    } else {
      setLoading(false);
      setError('No estás autenticado para ver las mascotas.');
    }
  }, [isAuthenticated, token, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingPet) {
        const response = await api.put(`/pets/${editingPet.id}`, { name, species, breed, age }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Mascota actualizada:', response.data.pet);
        setEditingPet(null);
      } else {
        const response = await api.post('/pets', { name, species, breed, age }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Mascota creada:', response.data.pet);
      }
      setName('');
      setSpecies('');
      setBreed('');
      setAge('');
      fetchPets();
    } catch (err) {
      console.error('Error al guardar mascota:', err.response?.data?.message || err.message);
      setError(`Error al guardar mascota: ${err.response?.data?.message || 'Error desconocido'}`);
    }
  };

  const handleEditClick = (pet) => {
    setEditingPet(pet);
    setName(pet.name);
    setSpecies(pet.species);
    setBreed(pet.breed || '');
    setAge(pet.age || '');
  };

  const handleCancelEdit = () => {
    setEditingPet(null);
    setName('');
    setSpecies('');
    setBreed('');
    setAge('');
  };

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
        fetchPets();
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
    return <p className="error">{error}</p>;
  }

  if (!isAuthenticated && !loading) {
    return null;
  }

  const isUserAdmin = user?.role === 'admin';

  return (
    <div>
      <h2>Gestionar Mascotas</h2>

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
        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : (editingPet ? 'Actualizar Mascota' : 'Registrar Mascota')}
        </button>
        {editingPet && <button type="button" onClick={handleCancelEdit}>Cancelar Edición</button>}
      </form>

      <h3>Mis Mascotas {isUserAdmin && '(todas las mascotas)'}</h3>
      {pets.length === 0 ? (
        <p>No hay mascotas registradas aún.</p>
      ) : (
        <ul>
          {pets.map((pet) => (
            <li key={pet.id}>
              {pet.name} ({pet.species}, {pet.breed || 'N/A'}, {pet.age || 'N/A'}{isUserAdmin && ` - Dueño: ${pet.owner?.username || 'Desconocido'}`})
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