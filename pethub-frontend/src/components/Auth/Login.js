import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Importa el hook del contexto de auth
import { useNavigate } from 'react-router-dom'; // Para redireccionar

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // Para mostrar mensajes
  const { login, isAuthenticated, loading } = useAuth(); // Accede a la función login y estados del contexto
  const navigate = useNavigate();

  // Si el usuario ya está autenticado, redirigirlo a la página de inicio
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate('/');
  //   }
  // }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Llamamos a la función login del contexto
    const result = await login(email, password);

    if (!result.success) { // Si el login falló
      setMessage(`Error: ${result.message}`);
    }
    // Si el login fue exitoso, el contexto ya maneja la redirección (en AuthContext.js)
  };

  return (
    <div>
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
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;