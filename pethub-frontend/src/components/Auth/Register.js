import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Importa Link

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role] = useState('user');
  const [message, setMessage] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const result = await register(username, email, password, role);

    if (result.success) {
      setMessage('Registro exitoso! Por favor, inicia sesión.');
      setUsername('');
      setEmail('');
      setPassword('');
      // navigate('/login'); // Ya no necesitamos la redirección automática aquí
    } else {
      setMessage(`Error: ${result.message}`);
    }
  };

  return (
    <div className="auth-form-page"> {/* Nuevo contenedor para estas páginas */}
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
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
      {message && <p className={message.startsWith('Error:') ? 'error' : 'message'}>{message}</p>}

      {/* Nuevo enlace para regresar a la página de inicio o login */}
      <div className="auth-links">
        <Link to="/" className="auth-link-button">Página de Inicio</Link>
        <Link to="/login" className="auth-link-button secondary">Iniciar Sesión</Link>
      </div>
    </div>
  );
}

export default Register;