import React from 'react';
import { Routes, Route, Link, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Importamos los componentes de Auth
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';

// Importamos los componentes de Páginas
import Pets from './pages/Pets';
import Appointments from './pages/Appointments';
import Home from './pages/Home';

// --- Componentes de Marcador de Posición y Páginas No Protegidas ---
const NotFoundPage = () => <h2>404 - Página no encontrada</h2>;

// PrivatePage con redirección interna si no autenticado
const PrivatePage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return <p>Redirigiendo al inicio de sesión...</p>;
  }

  return (
    <div>
      <h2>Página Privada</h2>
      {user ? <p>Bienvenido, {user?.username} ({user?.role})!</p> : <p>Debes iniciar sesión para ver esto.</p>}
    </div>
  );
};
// --- Fin Componentes de Marcador de Posición ---


// --- Componente de Header/Navegación (visible solo cuando autenticado) ---
const AppHeader = () => {
  const { user, isAuthenticated, logout } = useAuth();

  // Este header solo se mostrará si el usuario está autenticado
  if (!isAuthenticated) return null; // No mostrar si no hay sesión

  return (
    <nav className="app-header-nav">
      <ul>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/pets">Mis Mascotas</Link></li>
        <li><Link to="/appointments">Mis Citas</Link></li>
        <li><Link to="/private">Área Privada</Link></li>
        <li>
          <button onClick={logout} className="logout-button">
            Cerrar Sesión ({user?.username})
          </button>
        </li>
      </ul>
    </nav>
  );
};
// --- Fin AppHeader ---


// --- Componente de Layout para Rutas Protegidas ---
const AuthenticatedLayout = () => {
  // Este layout renderiza el contenido de la ruta anidada
  // La lógica de redirección ya está en cada componente de página (Pets, Appointments, PrivatePage)
  return (
    <>
      <Outlet />
    </>
  );
};
// --- Fin AuthenticatedLayout ---


function App() {
  const { loading } = useAuth();

  if (loading) {
    return <p>Cargando aplicación...</p>;
  }

  return (
    <div className="App">
      <AppHeader />

      <Routes>
        {/* Rutas públicas (sin requisitos de autenticación directa en la ruta) */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas que usarán el AuthenticatedLayout */}
        <Route element={<AuthenticatedLayout />}>
          <Route path="/pets" element={<Pets />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/private" element={<PrivatePage />} />
        </Route>

        {/* Ruta para capturar cualquier URL no definida */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;