import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]); // Necesitamos las mascotas para el selector en el formulario de cita
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const { token, user } = useAuth(); // Obtén el token y el usuario (para rol)

  // Estados para el formulario de creación/edición de cita
  const [selectedPetId, setSelectedPetId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');

  // Función para obtener las mascotas del usuario (o todas si es admin)
  // Esto es necesario para que el usuario pueda seleccionar una mascota al crear una cita
  const fetchPetsForSelection = async () => {
    try {
      const response = await api.get('/pets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPets(response.data.pets);
    } catch (err) {
      console.error('Error al cargar mascotas para selección:', err);
      setError('Error al cargar mascotas disponibles.');
    }
  };

  // Función para obtener las citas
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data.appointments);
    } catch (err) {
      console.error('Error al cargar citas:', err);
      setError('Error al cargar las citas. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos al montar el componente
  useEffect(() => {
    if (token) {
      fetchPetsForSelection(); // Carga las mascotas para el selector
      fetchAppointments(); // Carga las citas
    } else {
      setLoading(false);
      setError('No estás autenticado para ver las citas.');
    }
  }, [token]);

  // Función para manejar el envío del formulario (crear o editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingAppointment) {
        // Lógica para editar cita existente (SOLO ADMIN)
        // No permitimos cambiar petId al editar
        const response = await api.put(`/appointments/${editingAppointment.id}`, { date, time, description }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Cita actualizada:', response.data.appointment);
        setEditingAppointment(null);
      } else {
        // Lógica para crear nueva cita
        if (!selectedPetId) {
            setError('Por favor, selecciona una mascota para la cita.');
            return;
        }
        const response = await api.post('/appointments', { petId: selectedPetId, date, time, description }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Cita creada:', response.data.appointment);
      }
      // Limpia el formulario y recarga las citas
      setSelectedPetId('');
      setDate('');
      setTime('');
      setDescription('');
      fetchAppointments(); // Recarga la lista
    } catch (err) {
      console.error('Error al guardar cita:', err.response?.data?.message || err.message);
      setError(`Error al guardar cita: ${err.response?.data?.message || 'Error desconocido'}`);
    }
  };

  // Función para iniciar el modo de edición
  const handleEditClick = (appointment) => {
    setEditingAppointment(appointment);
    setSelectedPetId(appointment.petId); // Mantener el petId para visualización (no se edita)
    setDate(appointment.date);
    setTime(appointment.time);
    setDescription(appointment.description || '');
  };

  // Función para cancelar el modo de edición
  const handleCancelEdit = () => {
    setEditingAppointment(null);
    setSelectedPetId('');
    setDate('');
    setTime('');
    setDescription('');
  };

  // Función para eliminar una cita
  const handleDelete = async (appointmentId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      setError(null);
      try {
        await api.delete(`/appointments/${appointmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Cita eliminada:', appointmentId);
        fetchAppointments(); // Recarga la lista
      } catch (err) {
        console.error('Error al eliminar cita:', err.response?.data?.message || err.message);
        setError(`Error al eliminar cita: ${err.response?.data?.message || 'Error desconocido'}`);
      }
    }
  };

  if (loading) {
    return <p>Cargando citas...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  const isUserAdmin = user?.role === 'admin';

  return (
    <div>
      <h2>Gestionar Citas</h2>

      {/* Formulario para Crear Cita (y Editar si es admin) */}
      <h3>{editingAppointment ? 'Editar Cita (Solo Admin)' : 'Programar Nueva Cita'}</h3>
      {editingAppointment && !isUserAdmin && (
          <p style={{color: 'orange'}}>Solo los administradores pueden editar citas.</p>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Mascota:</label>
          <select
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
            required
            disabled={editingAppointment && !isUserAdmin} // Deshabilita la selección de mascota al editar (y si no es admin)
          >
            <option value="">Selecciona una mascota</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name} ({pet.species}) - Dueño: {pet.owner?.username || 'Tú'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Fecha:</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <label>Hora:</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </div>
        <div>
          <label>Descripción (opcional):</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3"></textarea>
        </div>
        <button type="submit" disabled={loading || (editingAppointment && !isUserAdmin)}>
          {loading ? 'Guardando...' : (editingAppointment ? 'Actualizar Cita' : 'Programar Cita')}
        </button>
        {editingAppointment && <button type="button" onClick={handleCancelEdit}>Cancelar Edición</button>}
      </form>

      {/* Lista de Citas */}
      <h3>Citas Programadas {isUserAdmin && '(todas las citas)'}</h3>
      {appointments.length === 0 ? (
        <p>No hay citas programadas aún.</p>
      ) : (
        <ul>
          {appointments.map((app) => (
            <li key={app.id}>
              Mascota: {app.pet?.name || 'Desconocida'} - Fecha: {app.date} Hora: {app.time}
              {app.description && ` - ${app.description}`}
              {isUserAdmin && ` - Dueño Mascota: ${app.pet?.owner?.username || 'Desconocido'}`}
              {/* Botones de acción solo si es admin o si el usuario es dueño y no está en modo edición (para no mostrar editar/eliminar a user)*/}
              {isUserAdmin && ( // Solo admin puede editar y eliminar
                  <>
                    <button onClick={() => handleEditClick(app)}>Editar</button>
                    <button onClick={() => handleDelete(app.id)}>Eliminar</button>
                  </>
              )}
              {!isUserAdmin && app.pet?.userId === user?.id && ( // Usuario normal solo puede ver sus citas
                  <span style={{marginLeft: '10px', color: 'gray'}}> (Solo admin puede editar/eliminar)</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Appointments;