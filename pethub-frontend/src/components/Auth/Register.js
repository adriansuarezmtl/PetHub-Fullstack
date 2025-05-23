import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Importa el hook del contexto de auth
import { useNavigate } from 'react-router-dom'; // Para redireccionar

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Por defecto, el rol es 'user'
  const [message, setMessage] = useState(''); // Para mostrar mensajes al usuario
  const { register, loading } = useAuth(); // Accede a la función register y al estado loading del contexto
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    setMessage(''); // Limpia mensajes anteriores

    // Llamamos a la función register del contexto
    const result = await register(username, email, password, role);

    if (result.success) {
      setMessage('Registro exitoso! Por favor, inicia sesión.');
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('user');
      navigate('/login'); // Redirige al login después de un registro exitoso
    } else {
      setMessage(`Error: ${result.message}`);
    }
  };

  return (
    <div>
      <h2>Registrarse</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {/* Opcional: Permitir seleccionar el rol, aunque por defecto es 'user' */}
        {/*
        <div>
          <label>Rol:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">Usuario</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        */}
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
      {message && <p>{message}</p>} {/* Muestra el mensaje si existe */}
    </div>
  );
}

export default Register;