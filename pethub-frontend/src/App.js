import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Importamos los componentes de Auth
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';

// Importamos el componente de Mascotas
import Pets from './pages/Pets';

// Importamos el componente de Citas <<-- NUEVA IMPORTACIÓN
import Appointments from './pages/Appointments';

// Páginas de marcador de posición (si no las has creado en archivos separados)
const HomePage = () => <h2>Bienvenido a PetHub!</h2>;
const NotFoundPage = () => <h2>404 - Página no encontrada</h2>;
const PrivatePage = () => {
  const { user } = useAuth();
  return (
    <div>
      <h2>Página Privada</h2>
      {user ? <p>Bienvenido, {user.username} ({user.role})!</p> : <p>Debes iniciar sesión para ver esto.</p>}
    </div>
  );
};

function App() {
  const { user, isAuthenticated, logout, loading } = useAuth();

  // Muestra un indicador de carga mientras el contexto verifica el token al inicio
  if (loading) {
    return <p>Cargando aplicación...</p>;
  }

  return (
    <div className="App">
      <nav>
        <ul>
          <li>
            <Link to="/">Inicio</Link>
          </li>
          {!isAuthenticated && (
            <>
              <li>
                <Link to="/register">Registrarse</Link>
              </li>
              <li>
                <Link to="/login">Iniciar Sesión</Link>
              </li>
            </>
          )}
          {isAuthenticated && (
            <>
              <li>
                <Link to="/pets">Mis Mascotas</Link>
              </li>
              <li>
                <Link to="/appointments">Mis Citas</Link> {/* <<-- NUEVO ENLACE */}
              </li>
              <li>
                <Link to="/private">Área Privada</Link>
              </li>
              <li>
                <button onClick={logout} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: 'inherit' }}>
                  Cerrar Sesión ({user?.username})
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* Rutas protegidas: solo accesibles si el usuario está autenticado */}
        <Route path="/pets" element={isAuthenticated ? <Pets /> : <Login />} />
        <Route path="/appointments" element={isAuthenticated ? <Appointments /> : <Login />} /> {/* <<-- NUEVA RUTA PROTEGIDA */}
        <Route path="/private" element={isAuthenticated ? <PrivatePage /> : <Login />} />
        {/* Ruta para capturar cualquier URL no definida */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;