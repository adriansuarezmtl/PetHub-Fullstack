import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Estilos globales
import App from './App';
import { AuthContextProvider } from './context/AuthContext'; // Proveedor de Contexto de Autenticación
import { BrowserRouter as Router } from 'react-router-dom'; // Router para la navegación

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* El Router debe envolver al AuthContextProvider */}
    <Router>
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </Router>
  </React.StrictMode>
);