import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Importa Link

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Redirige a la página de inicio si ya está autenticado
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const result = await login(email, password);

    if (!result.success) {
      setMessage(`Error: ${result.message}`);
    }
  };

  if (isAuthenticated) {
    return <p>Ya has iniciado sesión. Redirigiendo...</p>;
  }

  return (
    <div className="auth-form-page"> {/* Nuevo contenedor para estas páginas */}
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
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
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
      {message && <p className={message.startsWith('Error:') ? 'error' : 'message'}>{message}</p>}

      {/* Nuevo enlace para regresar a la página de inicio o registro */}
      <div className="auth-links">
        <Link to="/" className="auth-link-button">Página de Inicio</Link>
        <Link to="/register" className="auth-link-button secondary">Registrarse</Link>
      </div>
    </div>
  );
}

export default Login;