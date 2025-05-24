import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setUser(response.data.user);
        } catch (error) {
          console.error('Error al verificar el token:', error.response?.data?.message || error.message);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

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
      navigate('/');
      return { success: true, message: response.data.message };
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || 'Error en el inicio de sesión';
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};