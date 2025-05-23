import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthContextProvider } from './context/AuthContext'; // Importa el proveedor de contexto
import { BrowserRouter as Router } from 'react-router-dom'; // <<-- IMPORTA BrowserRouter AQUÍ

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* El Router debe envolver al AuthContextProvider */}
    <Router> {/* <<-- AÑADE ESTO */}
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </Router> {/* <<-- AÑADE ESTO */}
  </React.StrictMode>
);