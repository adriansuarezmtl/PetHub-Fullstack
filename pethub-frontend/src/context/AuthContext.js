import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios'; // Importa nuestra instancia de axios
import { useNavigate } from 'react-router-dom'; // Para redireccionar al usuario

// 1. Crea el Contexto de Autenticación
const AuthContext = createContext(null);

// 2. Crea el Proveedor de Autenticación (AuthContextProvider)
export const AuthContextProvider = ({ children }) => {
  // Estado para guardar la información del usuario logueado
  const [user, setUser] = useState(null);
  // Estado para guardar el token JWT
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  // Estado para saber si la autenticación está cargando (ej. al verificar el token)
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook para la navegación

  // Efecto para verificar el token al cargar la aplicación
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          // Intenta obtener el perfil del usuario usando el token almacenado
          const response = await api.get('/auth/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setUser(response.data.user); // Si el token es válido, establece el usuario
          // console.log('Token verificado, usuario cargado:', response.data.user);
        } catch (error) {
          console.error('Error al verificar el token:', error.response?.data?.message || error.message);
          // Si el token es inválido/expirado, limpia el token y el usuario
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false); // Termina la carga
    };

    verifyToken();
  }, [token]); // Dependencia del token: se ejecuta cuando el token cambia

  // Función para registrar un usuario
  const register = async (username, email, password, role = 'user') => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { username, email, password, role });
      setLoading(false);
      return { success: true, message: response.data.message };
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || 'Error en el registro';
      return { success: false, message: errorMessage };
    }
  };

  // Función para iniciar sesión
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const newToken = response.data.token;
      const userData = response.data.user;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setLoading(false);
      navigate('/'); // Redirige al usuario a la página de inicio
      return { success: true, message: response.data.message };
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || 'Error en el inicio de sesión';
      return { success: false, message: errorMessage };
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  // Valor que se proveerá a los componentes que usen el contexto
  const contextValue = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {loading ? (
        <p>Cargando autenticación...</p>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// 3. Hook personalizado para usar el contexto de autenticación fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};